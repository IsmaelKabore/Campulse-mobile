# 🚀 Quick Release Build Guide

## Prerequisites

1. **Release Keystore** (one-time setup)
   ```bash
   # Generate keystore
   keytool -genkey -v -keystore ~/upload-keystore.jks \
     -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   
   # Create key.properties in android/
   # File: android/key.properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=upload
   storeFile=../upload-keystore.jks
   ```

2. **Firebase Security Rules** (verify in Firebase Console)
   - Firestore: No open writes
   - Storage: No public writes, size limits enforced

## Build Release AAB

```bash
# Clean
flutter clean

# Get dependencies
flutter pub get

# Build AAB
flutter build appbundle --release \
  --build-number=2 \
  --build-name=1.0.1

# Output: build/app/outputs/bundle/release/app-release.aab
```

## Verify Build

```bash
# Check size (< 50MB recommended)
ls -lh build/app/outputs/bundle/release/app-release.aab

# Test locally (optional)
flutter build apk --release
adb install build/app/outputs/flutter-apk/app-release.apk
```

## Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Production → Create new release
4. Upload `app-release.aab`
5. Fill release notes
6. Review and roll out

---

**⚠️ IMPORTANT:** Build will **FAIL** if `key.properties` is missing (prevents accidental debug signing).

