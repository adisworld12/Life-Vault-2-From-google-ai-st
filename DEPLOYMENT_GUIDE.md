# LifeVault: Production Mobile Deployment & Build Guide

This guide outlines the steps to build, package, and deploy **LifeVault** as a production-ready mobile application for Android (Google Play Store) and iOS (Apple App Store).

---

## 1. Architecture Overview

- **Frontend Core**: React 19 + TypeScript + Vite + Tailwind CSS
- **Mobile Runtime**: Capacitor v8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`)
- **Hardware Integrations**:
  - **Camera**: `@capacitor/camera` (Native Camera & Photo Gallery with WebRTC/HTML5 fallback)
  - **Reminders / Notifications**: `@capacitor/local-notifications` (Offline scheduled OS alarms for 180d, 90d, 30d, 14d, 7d, 1d before expiry)
  - **Secure Storage**: `@capacitor/preferences` + Web Crypto AES-256-GCM + PBKDF2
  - **Tactile Feedback**: `@capacitor/haptics`
  - **Lifecycle**: `@capacitor/app`
- **Backend Service**: Express.js with `@google/genai` (Server-side Gemini 2.5 Flash neural vision OCR)

---

## 2. Environment Variables Configuration

Set your environment variables before building:

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-Side | Google Gemini API Key for neural document OCR |
| `VITE_API_BASE_URL` | Mobile / Client | Production backend URL (e.g. `https://api.lifevault.app`) |

Create a `.env` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_BASE_URL=https://api.lifevault.app
```

---

## 3. Building for Android (APK / Google Play AAB)

### Prerequisites:
- **Node.js**: v18 or later
- **Android Studio**: Ladybug / Hedgehog or newer
- **Android SDK & Build Tools**: API 34+ (Target SDK 34 / Minimum SDK 22)
- **Java JDK**: 17+

### Step-by-Step Build:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build Web Assets**:
   ```bash
   npm run build
   ```

3. **Sync Capacitor Android Project**:
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

5. **Generate Release APK / Signed AAB**:
   - In Android Studio, go to **Build > Generate Signed Bundle / APK...**
   - Select **Android App Bundle** (for Google Play Store) or **APK** (for direct distribution).
   - Select or create your keystore file (`.jks` / `.keystore`).
   - Choose `release` build variant and check **V1 (Jar Signature)** and **V2 (Full APK Signature)**.
   - Click **Finish**. Your `.aab` file will be generated in `android/app/release/`.

---

## 4. Building for iOS (Apple App Store)

### Prerequisites:
- **macOS** with Xcode 15+ installed
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Account**

### Step-by-Step Build:

1. **Build Web Assets**:
   ```bash
   npm run build
   ```

2. **Sync Capacitor iOS Project**:
   ```bash
   npx cap sync ios
   ```

3. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

4. **Configure Signing & Capabilities**:
   - Select the `App` target in Xcode.
   - In **Signing & Capabilities**, check **Automatically manage signing** and select your Team.
   - Set your Bundle Identifier (e.g., `app.lifevault.mobile`).

5. **Archive and Upload**:
   - Select **Product > Destination > Any iOS Device (arm64)**.
   - Select **Product > Archive**.
   - When the Organizer window opens, click **Distribute App** to submit directly to App Store Connect / TestFlight.

---

## 5. Native Permissions Configured

### Android (`android/app/src/main/AndroidManifest.xml`):
- `android.permission.CAMERA`
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.POST_NOTIFICATIONS`
- `android.permission.SCHEDULE_EXACT_ALARM`
- `android.permission.USE_BIOMETRIC`
- `android.permission.VIBRATE`

### iOS (`ios/App/App/Info.plist`):
- `NSCameraUsageDescription`: Document scanning for passports, IDs, and warranties.
- `NSPhotoLibraryUsageDescription`: Importing existing document photos.
- `NSFaceIDUsageDescription`: Biometric authentication to unlock your secure vault.

---

## 6. Testing & Verifying Features

- **Real Document Scanner**: Open the scanner tab to capture using your device camera or upload image files/PDFs. If Gemini is configured, it extracts title, document number, dates, and warranties automatically. If unavailable, it provides a clean fallback with manual review.
- **Scheduled Local Notifications**: In **Security & Renewal Alerts**, tap **Test Device Notification** to trigger a native notification on your device.
- **Biometric App Lock**: In **Profile & Security**, enable App Lock with PIN or Face ID / Fingerprint.
