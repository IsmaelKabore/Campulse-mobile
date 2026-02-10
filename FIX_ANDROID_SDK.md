# Fix Android SDK Command-Line Tools

## Problem
Android SDK command-line tools are missing, which prevents accepting licenses.

## Solution: Install via Android Studio

### Method 1: Through Android Studio (Easiest)

1. **Open Android Studio**
2. **File** → **Settings** (or `Ctrl + Alt + S`)
3. Go to **Appearance & Behavior** → **System Settings** → **Android SDK**
4. Click the **SDK Tools** tab
5. Check **Android SDK Command-line Tools (latest)**
6. Click **Apply** → **OK**
7. Wait for installation to complete

### Method 2: Manual Installation

1. Open Android Studio
2. **Tools** → **SDK Manager**
3. Go to **SDK Tools** tab
4. Expand **Android SDK Command-line Tools**
5. Check the latest version
6. Click **Apply** → **OK**

### Method 3: Download Directly

1. Go to: https://developer.android.com/studio#command-line-tools-only
2. Download "Command line tools only" for Windows
3. Extract to: `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest`
4. Add to PATH: `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin`

## After Installation

1. **Close and reopen PowerShell**
2. Run:
   ```powershell
   flutter doctor --android-licenses
   ```
3. Type `y` for each license prompt

## Verify

```powershell
flutter doctor
```

All Android toolchain items should now be green (✓).

