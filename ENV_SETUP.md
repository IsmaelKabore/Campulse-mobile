# 🔐 Environment Variables Setup

## Overview

Firebase API keys and sensitive configuration are now stored in environment variables using a `.env` file. This file is **NOT committed to version control** for security.

## Setup Instructions

### 1. Create `.env` File

Copy the example file:
```bash
cp .env.example .env
```

Or create `.env` manually with your Firebase configuration:

```env
# Android Firebase Config
FIREBASE_ANDROID_API_KEY=your_android_api_key
FIREBASE_ANDROID_APP_ID=your_android_app_id
FIREBASE_ANDROID_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_ANDROID_PROJECT_ID=your_project_id
FIREBASE_ANDROID_STORAGE_BUCKET=your_storage_bucket

# iOS Firebase Config
FIREBASE_IOS_API_KEY=your_ios_api_key
FIREBASE_IOS_APP_ID=your_ios_app_id
FIREBASE_IOS_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_IOS_PROJECT_ID=your_project_id
FIREBASE_IOS_STORAGE_BUCKET=your_storage_bucket
FIREBASE_IOS_BUNDLE_ID=com.campulse.app
```

### 2. Get Firebase Configuration

You can find your Firebase config values in:
- **Android:** `android/app/google-services.json`
- **iOS:** `ios/Runner/GoogleService-Info.plist`
- **Or:** Firebase Console → Project Settings → Your Apps

### 3. Verify Setup

Run the app:
```bash
flutter run
```

If `.env` is missing or invalid, you'll see a warning in debug mode. In release builds, the app will fail to start (fail-fast behavior).

## Security Notes

✅ **DO:**
- Keep `.env` file local only
- Use `.env.example` as a template (committed to repo)
- Add `.env` to `.gitignore` (already done)

❌ **DON'T:**
- Commit `.env` to version control
- Share `.env` file publicly
- Hardcode keys in source code

## Files Ignored by Git

The following sensitive files are automatically ignored:
- `.env` - Environment variables
- `.env.local` - Local overrides
- `*.keystore` - Android signing keys
- `*.jks` - Java keystore files
- `**/key.properties` - Keystore configuration
- `lib/firebase_options.dart` - Generated Firebase config (now uses env vars)

## Troubleshooting

### Error: "Could not load .env file"
- Make sure `.env` exists in the project root
- Check file permissions
- Verify file encoding is UTF-8

### Error: "Environment variable not found"
- Check `.env` file has all required variables
- Verify variable names match exactly (case-sensitive)
- Restart the app after changing `.env`

