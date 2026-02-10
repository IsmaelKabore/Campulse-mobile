# FlutterFire Setup Guide

## Problem: Flutter/Dart not in PATH

If you see errors like "flutter is not recognized", you need to add Flutter to your PATH.

## Solution 1: Add Flutter to PATH (Recommended)

### Step 1: Find Flutter Installation

1. Open **File Explorer**
2. Search for `flutter.exe` on your C: drive
3. Common locations:
   - `C:\src\flutter\bin`
   - `C:\flutter\bin`
   - `C:\Users\ismae\flutter\bin`

### Step 2: Add to PATH

1. Press `Win + X` → **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under **User variables**, find **Path** and click **Edit**
5. Click **New** and add the path to Flutter's `bin` folder:
   - Example: `C:\src\flutter\bin`
6. Click **OK** on all dialogs
7. **Restart your terminal/PowerShell**

### Step 3: Verify

Open a **new** PowerShell window and run:
```powershell
flutter --version
```

If it works, proceed to install FlutterFire CLI.

## Solution 2: Use Full Path (Quick Fix)

If you know where Flutter is installed, use the full path:

```powershell
# Replace C:\src\flutter with your actual Flutter path
C:\src\flutter\bin\flutter pub global activate flutterfire_cli
```

## Install FlutterFire CLI

Once Flutter is in PATH, run:

```powershell
flutter pub global activate flutterfire_cli
```

## Add FlutterFire to PATH

After installing, you need to add Flutter's pub cache to PATH:

1. Find your pub cache location:
   ```powershell
   flutter pub cache directory
   ```
   Usually: `C:\Users\ismae\AppData\Local\Pub\Cache\bin`

2. Add it to PATH (same steps as above):
   - Add: `C:\Users\ismae\AppData\Local\Pub\Cache\bin`

3. **Restart terminal**

## Configure Firebase

Now run:

```powershell
flutterfire configure
```

This will:
- Connect to your Firebase project
- Generate `lib/firebase_options.dart`
- Configure Android and iOS

## Alternative: Manual Configuration

If FlutterFire CLI still doesn't work, you can manually configure:

1. **Ensure `google-services.json` is at:**
   - `android/app/google-services.json` ✅ (You already did this)

2. **For iOS, add `GoogleService-Info.plist`:**
   - Download from Firebase Console
   - Place at: `ios/Runner/GoogleService-Info.plist`

3. **The `lib/firebase_options.dart` file** will be generated when you:
   - Open the project in Android Studio
   - Run `flutter pub get`
   - Or manually create it using Firebase Console

## Quick Test

After adding Flutter to PATH, test with:

```powershell
flutter doctor
flutter pub get
flutterfire configure
```

---

**Note:** If you're using Android Studio, you can also run Flutter commands from the built-in terminal, which usually has Flutter in PATH automatically.


