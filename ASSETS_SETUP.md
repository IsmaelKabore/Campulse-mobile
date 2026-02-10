# Assets and App Icon Setup Guide

## 📋 Overview

This guide will help you:
1. Copy the logo and mockup images from the web app to Flutter
2. Set up app icons for iOS and Android

## 📁 Step 1: Copy Assets from Web App

### Copy Logo
1. Copy `favicon.ico` from `C:\Users\ismae\Documents\GitHub\berkeley-events\app\favicon.ico`
2. Paste it to `C:\Users\ismae\Documents\GitHub\campulse-mobile\assets\images\logo.ico`

### Copy Mockup Images
1. Copy the entire `mockups` folder from:
   - `C:\Users\ismae\Documents\GitHub\berkeley-events\public\mockups\`
2. Paste it to:
   - `C:\Users\ismae\Documents\GitHub\campulse-mobile\assets\images\mockups\`

You should have:
- `assets/images/mockups/iphone.png`
- `assets/images/mockups/iPad.png`
- `assets/images/mockups/freefood.jpg`
- `assets/images/mockups/movie-night.jpg`
- `assets/images/mockups/Today-at-Apple-sessions-in-apple-store.jpg`

### Update pubspec.yaml

Make sure your `pubspec.yaml` includes these assets:

```yaml
flutter:
  assets:
    - assets/images/
    - assets/images/mockups/
```

## 🎨 Step 2: Update Landing Screen with Mockup Images

After copying the images, update `lib/screens/auth/landing_screen.dart`:

Replace the placeholder device mockup section (around line 120) with:

```dart
// Device Mockup
Image.asset(
  'assets/images/mockups/iphone.png',
  fit: BoxFit.contain,
  errorBuilder: (context, error, stackTrace) {
    debugPrint('❌ Mockup image failed to load');
    return Container(
      // Fallback UI
      child: Icon(Icons.phone_iphone, size: 120, color: Colors.white.withOpacity(0.2)),
    );
  },
),
```

## 📱 Step 3: Set Up App Icons

### Option A: Using flutter_launcher_icons (Recommended)

1. **Install the package:**
   ```bash
   flutter pub add dev:flutter_launcher_icons
   ```

2. **Add to `pubspec.yaml`:**
   ```yaml
   dev_dependencies:
     flutter_launcher_icons: ^0.13.1

   flutter_launcher_icons:
     android: true
     ios: true
     image_path: "assets/images/logo.ico"
     # If logo.ico doesn't work, convert it to PNG first
     # image_path: "assets/images/logo.png"
   ```

3. **Convert ICO to PNG (if needed):**
   - Use an online converter or image editor
   - Save as `assets/images/logo.png` (1024x1024 recommended)

4. **Run the generator:**
   ```bash
   flutter pub get
   flutter pub run flutter_launcher_icons
   ```

### Option B: Manual Setup

#### Android Icons

1. **Create icon sizes:**
   - Use Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - Upload your logo
   - Download the generated icons
   - Replace files in `android/app/src/main/res/`:
     - `mipmap-mdpi/ic_launcher.png` (48x48)
     - `mipmap-hdpi/ic_launcher.png` (72x72)
     - `mipmap-xhdpi/ic_launcher.png` (96x96)
     - `mipmap-xxhdpi/ic_launcher.png` (144x144)
     - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

2. **Update `android/app/src/main/AndroidManifest.xml`:**
   ```xml
   <application
       android:icon="@mipmap/ic_launcher"
       ...>
   ```

#### iOS Icons

1. **Create AppIcon.appiconset:**
   - Use Xcode or an online tool
   - Create icons in these sizes:
     - 20x20 (@2x, @3x)
     - 29x29 (@2x, @3x)
     - 40x40 (@2x, @3x)
     - 60x60 (@2x, @3x)
     - 1024x1024 (App Store)

2. **Place in:**
   - `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

3. **Or use Xcode:**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select `Assets.xcassets` > `AppIcon`
   - Drag and drop your icon images

## ✅ Verification

1. **Test the app:**
   ```bash
   flutter run
   ```

2. **Check landing screen:**
   - Should show device mockup images
   - Tagline should animate

3. **Check app icon:**
   - Build and install on device
   - Verify icon appears on home screen

## 🎯 Quick Checklist

- [ ] Copied `favicon.ico` to `assets/images/logo.ico`
- [ ] Copied `mockups/` folder to `assets/images/mockups/`
- [ ] Updated `pubspec.yaml` with assets
- [ ] Updated landing screen to use mockup images
- [ ] Set up app icons (flutter_launcher_icons or manual)
- [ ] Tested on device
- [ ] Verified app icon appears correctly

## 📝 Notes

- The landing screen currently uses a placeholder for the device mockup
- After copying images, update the `Image.asset()` call in `landing_screen.dart`
- For best results, use a 1024x1024 PNG for app icons
- iOS requires specific icon sizes - use Xcode or a tool to generate them


