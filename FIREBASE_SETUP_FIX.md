# Firebase Auth Network Error Fix

## Problem
Firebase Auth is failing with a network error when trying to use reCAPTCHA for email/password authentication.

## Root Cause
The SHA-1 and SHA-256 fingerprints of your app are not registered in Firebase Console. Firebase requires these to verify your app's identity for reCAPTCHA.

## Solution

### Step 1: Add SHA Fingerprints to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **event-d5bf2**
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to **Your apps** section
6. Find your Android app: **com.campulse.app**
7. Click **Add fingerprint** button
8. Add these two fingerprints:

**SHA-1:**
```
AD:F0:7C:82:77:58:68:C6:16:D8:FE:79:98:2C:9C:7D:D0:22:5B:48
```

**SHA-256:**
```
8E:78:88:06:23:0B:88:A1:A3:A5:64:AD:5B:60:09:FB:C0:4A:D7:DF:89:77:51:95:44:0C:3F:82:FF:A8:4A:A5
```

9. Click **Save** after adding each fingerprint
10. Download the updated `google-services.json` file
11. Replace `android/app/google-services.json` with the new file

### Step 2: Rebuild the App

After updating Firebase Console:

```bash
flutter clean
flutter pub get
flutter run
```

## Additional Fixes Applied

✅ **Network Security Configuration**
- Created `android/app/src/main/res/xml/network_security_config.xml`
- Updated `AndroidManifest.xml` to use the network security config
- This allows proper HTTPS connections to Firebase services

✅ **Email Validation**
- Login now only accepts `@berkeley.edu` emails
- Signup also validates `@berkeley.edu` requirement

✅ **Firebase Configuration**
- Updated `lib/firebase_options.dart` with real values from `google-services.json`
- Fixed Android and iOS configurations

## Why This Happens

Firebase Auth uses reCAPTCHA to prevent abuse. On Android, it requires:
1. SHA-1 and SHA-256 fingerprints registered in Firebase Console
2. Proper network connectivity to Google's reCAPTCHA servers
3. Valid `google-services.json` file

Without the fingerprints, Firebase cannot verify your app's identity, causing the network error.

## Verification

After adding the fingerprints and rebuilding:
- ✅ Firebase should initialize successfully (already working)
- ✅ Login should work without network errors
- ✅ reCAPTCHA should complete successfully

## If Still Having Issues

1. **Check Internet Connection**: Ensure your device has internet access
2. **Check Firebase Console**: Verify fingerprints are saved correctly
3. **Download New google-services.json**: After adding fingerprints, download and replace the file
4. **Full Rebuild**: Run `flutter clean` and rebuild completely
5. **Check Firebase Auth Settings**: In Firebase Console → Authentication → Settings, ensure Email/Password is enabled

