# Privacy Policy for PMPTR Teleprompter

**Last updated: October 20, 2026**

PMPTR Teleprompter ("we", "our", or "the application") is committed to protecting your privacy. This Privacy Policy explains our data practices, permissions usage, and offline-first design.

---

### 1. Zero Data Collection & Offline-First Design
- **No Remote Servers**: PMPTR Teleprompter operates 100% locally on your device. We do not operate external user databases or script storage servers.
- **No User Accounts**: The application requires no sign-up, login, email address, or identity verification.
- **No Advertising or Analytics**: We do not include any advertising SDKs, tracking pixels, device fingerprinting, or analytics frameworks.
- **Scripts Remain On-Device**: All scripts created, edited, imported, or prompted remain exclusively stored in your device's private local storage.

---

### 2. Permissions & How They Are Used
We follow the principle of least privilege. We only request permissions when you explicitly interact with corresponding features:

#### A. Microphone Permission (`RECORD_AUDIO`)
- **When requested**: Only when you explicitly enable the **Voice Follow** feature.
- **Purpose**: To convert spoken words into text tokens in real time to match against your script and automatically scroll the teleprompter at your natural speech pace.
- **Data handling**: Audio data is processed in real time and is immediately discarded. No audio recordings or transcripts are ever stored, written to disk, or sent to any server.

#### B. Display Over Other Apps Permission (`SYSTEM_ALERT_WINDOW`)
- **When requested**: Only when you explicitly tap **Launch Floating Teleprompter**.
- **Purpose**: To display a floating, resizable, movable teleprompter window over third-party camera or video conferencing applications while recording.
- **Data handling**: Used exclusively for window management.

#### C. Storage Access Framework (`READ/WRITE Documents`)
- **When requested**: Only when you choose to import or export a `.txt` or `.md` script file via the Android system file picker.
- **Purpose**: Access is restricted strictly to the single document you choose.

#### D. Camera Functionality
- **NO Camera Permission**: PMPTR Teleprompter **does NOT request camera permission** and **does NOT access your device camera**. The application is designed to display speech scripts while you record using your device's built-in camera app, third-party meeting apps, or external hardware cameras.

---

### 3. Google Play Data Safety Declarations
- **Data Collected**: None.
- **Data Shared with Third Parties**: None.
- **Data Encrypted in Transit**: Not applicable (no network transmission of user data).
- **Data Retention and Deletion**: All data is saved on the user's device and can be permanently deleted at any time through the app or by clearing app data in Android Settings.

---

### 4. Contact & Inquiries
For questions regarding this application or privacy policy, please reach out via the official project repository.
