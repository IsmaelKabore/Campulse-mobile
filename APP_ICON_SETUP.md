# App Icon Setup Guide

## 📱 Setting Up App Icons for Play Store & App Store

The app currently uses default Flutter launcher icons. To use your favicon as the app icon:

### Option 1: Using flutter_launcher_icons (Recommended)

1. **Install the package:**
   ```bash
   flutter pub add dev:flutter_launcher_icons
   ```

2. **Convert favicon.ico to PNG:**
   - Use an online converter (e.g., https://convertio.co/ico-png/)
   - Or use ImageMagick: `magick convert favicon.ico logo.png`
   - Save as `assets/images/logo.png` (1024x1024 recommended)

3. **Update `pubspec.yaml`:**
   ```yaml
   dev_dependencies:
     flutter_launcher_icons: ^0.13.1

   flutter_launcher_icons:
     android: true
     ios: true
     image_path: "assets/images/logo.png"
     min_sdk_android: 21
     remove_alpha_ios: true
   ```

4. **Generate icons:**
   ```bash
   flutter pub get
   flutter pub run flutter_launcher_icons
   ```

### Option 2: Manual Setup

#### Android Icons

1. **Create icon sizes** using Android Asset Studio:
   - Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - Upload your logo (PNG, 1024x1024 recommended)
   - Download the generated icons
   - Replace files in `android/app/src/main/res/`:
     - `mipmap-mdpi/ic_launcher.png` (48x48)
     - `mipmap-hdpi/ic_launcher.png` (72x72)
     - `mipmap-xhdpi/ic_launcher.png` (96x96)
     - `mipmap-xxhdpi/ic_launcher.png` (144x144)
     - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

2. **Verify in `AndroidManifest.xml`:**
   ```xml
   android:icon="@mipmap/ic_launcher"
   ```
   (Already configured ✅)

#### iOS Icons

1. **Create AppIcon.appiconset:**
   - Use Xcode or an online tool
   - Create icons in these sizes:
     - 20x20 (@2x, @3x) = 40x40, 60x60
     - 29x29 (@2x, @3x) = 58x58, 87x87
     - 40x40 (@2x, @3x) = 80x80, 120x120
     - 60x60 (@2x, @3x) = 120x120, 180x180
     - 1024x1024 (App Store)

2. **Place in:**
   - `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

3. **Or use Xcode:**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select `Assets.xcassets` > `AppIcon`
   - Drag and drop your icon images

### ✅ Verification

1. **Test on device:**
   ```bash
   flutter run
   ```
   - Check home screen for app icon

2. **For Play Store:**
   - The icon in `mipmap-xxxhdpi/ic_launcher.png` (192x192) is used
   - You can also upload a 512x512 icon in Play Console

3. **For App Store:**
   - The 1024x1024 icon is required
   - Upload in App Store Connect

### 📝 Notes

- ICO files don't work directly - convert to PNG first
- Use 1024x1024 PNG for best quality
- Ensure icons have no transparency for Android (or set `remove_alpha_android: true`)
- Icons should be square with rounded corners handled by the OS


