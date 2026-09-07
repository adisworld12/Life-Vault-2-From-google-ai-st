package com.lifevault.app.data.repository

import com.lifevault.app.data.local.DefaultData
import com.lifevault.app.data.local.VaultDao
import com.lifevault.app.data.model.SecurityPreferences
import com.lifevault.app.data.model.UserProfile
import com.lifevault.app.data.model.VaultItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class VaultRepository(private val vaultDao: VaultDao) {

    val allItems: Flow<List<VaultItem>> = vaultDao.getAllItems()

    private val _userProfile = MutableStateFlow(UserProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile.asStateFlow()

    private val _securityPreferences = MutableStateFlow(SecurityPreferences())
    val securityPreferences: StateFlow<SecurityPreferences> = _securityPreferences.asStateFlow()

    suspend fun checkAndSeedInitialData() {
        val count = vaultDao.getCount()
        if (count == 0) {
            vaultDao.insertAll(DefaultData.INITIAL_ITEMS)
        }
    }

    suspend fun insertItem(item: VaultItem) {
        vaultDao.insertItem(item)
    }

    suspend fun updateItem(item: VaultItem) {
        vaultDao.updateItem(item)
    }

    suspend fun deleteItem(item: VaultItem) {
        vaultDao.deleteItem(item)
    }

    suspend fun deleteItemById(id: String) {
        vaultDao.deleteItemById(id)
    }

    fun updateProfile(profile: UserProfile) {
        _userProfile.value = profile
    }

    fun updateSecurityPreferences(prefs: SecurityPreferences) {
        _securityPreferences.value = prefs
    }
}
