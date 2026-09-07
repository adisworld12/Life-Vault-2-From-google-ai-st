package com.lifevault.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.lifevault.app.data.model.VaultItemType
import com.lifevault.app.ui.components.AddEditItemDialog
import com.lifevault.app.ui.components.ChangePinDialog
import com.lifevault.app.ui.components.EditProfileDialog
import com.lifevault.app.ui.components.ItemDetailDialog
import com.lifevault.app.ui.components.LifeVaultBottomBar
import com.lifevault.app.ui.components.LifeVaultLockScreen
import com.lifevault.app.ui.components.LifeVaultTopBar
import com.lifevault.app.ui.components.SearchDialog
import com.lifevault.app.ui.screens.AlertsScreen
import com.lifevault.app.ui.screens.HomeScreen
import com.lifevault.app.ui.screens.ProfileSecurityScreen
import com.lifevault.app.ui.screens.ScannerScreen
import com.lifevault.app.ui.screens.VaultScreen
import com.lifevault.app.ui.theme.DarkBackground
import com.lifevault.app.ui.theme.LifeVaultTheme
import com.lifevault.app.ui.viewmodel.VaultViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: VaultViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            LifeVaultTheme {
                LifeVaultApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun LifeVaultApp(viewModel: VaultViewModel) {
    val items by viewModel.items.collectAsState()
    val profile by viewModel.profile.collectAsState()
    val preferences by viewModel.preferences.collectAsState()
    val isLocked by viewModel.isLocked.collectAsState()
    val pinInput by viewModel.pinInput.collectAsState()
    val pinError by viewModel.pinError.collectAsState()
    val activeTab by viewModel.activeTab.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val vaultFilterType by viewModel.vaultFilterType.collectAsState()
    val selectedItem by viewModel.selectedItem.collectAsState()
    val showAddDialog by viewModel.showAddDialog.collectAsState()
    val showSearchDialog by viewModel.showSearchDialog.collectAsState()
    val showEditProfileDialog by viewModel.showEditProfileDialog.collectAsState()
    val showChangePinDialog by viewModel.showChangePinDialog.collectAsState()
    val isSyncing by viewModel.isSyncing.collectAsState()

    val alertCount = items.count {
        it.status == "attention" || (it.urgencyDays != null && it.urgencyDays <= 30)
    }

    Box(modifier = Modifier.fillMaxSize().background(DarkBackground)) {
        if (isLocked) {
            LifeVaultLockScreen(
                pinInput = pinInput,
                pinError = pinError,
                onDigitClick = { digit -> viewModel.onPinDigit(digit) },
                onBackspaceClick = { viewModel.onPinBackspace() },
                onBiometricClick = { viewModel.unlockWithBiometric() }
            )
        } else {
            Scaffold(
                containerColor = DarkBackground,
                topBar = {
                    LifeVaultTopBar(
                        profile = profile,
                        isLockEnabled = preferences.appLockEnabled,
                        onSearchClick = { viewModel.setShowSearchDialog(true) },
                        onLockClick = { viewModel.lockApp() },
                        onProfileClick = { viewModel.selectTab(4) }
                    )
                },
                bottomBar = {
                    LifeVaultBottomBar(
                        currentTab = activeTab,
                        alertCount = alertCount,
                        onTabSelected = { index -> viewModel.selectTab(index) }
                    )
                }
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    AnimatedContent(
                        targetState = activeTab,
                        transitionSpec = { fadeIn() togetherWith fadeOut() },
                        label = "ScreenTransition"
                    ) { tabIndex ->
                        when (tabIndex) {
                            0 -> HomeScreen(
                                items = items,
                                profile = profile,
                                onSelectItem = { item -> viewModel.selectItem(item) },
                                onOpenAddDialog = { viewModel.setShowAddDialog(true) },
                                onNavigateToVault = { type ->
                                    viewModel.setVaultFilterType(type)
                                    viewModel.selectTab(1)
                                },
                                onNavigateToAlerts = { viewModel.selectTab(3) }
                            )

                            1 -> VaultScreen(
                                items = items,
                                searchQuery = searchQuery,
                                selectedFilterType = vaultFilterType,
                                onSearchChange = { q -> viewModel.setSearchQuery(q) },
                                onFilterChange = { type -> viewModel.setVaultFilterType(type) },
                                onSelectItem = { item -> viewModel.selectItem(item) },
                                onOpenAddDialog = { viewModel.setShowAddDialog(true) }
                            )

                            2 -> ScannerScreen(
                                onScanComplete = { newItem ->
                                    viewModel.addItem(newItem)
                                    viewModel.selectItem(newItem)
                                    viewModel.selectTab(1)
                                },
                                onNavigateToHome = { viewModel.selectTab(0) }
                            )

                            3 -> AlertsScreen(
                                items = items,
                                preferences = preferences,
                                onSelectItem = { item -> viewModel.selectItem(item) },
                                onUpdatePreferences = { prefs -> viewModel.updateSecurityPreferences(prefs) }
                            )

                            4 -> ProfileSecurityScreen(
                                profile = profile,
                                preferences = preferences,
                                isSyncing = isSyncing,
                                onEditProfileClick = { viewModel.setShowEditProfileDialog(true) },
                                onChangePinClick = { viewModel.setShowChangePinDialog(true) },
                                onUpdatePreferences = { prefs -> viewModel.updateSecurityPreferences(prefs) },
                                onTriggerSync = { viewModel.triggerCloudSync() },
                                onLockAppNow = { viewModel.lockApp() }
                            )
                        }
                    }
                }
            }
        }

        // Modals & Overlays
        selectedItem?.let { item ->
            ItemDetailDialog(
                item = item,
                hideSensitiveByDefault = preferences.hideSensitiveInfo,
                onDismiss = { viewModel.selectItem(null) },
                onDelete = { itemToDelete -> viewModel.deleteItem(itemToDelete) }
            )
        }

        if (showAddDialog) {
            AddEditItemDialog(
                onDismiss = { viewModel.setShowAddDialog(false) },
                onSaveItem = { newItem -> viewModel.addItem(newItem) }
            )
        }

        if (showSearchDialog) {
            SearchDialog(
                items = items,
                onDismiss = { viewModel.setShowSearchDialog(false) },
                onSelectItem = { item -> viewModel.selectItem(item) }
            )
        }

        if (showEditProfileDialog) {
            EditProfileDialog(
                profile = profile,
                onDismiss = { viewModel.setShowEditProfileDialog(false) },
                onSave = { updatedProfile -> viewModel.updateProfile(updatedProfile) }
            )
        }

        if (showChangePinDialog) {
            ChangePinDialog(
                currentPin = preferences.pinCode,
                onDismiss = { viewModel.setShowChangePinDialog(false) },
                onSavePin = { newPin ->
                    viewModel.updateSecurityPreferences(preferences.copy(pinCode = newPin))
                }
            )
        }
    }
}
