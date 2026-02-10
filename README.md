# Campulse Mobile - Flutter App

A pure Flutter mobile application for Campulse with Firebase integration. **MOBILE-ONLY** - no web support.

## 🚀 Quick Start

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Android Studio / Xcode
- Firebase project

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure Firebase

Install FlutterFire CLI:
```bash
dart pub global activate flutterfire_cli
```

Configure Firebase:
```bash
flutterfire configure
```

This will:
- Generate `lib/firebase_options.dart` with your Firebase configuration
- Configure Firebase for Android and iOS

### 3. Add Firebase Configuration Files

**Android:**
- Add `google-services.json` to `android/app/`

**iOS:**
- Add `GoogleService-Info.plist` to `ios/Runner/`

### 4. Run on Android Emulator

```bash
flutter run
```

Or specify a device:
```bash
flutter devices
flutter run -d <device-id>
```

## 📱 Building for Release

### Android APK

```bash
flutter build apk --release
```

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### iOS (Xcode)

1. Open `ios/Runner.xcworkspace` in Xcode
2. Select your development team in Signing & Capabilities
3. Build and run from Xcode, or:
```bash
flutter build ios --release
```

## 🏗️ Project Structure

```
lib/
├── main.dart                 # App entry point
├── firebase_options.dart     # Firebase config (generated)
├── models/                   # Data models
├── services/                 # Firebase services
├── providers/                # State management
├── screens/                  # UI screens
│   ├── auth/                 # Login, Signup
│   ├── main/                 # Bottom navigation
│   ├── feed/                 # Events, Free Food, Opportunities
│   ├── post/                 # Post detail (zoomable images)
│   ├── create/               # Create post
│   ├── profile/              # User profile
│   └── saved/                # Saved posts
└── widgets/                  # Reusable widgets
```

## 🔥 Firebase Setup

### Firestore Security Rules

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

### Storage Rules

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

## ✨ Features

- ✅ Firebase Authentication (email/password)
- ✅ Cloud Firestore for users and posts
- ✅ Firebase Storage for images
- ✅ Material 3 UI
- ✅ Bottom tab navigation
- ✅ Zoomable images in post detail
- ✅ Create posts with images
- ✅ Save/unsave posts
- ✅ User profiles
- ✅ Dark mode support
- ✅ Loading, empty, and error states

## 🎯 App Flow

1. **Login/Signup** → Email/password authentication
2. **Main Feed** → Bottom navigation (Events, Free Food, Opportunities, Saved, Profile)
3. **Post Detail** → Tap any post to view details with zoomable images
4. **Create Post** → Floating action button to create new posts
5. **Profile** → View user profile and saved posts

## 📦 Dependencies

- `firebase_core` - Firebase initialization
- `firebase_auth` - Authentication
- `cloud_firestore` - Database
- `firebase_storage` - File storage
- `provider` - State management
- `image_picker` - Image selection
- `cached_network_image` - Image caching
- `intl` - Date formatting

## 🚫 What's NOT Included

- ❌ Web support
- ❌ Next.js
- ❌ React/TypeScript
- ❌ Capacitor
- ❌ WebView
- ❌ Browser logic
- ❌ Static exports

This is a **pure native mobile app** only.

## 🐛 Troubleshooting

### Flutter not found
Make sure Flutter is in your PATH:
```bash
flutter doctor
```

### Firebase not configured
Run `flutterfire configure` and ensure `lib/firebase_options.dart` exists.

### Build errors
- Android: Ensure `google-services.json` is in `android/app/`
- iOS: Run `cd ios && pod install && cd ..`

### Image picker not working
- Android: Check permissions in `AndroidManifest.xml`
- iOS: Check Info.plist for camera/photo library permissions

## 📄 License

This project is part of Campulse.


