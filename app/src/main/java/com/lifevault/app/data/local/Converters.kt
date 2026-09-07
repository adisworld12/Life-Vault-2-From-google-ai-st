package com.lifevault.app.data.local

import androidx.room.TypeConverter
import com.lifevault.app.data.model.BillingRecord
import com.lifevault.app.data.model.ReminderStep
import com.lifevault.app.data.model.VaultItemType
import org.json.JSONArray
import org.json.JSONObject

class Converters {
    @TypeConverter
    fun fromVaultItemType(value: VaultItemType): String = value.name

    @TypeConverter
    fun toVaultItemType(value: String): VaultItemType = try {
        VaultItemType.valueOf(value)
    } catch (e: Exception) {
        VaultItemType.DOCUMENT
    }

    @TypeConverter
    fun fromStringList(list: List<String>?): String {
        if (list == null) return "[]"
        val array = JSONArray()
        list.forEach { array.put(it) }
        return array.toString()
    }

    @TypeConverter
    fun toStringList(data: String?): List<String> {
        if (data.isNullOrEmpty()) return emptyList()
        return try {
            val array = JSONArray(data)
            val list = mutableListOf<String>()
            for (i in 0 until array.length()) {
                list.add(array.getString(i))
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    @TypeConverter
    fun fromReminderSteps(list: List<ReminderStep>?): String {
        if (list == null) return "[]"
        val array = JSONArray()
        list.forEach { step ->
            val obj = JSONObject()
            obj.put("id", step.id)
            obj.put("daysBefore", step.daysBefore)
            obj.put("dateStr", step.dateStr)
            obj.put("label", step.label)
            obj.put("description", step.description ?: "")
            obj.put("status", step.status)
            array.put(obj)
        }
        return array.toString()
    }

    @TypeConverter
    fun toReminderSteps(data: String?): List<ReminderStep> {
        if (data.isNullOrEmpty()) return emptyList()
        return try {
            val array = JSONArray(data)
            val list = mutableListOf<ReminderStep>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    ReminderStep(
                        id = obj.optString("id"),
                        daysBefore = obj.optInt("daysBefore"),
                        dateStr = obj.optString("dateStr"),
                        label = obj.optString("label"),
                        description = if (obj.has("description")) obj.optString("description") else null,
                        status = obj.optString("status", "upcoming")
                    )
                )
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    @TypeConverter
    fun fromBillingRecords(list: List<BillingRecord>?): String {
        if (list == null) return "[]"
        val array = JSONArray()
        list.forEach { record ->
            val obj = JSONObject()
            obj.put("id", record.id)
            obj.put("dateStr", record.dateStr)
            obj.put("paymentMethod", record.paymentMethod)
            obj.put("amount", record.amount)
            obj.put("status", record.status)
            array.put(obj)
        }
        return array.toString()
    }

    @TypeConverter
    fun toBillingRecords(data: String?): List<BillingRecord> {
        if (data.isNullOrEmpty()) return emptyList()
        return try {
            val array = JSONArray(data)
            val list = mutableListOf<BillingRecord>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    BillingRecord(
                        id = obj.optString("id"),
                        dateStr = obj.optString("dateStr"),
                        paymentMethod = obj.optString("paymentMethod"),
                        amount = obj.optDouble("amount"),
                        status = obj.optString("status", "Paid")
                    )
                )
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }
}
