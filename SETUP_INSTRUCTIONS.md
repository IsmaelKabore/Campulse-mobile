# Campulse Mobile - Setup Instructions

## ✅ Conversion Complete

This repository has been **completely converted** from a Next.js web app to a **pure Flutter mobile app**.

### What Was Removed

- ❌ All Next.js files (`app/`, `pages/`, `next.config.ts`)
- ❌ All React/TypeScript code
- ❌ All web dependencies (`package.json`, `node_modules`)
- ❌ Tailwind CSS configuration
- ❌ All web build scripts
- ❌ Capacitor (if it existed)
- ❌ Any WebView or browser-related code

### What Remains

- ✅ Pure Flutter codebase
- ✅ Android platform files
- ✅ iOS platform files
- ✅ Firebase native integration
- ✅ Material 3 UI

## 🚀 Quick Start

### 1. Install Flutter

If Flutter is not installed:
```bash
# Download from https://flutter.dev/docs/get-started/install
# Or use your package manager
```

Verify installation:
```bash
flutter doctor
```

### 2. Get Dependencies

```bash
flutter pub get
```

### 3. Configure Firebase

Install FlutterFire CLI:
```bash
dart pub global activate flutterfire_cli
```

Configure Firebase:
```bash
flutterfire configure
```

This will:
- Connect to your Firebase project
- Generate `lib/firebase_options.dart`
- Configure Android and iOS

### 4. Add Firebase Config Files

**Android:**
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/`

**iOS:**
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in `ios/Runner/`

### 5. Run on Android Emulator

```bash
# Start an Android emulator or connect a device
flutter run
```

## 📱 Building for Release

### Android APK

```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (Play Store)

```bash
flutter build appbundle --release
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### iOS

1. Open `ios/Runner.xcworkspace` in Xcode
2. Select your development team in Signing & Capabilities
3. Build and run from Xcode

Or via command line:
```bash
flutter build ios --release
```

## 📁 Final Project Structure

```
campulse-mobile/
├── android/              # Android platform files
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   ├── build.gradle
│   └── settings.gradle
├── ios/                  # iOS platform files
│   ├── Runner/
│   └── Podfile
├── lib/                  # Flutter source code
│   ├── main.dart
│   ├── firebase_options.dart
│   ├── models/
│   ├── services/
│   ├── providers/
│   ├── screens/
│   ├── widgets/
│   └── navigation/
├── pubspec.yaml          # Flutter dependencies
├── analysis_options.yaml
├── README.md
└── .gitignore
```

## ✨ Features Implemented

- ✅ Firebase Authentication (email/password)
- ✅ Cloud Firestore (users, posts)
- ✅ Firebase Storage (image uploads)
- ✅ Login/Signup screens
- ✅ Bottom tab navigation
- ✅ Events, Free Food, Opportunities feeds
- ✅ Post detail with zoomable images
- ✅ Create post with image upload
- ✅ User profiles
- ✅ Saved posts
- ✅ Material 3 UI
- ✅ Dark mode support
- ✅ Loading, empty, error states

## 🔥 Firebase Security Rules

### Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.resource.data.authorId == request.auth.uid;
      allow update, delete: if request.auth != null 
        && resource.data.authorId == request.auth.uid;
    }
  }
}
```

### Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Testing the App

1. **Run on Android Emulator:**
   ```bash
   flutter run
   ```

2. **Test Flow:**
   - Sign up with email/password
   - Create a post with image
   - View post detail (tap image to zoom)
   - Save/unsave posts
   - View profile
   - Sign out

## 🐛 Troubleshooting

### Flutter not found
- Add Flutter to PATH
- Restart terminal
- Run `flutter doctor`

### Firebase errors
- Ensure `flutterfire configure` was run
- Check `lib/firebase_options.dart` exists
- Verify `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are in place

### Build errors
- **Android:** Run `cd android && ./gradlew clean`
- **iOS:** Run `cd ios && pod install && cd ..`

### Image picker not working
- Check permissions in `AndroidManifest.xml` (Android)
- Check `Info.plist` for camera/photo permissions (iOS)

## ✅ Verification Checklist

- [ ] Flutter installed and in PATH
- [ ] `flutter pub get` completed successfully
- [ ] `flutterfire configure` completed
- [ ] Firebase config files added (Android + iOS)
- [ ] `flutter run` launches app on emulator
- [ ] Login works
- [ ] Can create posts
- [ ] Images upload successfully
- [ ] Post detail shows zoomable images
- [ ] Navigation works (back button, tabs)

## 🎯 Next Steps

1. Configure Firebase project
2. Set up Firestore security rules
3. Set up Storage security rules
4. Test on physical devices
5. Build release APK/AAB for distribution

---

**This is now a pure Flutter mobile app with zero web dependencies.**


