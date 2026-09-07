package com.lifevault.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.lifevault.app.data.model.VaultItem
import com.lifevault.app.data.model.VaultItemType
import com.lifevault.app.ui.theme.DarkBackground
import com.lifevault.app.ui.theme.DarkCardBorder
import com.lifevault.app.ui.theme.DarkCardSurface
import com.lifevault.app.ui.theme.DarkSurfaceHover
import com.lifevault.app.ui.theme.IndigoPrimary
import java.util.UUID

@Composable
fun AddEditItemDialog(
    onDismiss: () -> Unit,
    onSaveItem: (VaultItem) -> Unit
) {
    var selectedType by remember { mutableStateOf(VaultItemType.DOCUMENT) }
    var title by remember { mutableStateOf("") }
    var subtitle by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Document • ID") }
    var fullNumber by remember { mutableStateOf("") }
    var fullName by remember { mutableStateOf("") }
    var expiryDate by remember { mutableStateOf("") }
    var costStr by remember { mutableStateOf("") }
    var billingCycle by remember { mutableStateOf("Monthly") }
    var notes by remember { mutableStateOf("") }

    val scrollState = rememberScrollState()

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBackground.copy(alpha = 0.96f))
                .padding(horizontal = 16.dp, vertical = 24.dp)
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(24.dp))
                    .border(1.dp, DarkCardBorder, RoundedCornerShape(24.dp)),
                colors = CardDefaults.cardColors(containerColor = DarkCardSurface)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp)
                        .verticalScroll(scrollState)
                ) {
                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "New Vault Record",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close",
                                tint = Color.White.copy(alpha = 0.7f)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Type Selector Chips
                    Text(
                        text = "RECORD TYPE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.5f)
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        VaultItemType.entries.forEach { type ->
                            val isSelected = selectedType == type
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) IndigoPrimary else DarkSurfaceHover)
                                    .border(
                                        1.dp,
                                        if (isSelected) IndigoPrimary else DarkCardBorder,
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable {
                                        selectedType = type
                                        category = when (type) {
                                            VaultItemType.DOCUMENT -> "Document • ID"
                                            VaultItemType.SUBSCRIPTION -> "Subscription • Software"
                                            VaultItemType.WARRANTY -> "Hardware Warranty"
                                            VaultItemType.BILL -> "Bill • Utility"
                                            VaultItemType.REMINDER -> "Custom Reminder"
                                        }
                                    }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = type.displayName,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) Color.White else Color.White.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Title
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Title * (e.g. Passport, Netflix)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Subtitle
                    OutlinedTextField(
                        value = subtitle,
                        onValueChange = { subtitle = it },
                        label = { Text("Subtitle / Plan (e.g. Standard Plan)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Document Number / Identifier
                    OutlinedTextField(
                        value = fullNumber,
                        onValueChange = { fullNumber = it },
                        label = { Text("Identifier / Number (e.g. A1234567)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Cardholder / Name
                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = { Text("Holder / Name (e.g. John Doe)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Expiry / Renewal Date
                    OutlinedTextField(
                        value = expiryDate,
                        onValueChange = { expiryDate = it },
                        label = { Text("Expiry / Renewal Date (e.g. 15 Oct 2026)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = textFieldColors()
                    )

                    if (selectedType == VaultItemType.SUBSCRIPTION || selectedType == VaultItemType.BILL) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = costStr,
                                onValueChange = { costStr = it },
                                label = { Text("Amount ($)") },
                                modifier = Modifier.weight(1f),
                                colors = textFieldColors()
                            )
                            OutlinedTextField(
                                value = billingCycle,
                                onValueChange = { billingCycle = it },
                                label = { Text("Cycle") },
                                modifier = Modifier.weight(1f),
                                colors = textFieldColors()
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Notes
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Security Notes") },
                        minLines = 3,
                        modifier = Modifier.fillMaxWidth(),
                        colors = textFieldColors()
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Save Button
                    Button(
                        onClick = {
                            if (title.isNotBlank()) {
                                val masked = if (fullNumber.isNotBlank()) {
                                    "•••••" + fullNumber.takeLast(3)
                                } else null

                                val newItem = VaultItem(
                                    id = UUID.randomUUID().toString(),
                                    type = selectedType,
                                    title = title.trim(),
                                    subtitle = subtitle.ifBlank { selectedType.displayName },
                                    category = category,
                                    fullNumber = fullNumber.ifBlank { null },
                                    maskedNumber = masked,
                                    fullName = fullName.ifBlank { null },
                                    expiryDate = expiryDate.ifBlank { null },
                                    cost = costStr.toDoubleOrNull(),
                                    billingCycle = if (costStr.isNotBlank()) billingCycle else null,
                                    notes = notes.ifBlank { null },
                                    status = "active",
                                    urgencyDays = 60,
                                    urgencyText = "In 60 days",
                                    iconName = when (selectedType) {
                                        VaultItemType.DOCUMENT -> "description"
                                        VaultItemType.SUBSCRIPTION -> "subscriptions"
                                        VaultItemType.WARRANTY -> "smartphone"
                                        VaultItemType.BILL -> "receipt"
                                        VaultItemType.REMINDER -> "notifications"
                                    }
                                )
                                onSaveItem(newItem)
                                onDismiss()
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                        shape = RoundedCornerShape(14.dp),
                        enabled = title.isNotBlank()
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = "Add")
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Save Record into Vault",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
private fun textFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = IndigoPrimary,
    unfocusedBorderColor = DarkCardBorder,
    focusedLabelColor = IndigoPrimary,
    unfocusedLabelColor = Color.White.copy(alpha = 0.5f),
    focusedTextColor = Color.White,
    unfocusedTextColor = Color.White
)
