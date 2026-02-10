# 🍎 iOS Quick Start Guide (For Non-Developers)

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] A Mac computer (macOS 12.0 or later)
- [ ] Xcode installed (download from Mac App Store - it's free but large ~15GB)
- [ ] Flutter installed (follow instructions at flutter.dev)
- [ ] Apple Developer account ($99/year - required for TestFlight/App Store)

## Step-by-Step Setup (Copy & Paste)

### 1. Open Terminal on Mac
Press `Cmd + Space`, type "Terminal", press Enter.

### 2. Navigate to Project Folder
```bash
cd ~/Downloads/campulse-mobile
```
*(Replace with your actual project folder path)*

### 3. Install Flutter Dependencies
```bash
flutter pub get
```
Wait for it to finish (may take 1-2 minutes).

### 4. Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```
Wait for it to finish (may take 2-5 minutes).

**If `pod install` fails:**
```bash
sudo gem install cocoapods
```
Then try `pod install` again.

### 5. Create Environment File
```bash
cp .env.example .env
```
Then open `.env` in a text editor and fill in your Firebase keys.

### 6. Open in Xcode
```bash
open ios/Runner.xcworkspace
```
**IMPORTANT:** Always open `.xcworkspace`, never `.xcodeproj`

### 7. Configure Signing (In Xcode)

1. In the left sidebar, click **"Runner"** (blue icon at the top)
2. Click the **"Signing & Capabilities"** tab (in the main area)
3. Check the box: **"Automatically manage signing"**
4. In the **"Team"** dropdown, select your Apple Developer team
5. Verify **"Bundle Identifier"** shows: `com.campulse.app`

**If you see errors:**
- Make sure you're signed into Xcode with your Apple ID
- Go to Xcode → Settings → Accounts → Add your Apple ID
- If you don't have a developer account, you can still test on simulator

### 8. Run on Simulator

1. At the top of Xcode, click the device dropdown (next to the Play button)
2. Select **"iPhone 15 Pro"** or any simulator
3. Click the **Play button** (▶️) or press `Cmd + R`
4. Wait for the app to build and launch (first time takes 2-5 minutes)

### 9. Build for TestFlight (Archive)

1. In Xcode, change device dropdown to **"Any iOS Device"**
2. Go to menu: **Product** → **Archive**
3. Wait for archive to complete (5-10 minutes)
4. A window will appear showing your archives
5. Click **"Distribute App"**
6. Select **"App Store Connect"**
7. Click **"Next"** through the prompts
8. Click **"Upload"**
9. Wait for upload to complete

### 10. Submit to TestFlight

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Log in with your Apple Developer account
3. Select your app
4. Go to **TestFlight** tab
5. Wait for processing to complete (10-30 minutes)
6. Add internal testers or external testers
7. Send TestFlight invites

## Common Issues & Fixes

### "No such module 'Flutter'"
**Fix:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### "Signing for Runner requires a development team"
**Fix:**
- In Xcode, go to Signing & Capabilities
- Select your team from the dropdown
- If no team appears, add your Apple ID in Xcode Settings → Accounts

### "GoogleService-Info.plist not found"
**Fix:**
- Download from Firebase Console
- Drag and drop into `ios/Runner/` folder in Xcode
- Make sure "Copy items if needed" is checked

### "Pod install fails"
**Fix:**
```bash
sudo gem install cocoapods
pod repo update
cd ios
pod install
```

### App crashes on launch
**Fix:**
- Check that `.env` file exists and has all Firebase keys
- Verify `GoogleService-Info.plist` is in `ios/Runner/`
- Check Xcode console for error messages

## Need Help?

1. Check Xcode console for error messages (bottom panel)
2. Check Terminal for Flutter errors
3. Verify all files are in correct locations
4. Make sure you're opening `.xcworkspace`, not `.xcodeproj`

---

**Remember:** The first build always takes the longest. Subsequent builds are much faster!

