# App Check Debug Setup Guide

## ✅ Step 1: Code Updated

The code has been updated to use debug providers:
- `AndroidProvider.debug` for Android
- `AppleProvider.debug` for iOS

## 📱 Step 2: Run the App and Get Debug Token

1. **Run the app:**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

2. **Look for the debug token in logs:**
   
   When the app starts, you'll see a log message like:
   ```
   I/flutter: Firebase App Check debug token: ABCD1234-5678-90EF-GHIJ-KLMNOPQRSTUV
   ```
   
   Or it might appear as:
   ```
   App Check debug token: ABCD1234-5678-90EF-GHIJ-KLMNOPQRSTUV
   ```

3. **Copy the entire token** (it's a long string of letters, numbers, and hyphens)

## 🔥 Step 3: Add Debug Token to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **event-d5bf2**
3. In the left sidebar, click **App Check**
4. You'll see your Android app: **com.campulse.app**
5. Click **Manage debug tokens** (or the debug tokens section)
6. Click **Add debug token**
7. Paste the token you copied from the logs
8. Click **Save**

## 🚀 Step 4: Restart the App

After adding the debug token:

```bash
flutter clean
flutter run
```

## ✅ Verification

After adding the debug token and restarting:
- ✅ App Check will work without network errors
- ✅ Login should work immediately
- ✅ No more "App Check token" warnings

## 📝 Notes

- **Debug tokens are device-specific** - if you run on a different device/emulator, you'll need to add its token too
- **This is for development only** - for production, you'll need to switch back to `AndroidProvider.playIntegrity`
- **The token appears once** - if you miss it, just restart the app and look again

## 🐛 Troubleshooting

**Can't find the debug token in logs?**
- Make sure you're looking at the full console output
- Try filtering logs: `flutter run | grep -i "debug token"` (Linux/Mac) or search for "debug" in the console
- The token might appear right after "Firebase App Check activated successfully"

**Token not working?**
- Make sure you copied the entire token (no spaces, includes all hyphens)
- Wait a few seconds after adding the token before restarting
- Try removing and re-adding the token in Firebase Console

