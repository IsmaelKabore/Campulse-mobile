# Firebase Auth reCAPTCHA Fix

## Important: You Need BOTH SHA-1 and SHA-256

Firebase Auth uses **SHA-1** fingerprints for reCAPTCHA verification. Play Integrity uses SHA-256, but they serve different purposes.

## Steps to Fix

### 1. Add SHA-1 Fingerprint to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **event-d5bf2**
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Find your Android app: **com.campulse.app**
6. Click **Add fingerprint** button
7. Add **SHA-1** (if not already added):

```
AD:F0:7C:82:77:58:68:C6:16:D8:FE:79:98:2C:9C:7D:D0:22:5B:48
```

**Note:** You should have BOTH:
- ✅ SHA-1: `AD:F0:7C:82:77:58:68:C6:16:D8:FE:79:98:2C:9C:7D:D0:22:5B:48` (for Firebase Auth/reCAPTCHA)
- ✅ SHA-256: `8E:78:88:06:23:0B:88:A1:A3:A5:64:AD:5B:60:09:FB:C0:4A:D7:DF:89:77:51:95:44:0C:3F:82:FF:A8:4A:A5` (for Play Integrity)

### 2. Re-download google-services.json

After adding SHA-1:
1. In Firebase Console, click **Download google-services.json**
2. Replace `android/app/google-services.json` with the new file
3. This ensures the file has the latest fingerprint information

### 3. Rebuild the App

```bash
flutter clean
flutter pub get
flutter run
```

## Why This Matters

- **SHA-1**: Required by Firebase Auth for reCAPTCHA verification
- **SHA-256**: Required by Play Integrity for App Check (production)

Both are needed for different features!

## Network Error Troubleshooting

If you still get network errors after adding SHA-1:

1. **Check Device Internet**: Open browser on your phone, try visiting google.com
2. **Check Firewall/VPN**: Disable VPN or firewall that might block Google services
3. **Try Different Network**: Switch from Wi-Fi to mobile data (or vice versa)
4. **Check Firebase Auth Settings**: 
   - Go to Firebase Console → Authentication → Settings
   - Ensure "Email/Password" sign-in method is enabled

## Verification

After adding SHA-1 and rebuilding, you should see:
- ✅ No reCAPTCHA network errors
- ✅ Login works successfully
- ✅ App Check uses debug provider (for debug builds)

