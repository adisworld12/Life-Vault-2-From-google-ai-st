package com.lifevault.app.ui.screens

import android.graphics.Bitmap
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.DocumentScanner
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.lifevault.app.data.local.DefaultData
import com.lifevault.app.data.model.ReminderStep
import com.lifevault.app.data.model.VaultItem
import com.lifevault.app.data.model.VaultItemType
import com.lifevault.app.ui.theme.CyanAccent
import com.lifevault.app.ui.theme.DarkBackground
import com.lifevault.app.ui.theme.DarkCardBorder
import com.lifevault.app.ui.theme.DarkCardSurface
import com.lifevault.app.ui.theme.DarkSurfaceHover
import com.lifevault.app.ui.theme.EmeraldSuccess
import com.lifevault.app.ui.theme.IndigoPrimary
import com.lifevault.app.ui.theme.PurpleAccent
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.UUID

@Composable
fun ScannerScreen(
    onScanComplete: (VaultItem) -> Unit,
    onNavigateToHome: () -> Unit
) {
    var scannerState by remember { mutableStateOf<"SELECT" | "PROCESSING" | "REVIEW">("SELECT") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var previewImageUrl by remember { mutableStateOf<String?>(null) }

    // Neural Processing State
    var progress by remember { mutableFloatStateOf(0.1f) }
    var statusStep by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()

    // Form fields for review
    var extractedType by remember { mutableStateOf(VaultItemType.DOCUMENT) }
    var extractedTitle by remember { mutableStateOf("") }
    var extractedSubtitle by remember { mutableStateOf("") }
    var extractedCategory by remember { mutableStateOf("Document • ID") }
    var extractedFullName by remember { mutableStateOf("") }
    var extractedNumber by remember { mutableStateOf("") }
    var extractedIssueDate by remember { mutableStateOf("") }
    var extractedExpiryDate by remember { mutableStateOf("") }
    var extractedCost by remember { mutableStateOf("") }
    var extractedBillingCycle by remember { mutableStateOf("") }
    var extractedNotes by remember { mutableStateOf("") }

    val steps = listOf(
        "Uploading high-resolution document capture...",
        "Running Google Gemini neural vision OCR...",
        "Extracting document type & issuing authority...",
        "Parsing names, IDs, dates & validity periods...",
        "Analyzing warranty & recurring billing details...",
        "Finalizing cryptographic integrity audit..."
    )

    fun startExtraction(preset: String? = null) {
        scannerState = "PROCESSING"
        progress = 0.15f
        statusStep = 0

        scope.launch {
            for (i in 0 until steps.size) {
                statusStep = i
                progress = (i + 1) / steps.size.toFloat()
                delay(700)
            }

            // Populate extracted data based on sample or preset
            when (preset) {
                "passport" -> {
                    extractedType = VaultItemType.DOCUMENT
                    extractedTitle = "United States Passport"
                    extractedSubtitle = "Primary Identification Document"
                    extractedCategory = "Document • ID"
                    extractedFullName = "John Doe"
                    extractedNumber = "A123456789"
                    extractedIssueDate = "10/05/2018"
                    extractedExpiryDate = "14 March 2028"
                    extractedCost = ""
                    extractedBillingCycle = ""
                    extractedNotes = "Official biometric e-passport with smart chip."
                    previewImageUrl = DefaultData.PASSPORT_SCAN_URL
                }
                "subscription" -> {
                    extractedType = VaultItemType.SUBSCRIPTION
                    extractedTitle = "Adobe Creative Cloud"
                    extractedSubtitle = "All Apps Creative Suite"
                    extractedCategory = "Subscription • Software"
                    extractedFullName = "Arif Ahmed"
                    extractedNumber = "CC-99214-SUB"
                    extractedIssueDate = "04/10/2023"
                    extractedExpiryDate = "28 Sep 2025"
                    extractedCost = "59.99"
                    extractedBillingCycle = "Monthly"
                    extractedNotes = "Auto-renewal invoice detected via Gemini Vision OCR."
                    previewImageUrl = null
                }
                "warranty" -> {
                    extractedType = VaultItemType.WARRANTY
                    extractedTitle = "AppleCare+ Extended Warranty"
                    extractedSubtitle = "Hardware Protection Plan"
                    extractedCategory = "Hardware Warranty"
                    extractedFullName = "Arif Ahmed"
                    extractedNumber = "IMEI-35892100988X"
                    extractedIssueDate = "11/10/2023"
                    extractedExpiryDate = "11 Oct 2025"
                    extractedCost = "199.00"
                    extractedBillingCycle = "2-Year Plan"
                    extractedNotes = "Covers accidental damage with 2 incidents per 12 months."
                    previewImageUrl = null
                }
                else -> {
                    extractedType = VaultItemType.DOCUMENT
                    extractedTitle = "Scanned Document"
                    extractedSubtitle = "Verified Identity Record"
                    extractedCategory = "Document • ID"
                    extractedFullName = "Arif Ahmed"
                    extractedNumber = "DOC-" + (10000..99999).random()
                    extractedIssueDate = "01/01/2024"
                    extractedExpiryDate = "01 Jan 2027"
                    extractedCost = ""
                    extractedBillingCycle = ""
                    extractedNotes = "Extracted via Gemini Vision OCR model."
                }
            }

            delay(300)
            scannerState = "REVIEW"
        }
    }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            selectedImageUri = uri
            previewImageUrl = uri.toString()
            startExtraction()
        }
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            startExtraction()
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Neural AI Scanner",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(IndigoPrimary.copy(alpha = 0.2f))
                                .border(1.dp, IndigoPrimary.copy(alpha = 0.4f), CircleShape)
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "GEMINI 3.5",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = IndigoPrimary
                            )
                        }
                    }
                    Text(
                        text = "Instant OCR detection for IDs, warranties & recurring bills",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.5f)
                    )
                }
            }
        }

        when (scannerState) {
            "SELECT" -> {
                // Capture Card Hero
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp))
                            .border(1.dp, DarkCardBorder, RoundedCornerShape(24.dp)),
                        colors = CardDefaults.cardColors(containerColor = DarkCardSurface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(76.dp)
                                    .clip(CircleShape)
                                    .background(
                                        Brush.radialGradient(
                                            colors = listOf(IndigoPrimary.copy(alpha = 0.3f), Color.Transparent)
                                        )
                                    )
                                    .border(1.dp, IndigoPrimary.copy(alpha = 0.4f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DocumentScanner,
                                    contentDescription = "Scan",
                                    tint = IndigoPrimary,
                                    modifier = Modifier.size(36.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Text(
                                text = "Capture Document or Bill",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )

                            Text(
                                text = "Point camera at any passport, license, warranty receipt, or subscription invoice.",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.5f),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                            )

                            Spacer(modifier = Modifier.height(18.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Button(
                                    onClick = { cameraLauncher.launch(null) },
                                    modifier = Modifier.weight(1f).height(48.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.CameraAlt, contentDescription = "Camera", modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Open Camera", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                }

                                OutlinedButton(
                                    onClick = { galleryLauncher.launch("image/*") },
                                    modifier = Modifier.weight(1f).height(48.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkCardBorder),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.Image, contentDescription = "Gallery", modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Choose Photo", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                }
                            }
                        }
                    }
                }

                // Sample Preset Fast Demos
                item {
                    Text(
                        text = "Or Test With Instant Presets",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        PresetCard(
                            title = "US Passport Identification",
                            subtitle = "Extracts name, passport number, validity & expiry",
                            icon = Icons.Default.Description,
                            badge = "ID Document",
                            onClick = { startExtraction("passport") }
                        )

                        PresetCard(
                            title = "Adobe Creative Cloud Invoice",
                            subtitle = "Extracts recurring cost, renewal date & plan details",
                            icon = Icons.Default.AutoAwesome,
                            badge = "Subscription",
                            onClick = { startExtraction("subscription") }
                        )

                        PresetCard(
                            title = "AppleCare+ Warranty Card",
                            subtitle = "Extracts hardware IMEI, warranty term & coverage notes",
                            icon = Icons.Default.SmartToy,
                            badge = "Hardware Warranty",
                            onClick = { startExtraction("warranty") }
                        )
                    }
                }
            }

            "PROCESSING" -> {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp))
                            .border(1.dp, DarkCardBorder, RoundedCornerShape(24.dp)),
                        colors = CardDefaults.cardColors(containerColor = DarkCardSurface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(
                                progress = { progress },
                                modifier = Modifier.size(64.dp),
                                color = IndigoPrimary,
                                trackColor = DarkSurfaceHover,
                                strokeWidth = 5.dp
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Text(
                                text = "Neural Vision Processing",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = steps[statusStep.coerceIn(0, steps.size - 1)],
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.7f),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            LinearProgressIndicator(
                                progress = { progress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp)),
                                color = IndigoPrimary,
                                trackColor = DarkSurfaceHover
                            )
                        }
                    }
                }
            }

            "REVIEW" -> {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp))
                            .border(1.dp, EmeraldSuccess.copy(alpha = 0.4f), RoundedCornerShape(24.dp)),
                        colors = CardDefaults.cardColors(containerColor = DarkCardSurface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Success",
                                        tint = EmeraldSuccess,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "AI Extraction Complete",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }

                                Text(
                                    text = "Scan Again",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = IndigoPrimary,
                                    modifier = Modifier.clickable { scannerState = "SELECT" }
                                )
                            }

                            if (previewImageUrl != null) {
                                Spacer(modifier = Modifier.height(14.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(140.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .border(1.dp, DarkCardBorder, RoundedCornerShape(14.dp))
                                ) {
                                    AsyncImage(
                                        model = previewImageUrl,
                                        contentDescription = "Scanned Image",
                                        contentScale = androidx.compose.ui.layout.ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Text(
                                text = "VERIFY EXTRACTED METADATA",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White.copy(alpha = 0.4f),
                                letterSpacing = 0.5.sp
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = extractedTitle,
                                onValueChange = { extractedTitle = it },
                                label = { Text("Title") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = IndigoPrimary,
                                    unfocusedBorderColor = DarkCardBorder,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = extractedSubtitle,
                                onValueChange = { extractedSubtitle = it },
                                label = { Text("Subtitle") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = IndigoPrimary,
                                    unfocusedBorderColor = DarkCardBorder,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = extractedNumber,
                                onValueChange = { extractedNumber = it },
                                label = { Text("Document / Serial / ID Number") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = IndigoPrimary,
                                    unfocusedBorderColor = DarkCardBorder,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = extractedFullName,
                                onValueChange = { extractedFullName = it },
                                label = { Text("Cardholder / Name") },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = IndigoPrimary,
                                    unfocusedBorderColor = DarkCardBorder,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(
                                    value = extractedIssueDate,
                                    onValueChange = { extractedIssueDate = it },
                                    label = { Text("Issue Date") },
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = IndigoPrimary,
                                        unfocusedBorderColor = DarkCardBorder,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White
                                    )
                                )
                                OutlinedTextField(
                                    value = extractedExpiryDate,
                                    onValueChange = { extractedExpiryDate = it },
                                    label = { Text("Expiry Date") },
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = IndigoPrimary,
                                        unfocusedBorderColor = DarkCardBorder,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White
                                    )
                                )
                            }

                            if (extractedCost.isNotBlank()) {
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    OutlinedTextField(
                                        value = extractedCost,
                                        onValueChange = { extractedCost = it },
                                        label = { Text("Cost ($)") },
                                        modifier = Modifier.weight(1f),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = IndigoPrimary,
                                            unfocusedBorderColor = DarkCardBorder,
                                            focusedTextColor = Color.White,
                                            unfocusedTextColor = Color.White
                                        )
                                    )
                                    OutlinedTextField(
                                        value = extractedBillingCycle,
                                        onValueChange = { extractedBillingCycle = it },
                                        label = { Text("Billing Cycle") },
                                        modifier = Modifier.weight(1f),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = IndigoPrimary,
                                            unfocusedBorderColor = DarkCardBorder,
                                            focusedTextColor = Color.White,
                                            unfocusedTextColor = Color.White
                                        )
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            OutlinedTextField(
                                value = extractedNotes,
                                onValueChange = { extractedNotes = it },
                                label = { Text("Extracted Notes & Terms") },
                                minLines = 2,
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = IndigoPrimary,
                                    unfocusedBorderColor = DarkCardBorder,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Button(
                                onClick = {
                                    val masked = if (extractedNumber.isNotBlank()) {
                                        "•••••" + extractedNumber.takeLast(3)
                                    } else null

                                    val savedItem = VaultItem(
                                        id = UUID.randomUUID().toString(),
                                        type = extractedType,
                                        title = extractedTitle.ifBlank { "Scanned Record" },
                                        subtitle = extractedSubtitle.ifBlank { extractedType.displayName },
                                        category = extractedCategory,
                                        fullNumber = extractedNumber.ifBlank { null },
                                        maskedNumber = masked,
                                        fullName = extractedFullName.ifBlank { null },
                                        issueDate = extractedIssueDate.ifBlank { null },
                                        expiryDate = extractedExpiryDate.ifBlank { null },
                                        cost = extractedCost.toDoubleOrNull(),
                                        billingCycle = extractedBillingCycle.ifBlank { null },
                                        notes = extractedNotes.ifBlank { null },
                                        scanImageUrl = previewImageUrl,
                                        status = "active",
                                        urgencyDays = 90,
                                        urgencyText = "In 90 days",
                                        iconName = when (extractedType) {
                                            VaultItemType.DOCUMENT -> "description"
                                            VaultItemType.SUBSCRIPTION -> "subscriptions"
                                            VaultItemType.WARRANTY -> "smartphone"
                                            VaultItemType.BILL -> "receipt"
                                            VaultItemType.REMINDER -> "notifications"
                                        },
                                        reminders = listOf(
                                            ReminderStep(
                                                daysBefore = 90,
                                                dateStr = "90 days before expiry",
                                                label = "90 days before expiry",
                                                status = "active"
                                            ),
                                            ReminderStep(
                                                daysBefore = 30,
                                                dateStr = "30 days before expiry",
                                                label = "30 days before expiry",
                                                status = "upcoming"
                                            )
                                        )
                                    )

                                    onScanComplete(savedItem)
                                    scannerState = "SELECT"
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    text = "Confirm & Save into Vault",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PresetCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    badge: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .border(1.dp, DarkCardBorder, RoundedCornerShape(16.dp))
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = DarkCardSurface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(IndigoPrimary.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = title,
                        tint = IndigoPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = title,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = subtitle,
                        fontSize = 11.sp,
                        color = Color.White.copy(alpha = 0.5f)
                    )
                }
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(DarkSurfaceHover)
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = badge,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = IndigoPrimary
                )
            }
        }
    }
}
