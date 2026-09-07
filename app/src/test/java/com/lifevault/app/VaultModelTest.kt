package com.lifevault.app

import com.lifevault.app.data.local.Converters
import com.lifevault.app.data.local.DefaultData
import com.lifevault.app.data.model.BillingRecord
import com.lifevault.app.data.model.ReminderStep
import com.lifevault.app.data.model.VaultItemType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class VaultModelTest {

    private val converters = Converters()

    @Test
    fun testDefaultDataIntegrity() {
        val items = DefaultData.INITIAL_ITEMS
        assertTrue(items.isNotEmpty())
        assertEquals(7, items.size)

        val passport = items.firstOrNull { it.id == "item-passport" }
        assertNotNull(passport)
        assertEquals("Passport", passport?.title)
        assertEquals(VaultItemType.DOCUMENT, passport?.type)
        assertEquals("John Doe", passport?.fullName)
        assertEquals(3, passport?.reminders?.size)

        val adobe = items.firstOrNull { it.id == "item-adobe" }
        assertNotNull(adobe)
        assertEquals(VaultItemType.SUBSCRIPTION, adobe?.type)
        assertEquals(59.99, adobe?.cost)
        assertEquals(3, adobe?.billingHistory?.size)
    }

    @Test
    fun testStringListConverter() {
        val list = listOf("VAULTED", "IDENTITY", "SECURE")
        val json = converters.fromStringList(list)
        val decoded = converters.toStringList(json)
        assertEquals(list, decoded)
    }

    @Test
    fun testReminderStepsConverter() {
        val steps = listOf(
            ReminderStep(daysBefore = 90, dateStr = "14 Dec 2027", label = "90 days notice", status = "active")
        )
        val json = converters.fromReminderSteps(steps)
        val decoded = converters.toReminderSteps(json)
        assertEquals(1, decoded.size)
        assertEquals(90, decoded[0].daysBefore)
        assertEquals("90 days notice", decoded[0].label)
    }

    @Test
    fun testBillingRecordsConverter() {
        val records = listOf(
            BillingRecord(dateStr = "Oct 14, 2023", paymentMethod = "Visa 4242", amount = 59.99, status = "Paid")
        )
        val json = converters.fromBillingRecords(records)
        val decoded = converters.toBillingRecords(json)
        assertEquals(1, decoded.size)
        assertEquals(59.99, decoded[0].amount, 0.001)
        assertEquals("Paid", decoded[0].status)
    }
}
