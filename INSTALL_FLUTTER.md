# Install Flutter (If Not Installed)

## Download Flutter

1. Go to: https://flutter.dev/docs/get-started/install/windows
2. Download Flutter SDK
3. Extract to a location like:
   - `C:\src\flutter` (recommended)
   - `C:\flutter`

## Add to PATH

1. Press `Win + X` → **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under **User variables**, select **Path** → **Edit**
5. Click **New** and add:
   ```
   C:\src\flutter\bin
   ```
   (Replace with your actual Flutter path)
6. Click **OK** on all dialogs
7. **Close and reopen PowerShell**

## Verify Installation

Open a **new** PowerShell and run:

```powershell
flutter doctor
```

This will show what's installed and what's missing.

## Install Required Components

Flutter doctor will tell you what to install:
- Android Studio (if not installed)
- Android SDK
- Android licenses

Follow the instructions it provides.

## After Installation

Once Flutter is working:

```powershell
cd C:\Users\ismae\Documents\GitHub\campulse-mobile
flutter pub get
flutter pub global activate flutterfire_cli
flutterfire configure
```


