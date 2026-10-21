# CueFlow — Professional Android Teleprompter

<p align="center">
  <img src="src/assets/icon.png" width="120" height="120" alt="CueFlow Logo" style="border-radius: 24px;" />
</p>

<p align="center">
  <strong>An offline-first, professional Android teleprompter designed for flawless speeches, presentations, online meetings, and video creation.</strong>
</p>

<p align="center">
  <a href="https://github.com/shaniraj4587/CueFlow/releases/latest/download/CueFlow-arm64-v8a.apk">
    <img src="https://img.shields.io/badge/Download-APK%20(15%20MB%20Recommended)-00C853?style=for-the-badge&logo=android&logoColor=white" alt="Download APK (15 MB Recommended)" />
  </a>
  <a href="https://github.com/shaniraj4587/CueFlow/releases/latest/download/CueFlow.apk">
    <img src="https://img.shields.io/badge/Download-APK%20(51%20MB%20Universal)-CF5418?style=for-the-badge&logo=android&logoColor=white" alt="Download APK (51 MB Universal)" />
  </a>
  <a href="https://github.com/shaniraj4587/CueFlow/releases/latest">
    <img src="https://img.shields.io/badge/Release-v1.0.0-202631?style=for-the-badge&logo=github&logoColor=white" alt="Latest Release" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Android%207.0%2B-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android Support" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 📥 Download and Install

Anyone with an Android phone or tablet can download and use CueFlow right now for free:

### ⚡ Direct Download
* ⚡ **[Download CueFlow (15 MB Recommended)](https://github.com/shaniraj4587/CueFlow/releases/latest/download/CueFlow-arm64-v8a.apk)** — Best for all modern Android phones & tablets (70% smaller)
* 📦 **[Download CueFlow Universal (51 MB)](https://github.com/shaniraj4587/CueFlow/releases/latest/download/CueFlow.apk)** — Universal package for all Android devices

### 📲 Quick Installation Steps:
1. Tap the **Download CueFlow (15 MB Recommended)** link above on your Android phone or tablet.
2. Once the download finishes, open your **Downloads** folder (or tap the download notification).
3. Tap the downloaded `.apk` file.
4. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and toggle **Allow from this source**.
5. Tap **Install** and then tap **Open**.
6. Enjoy seamless teleprompting!

---

## ✨ Key Features

### 🎙️ Real-Time Voice Follow (Speech Recognition)
* Automatically tracks spoken delivery and scrolls the script at your exact natural speaking speed.
* Continuous 60fps velocity engine with sliding-window Words-Per-Minute (WPM) calculation.
* Pauses smoothly when you take a pause, and glides forward as you speak.
* Supports **English** and **Hindi (`hi-IN`)** speech recognition models.
* Audio is processed strictly in real-time on-device; no recordings are ever saved or transmitted.

### 📐 Interactive Resizable Floating Teleprompter
* **Floating Window Overlay**: Floats directly on top of your favourite camera, Zoom, Microsoft Teams, Google Meet, or video recording app.
* **Continuous Drag Resize Handle (`↘`)**: Grab and drag the bottom-right corner to freely resize width and height to any custom dimensions.
* **Instant Size Presets (`⤢`)**: 1-tap cycler between **Compact** (280×220), **Standard** (360×320), **Large** (460×420), and **Full Width**.
* **Remembers Your Size**: Custom dimensions are automatically saved to device storage and preserved across sessions.
* **Transparent Background**: Adjustable overlay opacity (20% to 100%) so you can see your subject or meeting attendees underneath.

### 🇮🇳 Full Bilingual Interface (English & हिंदी)
* Complete 1-tap language switching across the entire app.
* Every button, slider, dialog, menu, and status bar updates instantly in real time.
* Devanagari Unicode tokenization preserving all Indic vowel marks (matras, halants, anusvaras).
* Bundled sample scripts in both English and Hindi.

### 📱 Samsung Galaxy Tab S9 FE & Tablet Optimization
* **Responsive Layouts**: Dynamic multi-column responsive grid on tablet screens.
* **Proportional Scroll Anchoring**: Rotating between portrait and landscape preserves exact percentage reading position with zero jumps.
* **Reading Margins**: Constrained reading column (`maxWidth: 860`) prevents wide lines from stretching awkwardly across large 11"–14" tablet screens.

### 👓 Professional Reading & Mirror Modes
* **Mirror Mode (Horizontal Flip)**: Flip text horizontally for beam-splitter prompter glass rigs.
* **Pacing Controls**: Adjustable scrolling speed (1x–20x), countdown before playback (0–10s), and deliberate blank-line pause durations.
* **Custom Typography**: Dynamic text size (18–72pt), line height, letter spacing, font style (Modern, Mono, Serif), and text alignment.
* **Reading Guides**: Highlight window, focal guide line, or subtle reading band.

### 🔒 100% Privacy & Zero Ads
* **No Advertisements**: Completely free with zero ads or tracking SDKs.
* **100% Offline Local Storage**: All scripts are saved directly on your device storage. No account required, no cloud sync, no tracking.
* **Zero Camera Permissions**: The app does not access your camera — it is built to run alongside your favorite recording device or camera app.

---

## 🛠️ Tech Stack & Architecture

* **Framework**: React Native 0.76+ (TypeScript) with Hermes Bytecode Engine
* **Native Android (Kotlin)**:
  * `FloatingTeleprompterService.kt`: WindowManager-based interactive overlay with multi-touch drag resizing, gesture controls, and SharedPreferences persistence.
  * `VoiceFollowModule.kt`: Android `SpeechRecognizer` integration with resilient Samsung engine timeout recovery and language selection.
  * `FileAccessModule.kt`: Android Storage Access Framework (SAF) document picker for `.txt` file imports/exports.
  * `KeepAwakeModule.kt`: Window flag wake-lock manager for presentations.
* **State Management**: Reactive global publish/subscribe architecture for synchronous multi-screen updates.
* **Testing**: Comprehensive Jest test suite with 100% pass rate (32/32 tests).

---

## 💻 Local Development Setup

To build and run CueFlow locally on your machine:

### Prerequisites:
* Node.js 18+ and npm
* Android Studio with Android SDK (API 34)
* Java Development Kit (JDK 17)

### Steps:
```bash
# Clone the repository
git clone https://github.com/shaniraj4587/CueFlow.git
cd CueFlow

# Install dependencies
npm install

# Run unit tests
npm test

# Run on connected Android device or emulator
npm run android
```

### Build Production Release APK:
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📄 Privacy Policy

CueFlow values user privacy above all else. Review our complete [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details:
* Scripts remain strictly on your physical device.
* Audio data from Voice Follow is processed in real time and never stored, saved, or uploaded.
* No cameras, analytics, or external trackers are utilized.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
