# Local Testing Guide

How to test the Lunary iOS app locally before publishing to the App Store.

---

## Quick Start

### Option 1: Test with Production URL (Simplest)

```bash
pnpm cap:ios
```

Then in Xcode:

1. Select an iPhone Simulator (e.g., iPhone 15 Pro)
2. Press **Cmd + R** to build and run
3. The app loads `lunary.app` in a native container

### Option 2: Test with Local Dev Server (For Development)

This lets you see code changes in real-time.

**Terminal 1 - Start Next.js:**

```bash
pnpm dev
```

**Terminal 2 - Update Capacitor config and open Xcode:**

Edit `capacitor.config.ts`:

```typescript
server: {
  url: 'http://localhost:3000',  // Local dev server
  cleartext: true,               // Allow HTTP
},
```

Then sync and open:

```bash
pnpm cap:sync
pnpm cap:ios
```

In Xcode, run on Simulator. Changes in your Next.js code will reflect immediately.

> **Remember:** Change back to `https://lunary.app` before building for production.

---

## Testing Widgets

Widgets are a separate extension and need to be added in Xcode first.

### 1. Add Widget Extension in Xcode

1. Open project: `pnpm cap:ios`
2. **File > New > Target**
3. Select **Widget Extension**
4. Name: `LunaryWidgets`
5. Uncheck "Include Configuration App Intent"
6. Click **Finish** and **Activate**

### 2. Replace Widget Code

The auto-generated widget code is placeholder. Replace it:

1. In Xcode's file navigator, find `LunaryWidgets` folder
2. Delete the auto-generated `.swift` file
3. Drag in `ios/App/LunaryWidgets/LunaryWidgets.swift`
4. Also add the `Assets.xcassets` folder from `ios/App/LunaryWidgets/`

Or just copy-paste the contents into the generated file.

### 3. Configure App Groups

Both the main app and widget need to share data via App Groups.

**Main App target:**

1. Select **App** target
2. **Signing & Capabilities** tab
3. **+ Capability** > **App Groups**
4. Add: `group.app.lunary`

**Widget Extension target:**

1. Select **LunaryWidgetsExtension** target
2. **Signing & Capabilities** tab
3. **+ Capability** > **App Groups**
4. Add: `group.app.lunary` (same as main app)

### 4. Run Widget

1. In Xcode, select the **LunaryWidgetsExtension** scheme (dropdown next to device)
2. Run on Simulator
3. When prompted, select "Lunary" as the app to attach to
4. Go to home screen, long press, tap **+**, search "Lunary"

### 5. Widget Shows Placeholder?

The widget needs data from the main app. Either:

**A) Run the main app first** - Open the app, data syncs to widget

**B) Test with sample data** - The widget shows sample data in Xcode previews

---

## Testing on Physical Device

### Requirements

- iPhone connected via USB or on same Wi-Fi
- Apple Developer account (free Personal Team works for 7 days)

### Steps

1. Connect iPhone to Mac
2. In Xcode, select your iPhone from device dropdown
3. First time: Trust the computer on your iPhone
4. **Signing & Capabilities** > Select your Team
5. Press **Cmd + R** to build and run

### Local Dev Server on Physical Device

Your phone needs to reach your Mac's localhost:

1. Find your Mac's IP: **System Settings > Wi-Fi > Details > IP Address**
2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.x.x:3000',  // Your Mac's IP
     cleartext: true,
   },
   ```
3. Ensure phone and Mac are on same Wi-Fi
4. Sync and run: `pnpm cap:sync && pnpm cap:ios`

---

## Testing Checklist

### Main App

- [ ] App launches without crash
- [ ] Login/auth works
- [ ] All navigation works
- [ ] Data loads correctly
- [ ] Safe area (notch) displays correctly
- [ ] Status bar theming looks right

### Widgets

- [ ] Widgets appear in widget gallery
- [ ] Small widget displays correctly
- [ ] Medium widget displays correctly
- [ ] Large widget displays correctly (Cosmic Dashboard only)
- [ ] Moon phase icons render (not emojis)
- [ ] Tapping widget opens app
- [ ] Widget shows placeholder when no data

### Before App Store

- [ ] Test on multiple device sizes (iPhone SE, iPhone 15 Pro Max)
- [ ] Test in light and dark mode
- [ ] Test with no network connection
- [ ] Test widget after phone restart

---

## Common Issues

### "Could not launch app" error

- Clean build: **Product > Clean Build Folder** (Cmd + Shift + K)
- Delete app from Simulator
- Rebuild

### Widget not appearing

- Ensure App Groups match exactly on both targets
- Clean build
- Delete app and reinstall
- Restart Simulator

### Local server not loading

- Check `cleartext: true` in config
- Verify URL is correct (localhost for Simulator, IP for device)
- Ensure dev server is running

### Signing errors

- Select a valid Team in Signing & Capabilities
- For free Personal Team: re-sign every 7 days
- Check bundle IDs are unique

---

## Useful Commands

```bash
# Open iOS project
pnpm cap:ios

# Sync plugins/config to iOS
pnpm cap:sync

# View connected devices
xcrun xctrace list devices

# Clean Xcode derived data (nuclear option)
rm -rf ~/Library/Developer/Xcode/DerivedData
```
