# PMPTR Teleprompter: Testing & Deployment Guide

This guide describes how to install, test, and release the **PMPTR Teleprompter** Android application.

---

## 1. Built Artifacts

The project has compiled both production Android artifacts:

| Artifact | Type | File Location | Purpose |
| :--- | :--- | :--- | :--- |
| **Release APK** | Standalone APK | `android/app/build/outputs/apk/release/app-release.apk` | Direct sideloading on any physical phone or tablet |
| **Debug APK** | Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | Local testing with debug logging |
| **Release AAB** | Android App Bundle | `android/app/build/outputs/bundle/release/app-release.aab` | Google Play Console production upload |

---

## 2. Installing on a Physical Android Phone

### Option A: Via USB with ADB (Quickest)
1. Enable **Developer Options** and **USB Debugging** on your Android device:
   - Go to **Settings > About phone** and tap **Build number** 7 times.
   - Go to **Settings > System > Developer options** and enable **USB debugging**.
2. Connect your phone to your PC with a USB cable.
3. Open a terminal and run:
   ```powershell
   $env:PATH = "C:\Users\shani\AppData\Local\Android\Sdk\platform-tools;$env:PATH"
   adb install -r "C:\AntigravityProject\Pmptr\android\app\build\outputs\apk\release\app-release.apk"
   ```
4. Once installed, tap the **PMPTR Teleprompter** icon on your device's home screen.

### Option B: Sideloading via USB File Transfer or Google Drive
1. Copy `android/app/build/outputs/apk/release/app-release.apk` to your phone's **Downloads** folder (via USB cable or Google Drive / WhatsApp / Email).
2. On your phone, open the **Files** app and tap `app-release.apk`.
3. If prompted, select **Allow from this source** to permit installing apps outside the Play Store.
4. Tap **Install**.

---

## 3. Testing Core Features

### Test 1: Script Library & Creation
1. Launch the app. Notice the sample script is loaded automatically.
2. Tap **+ New Script**. Enter a title and speech text. Notice real-time word count and reading duration calculations update as you type.
3. Tap **Save** (or wait 1.5 seconds for autosave). Tap the back arrow. Verify the new script appears in the library.
4. Test **Duplicate** and **Delete** (with confirmation dialog).

### Test 2: Document Import & Export
1. In the Script Editor, tap **📂 Import File**.
2. Choose any `.txt` or `.md` file from your device storage or Google Drive. Verify the text loads into the editor.
3. Tap **💾 Export**. Verify the document is exported cleanly to device storage.

### Test 3: Full-Screen Teleprompter
1. In the Script Library or Editor, tap **Prompt ▶**.
2. Observe the reading guide overlay, centered script text, and countdown (3, 2, 1).
3. Tap **PLAY**. Observe silky-smooth scrolling at 60fps.
4. Tap **–** or **+** to adjust speed during active scrolling. Notice speed updates immediately without jitter or restarting.
5. Tap anywhere on the reading text to hide top and bottom controls for an immersive distraction-free view. Tap again to reveal controls.
6. Verify scroll position is preserved when paused or exiting.

### Test 4: Floating Teleprompter Overlay (Outside App)
1. On the Teleprompter screen, tap **⧉ Float** (or tap **Launch Test Floating Teleprompter** in Settings > Stage).
2. When prompted, grant Android's **Display over other apps** (`SYSTEM_ALERT_WINDOW`) permission.
3. Observe the floating window appear on screen.
4. Press the phone's **Home** button or open any camera app (e.g. Google Camera, Open Camera, Instagram, Zoom).
5. Drag the floating window by its header bar to reposition it anywhere on your screen.
6. Tap **▶ Play** to scroll the script while recording in your camera app.
7. Test the collapse/expand button, opacity cycle (🌓), and mirror mode (⇄).
8. Tap **↗** to return to the full PMPTR application, or **✕** to dismiss the overlay.

### Test 5: Voice Follow
1. Open **Settings > Voice Follow** and enable the toggle.
2. Grant microphone permission (`RECORD_AUDIO`) when prompted.
3. Open a script in Teleprompter mode.
4. Speak the words displayed on screen.
5. Observe the live audio meter bars react to your voice volume, and watch the teleprompter advance smoothly to follow your spoken sentences.
6. Stop speaking for 3 seconds — observe the teleprompter pause to wait for your voice.

---

## 4. Google Play Console Publication Steps

1. Log into your [Google Play Console](https://play.google.com/console).
2. Create a new application named **PMPTR Teleprompter**.
3. Under **App Content / Data Safety**, fill out the questionnaire using the exact answers documented in `PLAY_STORE_LISTING.md`.
4. Upload `PRIVACY_POLICY.md` or host its content on your website / GitHub Pages and enter the URL in **App Content > Privacy Policy**.
5. Under **Release > Production (or Internal testing)**:
   - Upload the generated App Bundle:
     `android/app/build/outputs/bundle/release/app-release.aab`
   - Release name: `1.0.0`
6. Submit the release for review.
