# Add FlutterFire to PATH

## Quick Fix

The FlutterFire CLI is installed but not in your PATH. Add this directory:

```
C:\Users\ismae\AppData\Local\Pub\Cache\bin
```

## Steps:

1. Press `Win + X` → **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under **User variables**, select **Path** → **Edit**
5. Click **New** and add:
   ```
   C:\Users\ismae\AppData\Local\Pub\Cache\bin
   ```
6. Click **OK** on all dialogs
7. **Close and reopen PowerShell**

## Then Run:

```powershell
flutterfire configure
```

## Alternative: Use Full Path (No PATH Change Needed)

You can also run FlutterFire without adding to PATH:

```powershell
& "C:\Users\ismae\AppData\Local\Pub\Cache\bin\flutterfire.bat" configure
```

Or use `dart pub global run`:

```powershell
dart pub global run flutterfire_cli:flutterfire configure
```

