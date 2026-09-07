package com.lifevault.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

enum class VaultItemType(val displayName: String, val apiValue: String) {
    DOCUMENT("Document", "document"),
    SUBSCRIPTION("Subscription", "subscription"),
    WARRANTY("Warranty", "warranty"),
    BILL("Bill", "bill"),
    REMINDER("Reminder", "reminder");

    companion object {
        fun fromString(value: String): VaultItemType {
            return entries.firstOrNull { it.apiValue.equals(value, ignoreCase = true) } ?: DOCUMENT
        }
    }
}

data class ReminderStep(
    val id: String = UUID.randomUUID().toString(),
    val daysBefore: Int,
    val dateStr: String,
    val label: String,
    val description: String? = null,
    val status: String = "upcoming" // "completed", "active", "upcoming"
)

data class BillingRecord(
    val id: String = UUID.randomUUID().toString(),
    val dateStr: String,
    val paymentMethod: String,
    val amount: Double,
    val status: String = "Paid" // "Paid", "Pending", "Failed"
)

@Entity(tableName = "vault_items")
data class VaultItem(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val type: VaultItemType,
    val title: String,
    val subtitle: String,
    val category: String,
    val maskedNumber: String? = null,
    val fullNumber: String? = null,
    val fullName: String? = null,
    val brand: String? = null,
    val model: String? = null,
    val serialNumber: String? = null,
    val warrantyDuration: String? = null,
    val status: String = "active", // "active", "attention", "vaulted", "expired"
    val urgencyDays: Int? = null,
    val urgencyText: String? = null,
    val urgencyLabel: String? = null,
    val issueDate: String? = null,
    val expiryDate: String? = null,
    val cost: Double? = null,
    val currency: String? = "$",
    val billingCycle: String? = null,
    val nextRenewalText: String? = null,
    val notes: String? = null,
    val scanImageUrl: String? = null,
    val fileName: String? = null,
    val iconName: String = "description",
    val smartReminderEnabled: Boolean = true,
    val tags: List<String> = emptyList(),
    val reminders: List<ReminderStep> = emptyList(),
    val billingHistory: List<BillingRecord> = emptyList(),
    val createdAt: String = "2024-01-01"
)

data class UserProfile(
    val name: String = "Arif Ahmed",
    val email: String = "arif@email.com",
    val avatarUrl: String = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    val phoneNumber: String = "+1 (555) 789-0123",
    val dateOfBirth: String = "1992-06-18",
    val country: String = "United States",
    val currency: String = "USD ($)",
    val language: String = "English",
    val timeZone: String = "America/New_York (EST)"
)

data class NotificationPreferences(
    val expiryReminders: Boolean = true,
    val subscriptionReminders: Boolean = true,
    val warrantyReminders: Boolean = true,
    val customReminders: Boolean = true
)

data class SecurityPreferences(
    val appLockEnabled: Boolean = true,
    val biometricEnabled: Boolean = true,
    val pinCode: String = "1234",
    val autoLockTimer: String = "1 Minute",
    val hideSensitiveInfo: Boolean = true,
    val cloudSyncEnabled: Boolean = true,
    val lastBackupTime: String = "Today, 14:32 PM",
    val lastSyncTime: String = "Just now",
    val encryptionProtocol: String = "AES-256 (Hardware Enclave)",
    val notifications: NotificationPreferences = NotificationPreferences()
)
