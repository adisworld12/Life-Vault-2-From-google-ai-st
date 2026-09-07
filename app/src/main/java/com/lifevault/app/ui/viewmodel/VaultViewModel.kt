package com.lifevault.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.lifevault.app.data.local.AppDatabase
import com.lifevault.app.data.model.SecurityPreferences
import com.lifevault.app.data.model.UserProfile
import com.lifevault.app.data.model.VaultItem
import com.lifevault.app.data.model.VaultItemType
import com.lifevault.app.data.repository.VaultRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class VaultViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: VaultRepository

    val items: StateFlow<List<VaultItem>>
    val profile: StateFlow<UserProfile>
    val preferences: StateFlow<SecurityPreferences>

    // Navigation & UI state
    private val _activeTab = MutableStateFlow(0) // 0: Home, 1: Vault, 2: Scanner, 3: Alerts, 4: Profile
    val activeTab: StateFlow<Int> = _activeTab.asStateFlow()

    private val _isLocked = MutableStateFlow(false)
    val isLocked: StateFlow<Boolean> = _isLocked.asStateFlow()

    private val _pinInput = MutableStateFlow("")
    val pinInput: StateFlow<String> = _pinInput.asStateFlow()

    private val _pinError = MutableStateFlow(false)
    val pinError: StateFlow<Boolean> = _pinError.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _vaultFilterType = MutableStateFlow<VaultItemType?>(null)
    val vaultFilterType: StateFlow<VaultItemType?> = _vaultFilterType.asStateFlow()

    private val _selectedItem = MutableStateFlow<VaultItem?>(null)
    val selectedItem: StateFlow<VaultItem?> = _selectedItem.asStateFlow()

    private val _showAddDialog = MutableStateFlow(false)
    val showAddDialog: StateFlow<Boolean> = _showAddDialog.asStateFlow()

    private val _showSearchDialog = MutableStateFlow(false)
    val showSearchDialog: StateFlow<Boolean> = _showSearchDialog.asStateFlow()

    private val _showEditProfileDialog = MutableStateFlow(false)
    val showEditProfileDialog: StateFlow<Boolean> = _showEditProfileDialog.asStateFlow()

    private val _showChangePinDialog = MutableStateFlow(false)
    val showChangePinDialog: StateFlow<Boolean> = _showChangePinDialog.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    // Filtered items for Search dialog and Vault tab
    val filteredVaultItems: StateFlow<List<VaultItem>>

    init {
        val database = AppDatabase.getDatabase(application, viewModelScope)
        repository = VaultRepository(database.vaultDao())

        items = repository.allItems.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        profile = repository.userProfile
        preferences = repository.securityPreferences

        // Check if app lock is enabled by default
        _isLocked.value = preferences.value.appLockEnabled

        filteredVaultItems = combine(items, _searchQuery, _vaultFilterType) { allItems, query, filterType ->
            allItems.filter { item ->
                val matchesType = filterType == null || item.type == filterType
                val q = query.trim().lowercase()
                val matchesQuery = q.isEmpty() ||
                        item.title.lowercase().contains(q) ||
                        item.subtitle.lowercase().contains(q) ||
                        item.category.lowercase().contains(q) ||
                        (item.notes != null && item.notes.lowercase().contains(q)) ||
                        (item.fullNumber != null && item.fullNumber.lowercase().contains(q)) ||
                        item.tags.any { it.lowercase().contains(q) }
                matchesType && matchesQuery
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        viewModelScope.launch {
            repository.checkAndSeedInitialData()
        }
    }

    fun selectTab(index: Int) {
        _activeTab.value = index
    }

    fun onPinDigit(digit: String) {
        if (_pinInput.value.length < 4) {
            val nextPin = _pinInput.value + digit
            _pinInput.value = nextPin
            _pinError.value = false
            if (nextPin.length == 4) {
                if (nextPin == preferences.value.pinCode) {
                    _isLocked.value = false
                    _pinInput.value = ""
                } else {
                    _pinError.value = true
                    viewModelScope.launch {
                        delay(600)
                        _pinInput.value = ""
                        _pinError.value = false
                    }
                }
            }
        }
    }

    fun onPinBackspace() {
        if (_pinInput.value.isNotEmpty()) {
            _pinInput.value = _pinInput.value.dropLast(1)
            _pinError.value = false
        }
    }

    fun unlockWithBiometric() {
        _isLocked.value = false
        _pinInput.value = ""
        _pinError.value = false
    }

    fun lockApp() {
        _pinInput.value = ""
        _pinError.value = false
        _isLocked.value = true
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setVaultFilterType(type: VaultItemType?) {
        _vaultFilterType.value = type
    }

    fun selectItem(item: VaultItem?) {
        _selectedItem.value = item
    }

    fun setShowAddDialog(show: Boolean) {
        _showAddDialog.value = show
    }

    fun setShowSearchDialog(show: Boolean) {
        _showSearchDialog.value = show
    }

    fun setShowEditProfileDialog(show: Boolean) {
        _showEditProfileDialog.value = show
    }

    fun setShowChangePinDialog(show: Boolean) {
        _showChangePinDialog.value = show
    }

    fun addItem(item: VaultItem) {
        viewModelScope.launch {
            repository.insertItem(item)
        }
    }

    fun updateItem(item: VaultItem) {
        viewModelScope.launch {
            repository.updateItem(item)
            if (_selectedItem.value?.id == item.id) {
                _selectedItem.value = item
            }
        }
    }

    fun deleteItem(item: VaultItem) {
        viewModelScope.launch {
            repository.deleteItem(item)
            if (_selectedItem.value?.id == item.id) {
                _selectedItem.value = null
            }
        }
    }

    fun updateProfile(newProfile: UserProfile) {
        repository.updateProfile(newProfile)
    }

    fun updateSecurityPreferences(newPrefs: SecurityPreferences) {
        repository.updateSecurityPreferences(newPrefs)
        if (!newPrefs.appLockEnabled) {
            _isLocked.value = false
        }
    }

    fun toggleSensitiveInfo() {
        val current = preferences.value
        updateSecurityPreferences(current.copy(hideSensitiveInfo = !current.hideSensitiveInfo))
    }

    fun triggerCloudSync() {
        viewModelScope.launch {
            _isSyncing.value = true
            delay(1200)
            val current = preferences.value
            updateSecurityPreferences(
                current.copy(
                    lastBackupTime = "Just now",
                    lastSyncTime = "Synced securely"
                )
            )
            _isSyncing.value = false
        }
    }
}
