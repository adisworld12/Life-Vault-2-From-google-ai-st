package com.lifevault.app.data.local

import com.lifevault.app.data.model.BillingRecord
import com.lifevault.app.data.model.ReminderStep
import com.lifevault.app.data.model.VaultItem
import com.lifevault.app.data.model.VaultItemType

object DefaultData {
    const val PASSPORT_SCAN_URL =
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1_08VkaeaFyarpB4c0ogcOyxn2NYnAm8cWTxocRtbMy-7k4TL4el4s1bRkWGmJNhbefz9E7kSUe0HjpN5WEGcPd-JACncLxaT4MnukxoHiMCX-9T9VqecTsIvXUPSVqYm_lsEacJM04f-MreIfVMetNLnSgnBS64-cOBePCGY9DtLsWN_40vQC0Ojua4mDnYHOjagSLgUFcO_CdR_TS0Ydm_nQNi1w0DUHIluE384Z7UR2CYsqJcK"

    val INITIAL_ITEMS = listOf(
        VaultItem(
            id = "item-passport",
            type = VaultItemType.DOCUMENT,
            title = "Passport",
            subtitle = "Primary Identification Document",
            category = "Document • ID",
            maskedNumber = "•••••678",
            fullNumber = "A123456789",
            fullName = "John Doe",
            status = "attention",
            urgencyDays = 24,
            urgencyText = "Expires in 24 days",
            urgencyLabel = "Oct 20, 2024",
            issueDate = "10/05/2018",
            expiryDate = "14 March 2028",
            notes = "Used for European trip 2019. Visa pages 12-14 stamped.",
            scanImageUrl = PASSPORT_SCAN_URL,
            iconName = "flight_takeoff",
            tags = listOf("VAULTED", "IDENTITY"),
            reminders = listOf(
                ReminderStep(
                    id = "rem-1",
                    daysBefore = 180,
                    dateStr = "15 Sep 2027",
                    label = "180 days before expiry",
                    status = "completed"
                ),
                ReminderStep(
                    id = "rem-2",
                    daysBefore = 90,
                    dateStr = "14 Dec 2027",
                    label = "90 days before expiry",
                    description = "Recommended time to begin renewal process to ensure continuity of travel.",
                    status = "active"
                ),
                ReminderStep(
                    id = "rem-3",
                    daysBefore = 30,
                    dateStr = "12 Feb 2028",
                    label = "30 days before expiry",
                    status = "upcoming"
                )
            ),
            createdAt = "2023-01-15T10:00:00Z"
        ),
        VaultItem(
            id = "item-adobe",
            type = VaultItemType.SUBSCRIPTION,
            title = "Adobe Creative Cloud",
            subtitle = "All Apps Plan",
            category = "Subscription • Software",
            maskedNumber = "•••••992",
            fullNumber = "CC-99214-SUB",
            status = "attention",
            urgencyDays = 2,
            urgencyText = "Renews in 2 days — $59.99",
            urgencyLabel = "Sep 28, 2024",
            nextRenewalText = "Tomorrow",
            cost = 59.99,
            currency = "$",
            billingCycle = "Monthly Subscription",
            smartReminderEnabled = true,
            iconName = "subscriptions",
            tags = listOf("ACTIVE", "SOFTWARE"),
            billingHistory = listOf(
                BillingRecord(
                    id = "bill-1",
                    dateStr = "Oct 14, 2023",
                    paymentMethod = "Visa ending in 4242",
                    amount = 59.99,
                    status = "Paid"
                ),
                BillingRecord(
                    id = "bill-2",
                    dateStr = "Sep 14, 2023",
                    paymentMethod = "Visa ending in 4242",
                    amount = 59.99,
                    status = "Paid"
                ),
                BillingRecord(
                    id = "bill-3",
                    dateStr = "Aug 14, 2023",
                    paymentMethod = "Visa ending in 4242",
                    amount = 59.99,
                    status = "Paid"
                )
            ),
            createdAt = "2023-04-10T08:30:00Z"
        ),
        VaultItem(
            id = "item-dl",
            type = VaultItemType.DOCUMENT,
            title = "Driving License",
            subtitle = "ID Document",
            category = "ID Document",
            maskedNumber = "•••••421",
            fullNumber = "DL-88421900",
            fullName = "Arif Rahman",
            status = "active",
            urgencyDays = 124,
            urgencyText = "124 days",
            issueDate = "03/12/2021",
            expiryDate = "15 Jan 2027",
            notes = "State issued driver license Class C with Real ID endorsement.",
            iconName = "directions_car",
            tags = listOf("VAULTED", "ID"),
            createdAt = "2023-05-20T14:15:00Z"
        ),
        VaultItem(
            id = "item-warranty",
            type = VaultItemType.WARRANTY,
            title = "Phone Warranty",
            subtitle = "Hardware",
            category = "Hardware",
            maskedNumber = "•••••88X",
            fullNumber = "IMEI-35892100988X",
            status = "active",
            urgencyDays = 182,
            urgencyText = "182 days",
            issueDate = "11/10/2023",
            expiryDate = "11 Oct 2025",
            notes = "AppleCare+ 2-year coverage against accidental damage.",
            iconName = "smartphone",
            tags = listOf("HARDWARE", "WARRANTY"),
            createdAt = "2023-10-12T11:00:00Z"
        ),
        VaultItem(
            id = "item-insurance",
            type = VaultItemType.DOCUMENT,
            title = "Health Insurance",
            subtitle = "Policy",
            category = "Policy",
            maskedNumber = "•••••77A",
            fullNumber = "POL-9920177A",
            fullName = "Arif Rahman",
            status = "active",
            urgencyDays = 247,
            urgencyText = "247 days",
            issueDate = "01/01/2024",
            expiryDate = "31 Dec 2025",
            notes = "Comprehensive Silver Health PPO Plan with dental and vision.",
            iconName = "health_and_safety",
            tags = listOf("INSURANCE", "HEALTH"),
            createdAt = "2024-01-02T09:00:00Z"
        ),
        VaultItem(
            id = "item-internet",
            type = VaultItemType.BILL,
            title = "Internet Bill",
            subtitle = "Fiber 1Gbps",
            category = "Bill • Utilities",
            maskedNumber = "•••••512",
            cost = 89.99,
            currency = "$",
            status = "active",
            urgencyDays = 3,
            urgencyText = "Due in 3 days",
            nextRenewalText = "In 3 days",
            iconName = "receipt",
            tags = listOf("UTILITY", "BILL"),
            createdAt = "2024-02-01T10:00:00Z"
        ),
        VaultItem(
            id = "item-lease",
            type = VaultItemType.DOCUMENT,
            title = "Lease Agreement",
            subtitle = "Apartment 4B",
            category = "Document • Legal",
            maskedNumber = "•••••104",
            status = "vaulted",
            notes = "Residential tenancy contract signed with CityView Properties.",
            iconName = "description",
            tags = listOf("LEGAL", "VAULTED"),
            createdAt = "2024-02-15T12:00:00Z"
        )
    )
}
