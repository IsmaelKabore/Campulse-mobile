# Android Studio Setup Guide

## Step 1: Open Project in Android Studio

1. **Launch Android Studio**

2. **Open the Project:**
   - Click "Open" or "File" → "Open"
   - Navigate to: `C:\Users\ismae\Documents\GitHub\campulse-mobile`
   - Select the **root folder** (campulse-mobile), NOT the android folder
   - Click "OK"

3. **Wait for Android Studio to Index:**
   - Android Studio will detect it's a Flutter project
   - It may ask to install Flutter/Dart plugins - click "Yes" if prompted
   - Wait for indexing to complete (bottom right corner)

## Step 2: Install Flutter & Dart Plugins (if needed)

1. **File** → **Settings** (or `Ctrl + Alt + S`)
2. Go to **Plugins**
3. Search for "Flutter" and install it (this will also install Dart)
4. Click "Apply" and restart Android Studio if prompted

## Step 3: Configure Flutter SDK Path

1. **File** → **Settings** → **Languages & Frameworks** → **Flutter**
2. Set **Flutter SDK path** to where Flutter is installed
   - Common locations:
     - `C:\src\flutter`
     - `C:\flutter`
     - Or wherever you installed Flutter
3. Click "Apply"

## Step 4: Sync Gradle

1. Android Studio should automatically detect Gradle files
2. If you see a notification "Gradle files have changed", click **"Sync Now"**
3. Or manually: **File** → **Sync Project with Gradle Files**
4. Wait for sync to complete (check bottom status bar)

## Step 5: Set Up Android Emulator

### Option A: Create New Emulator (if you don't have one)

1. Click the **Device Manager** icon in the toolbar (phone icon)
   - Or: **Tools** → **Device Manager**

2. Click **"Create Device"**

3. **Select Hardware:**
   - Choose a device (e.g., "Pixel 5" or "Pixel 6")
   - Click "Next"

4. **Select System Image:**
   - Choose a recent Android version (API 33 or 34 recommended)
   - If not downloaded, click "Download" next to the version
   - Click "Next"

5. **Verify Configuration:**
   - Name your emulator (e.g., "Pixel_5_API_33")
   - Click "Finish"

### Option B: Use Existing Emulator

1. Open **Device Manager** (phone icon in toolbar)
2. Find your existing emulator
3. Click the **Play button** (▶) to start it
4. Wait for emulator to boot (may take 1-2 minutes)

## Step 6: Run Flutter App

### Method 1: Using Android Studio

1. **Select the emulator** from the device dropdown (top toolbar)
2. Open `lib/main.dart` in the editor
3. Click the **Run button** (green play icon) or press `Shift + F10`
4. Or right-click `main.dart` → **Run 'main.dart'**

### Method 2: Using Terminal in Android Studio

1. Open the **Terminal** tab at the bottom
2. Run:
   ```bash
   flutter devices
   ```
   (Verify your emulator is listed)

3. Run:
   ```bash
   flutter run
   ```

## Step 7: Verify Everything Works

1. **Check for Errors:**
   - Look at the **Run** tab at the bottom
   - Check for any red error messages

2. **Common Issues:**
   - **"Flutter SDK not found"**: Set Flutter SDK path in Settings
   - **"Gradle sync failed"**: Check internet connection, sync again
   - **"No devices found"**: Start emulator first
   - **"Firebase not configured"**: Run `flutterfire configure` in terminal

## Quick Troubleshooting

### Gradle Sync Fails
```bash
# In Android Studio terminal:
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

### Emulator Not Starting
- Check if **Hyper-V** or **Virtualization** is enabled in BIOS
- Try a different emulator image
- Increase emulator RAM in AVD settings

### Flutter Not Detected
- Install Flutter plugin in Android Studio
- Set Flutter SDK path in Settings
- Restart Android Studio

## Recommended Android Studio Settings

1. **File** → **Settings** → **Editor** → **General** → **Auto Import**
   - Check "Add unambiguous imports on the fly"

2. **File** → **Settings** → **Editor** → **Inspections**
   - Enable Dart/Flutter inspections

3. **File** → **Settings** → **Build, Execution, Deployment** → **Build Tools** → **Gradle**
   - Use Gradle from: 'gradle-wrapper.properties' file

## Next Steps After Running

Once the app runs successfully:
1. Test login/signup
2. Create a post
3. Test image upload
4. Navigate between screens

---

**Tip:** You can also run `flutter run` from any terminal (not just Android Studio) once the emulator is running.


