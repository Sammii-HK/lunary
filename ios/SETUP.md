# Lunary iOS App Setup

This guide walks you through completing the iOS app setup in Xcode.

## Prerequisites

- Xcode 15 or later
- Apple Developer account

## Step 1: Open the Project

```bash
pnpm cap:ios
```

This opens the Xcode project.

## Step 2: Add Widget Extension Target

1. In Xcode, go to **File > New > Target**
2. Select **Widget Extension**
3. Name it `LunaryWidgets`
4. **Uncheck** "Include Configuration App Intent" (we use static config)
5. **Uncheck** "Include Live Activity" (can add later)
6. Click **Finish**
7. When prompted to activate the scheme, click **Activate**

## Step 3: Replace Widget Files

The widget template creates placeholder files. Replace them:

1. Delete the auto-generated Swift files in the LunaryWidgets folder
2. Add the files from `ios/App/LunaryWidgets/`:
   - `LunaryWidgets.swift`
   - `Info.plist`
   - `Assets.xcassets/`

Or simply copy the contents of `LunaryWidgets.swift` into the generated file.

## Step 4: Configure App Groups

This allows the main app and widget to share data.

### Main App Target:

1. Select the **App** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability** > **App Groups**
4. Add: `group.app.lunary`

### Widget Extension Target:

1. Select the **LunaryWidgetsExtension** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability** > **App Groups**
4. Add the same: `group.app.lunary`

## Step 5: Set Bundle Identifiers

### Main App:

- Bundle ID: `app.lunary`

### Widget Extension:

- Bundle ID: `app.lunary.widgets`

## Step 6: Configure Signing

1. Select each target
2. Set your Team in **Signing & Capabilities**
3. Enable "Automatically manage signing"

## Step 7: Build & Test

1. Select an iOS Simulator (iPhone 15 Pro recommended)
2. Press **Cmd + R** to build and run
3. Once running, go to home screen
4. Long press > Edit Home Screen > tap **+**
5. Search for "Lunary"
6. Add widgets to home screen

## Troubleshooting

### Widget not appearing in widget gallery

- Ensure both App and Widget extension have the same App Group
- Clean build folder: **Product > Clean Build Folder**
- Delete app from simulator and reinstall

### Widget shows "Open Lunary" placeholder

- The widget needs data. Open the main app first.
- Data is synced when you call `widgetService.updateWidgetData()`

### Signing errors

- Ensure you have a valid Apple Developer account
- Check that bundle IDs are unique and not already in use

## App Store Submission

Before submitting:

1. Set version numbers in both targets
2. Add app icons to both targets
3. Add screenshots including widget screenshots
4. Configure App Store Connect with widget promotional text
