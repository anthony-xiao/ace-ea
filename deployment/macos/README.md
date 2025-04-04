# macOS Deployment Guide for Ace Assistant

This guide provides specific instructions for deploying the Ace Assistant application to macOS devices through the Mac App Store or direct distribution.

## Prerequisites

Before beginning the macOS deployment process, ensure you have the following:

- Apple Developer Account ($99/year)
- Xcode 15.0 or later
- macOS Sonoma 14.0 or later
- Physical macOS device for testing (optional but recommended)

## Setting Up Your macOS Development Environment

### 1. Install Xcode

Download and install the latest version of Xcode from the Mac App Store or the [Apple Developer website](https://developer.apple.com/xcode/).

### 2. Configure Apple Developer Account

1. Log in to your [Apple Developer Account](https://developer.apple.com/account/)
2. Ensure your membership is active

### 3. Create App ID

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click the "+" button to add a new identifier
3. Select "App IDs" and click "Continue"
4. Select "App" as the type and click "Continue"
5. Enter a description (e.g., "Ace Assistant macOS")
6. Enter your Bundle ID (e.g., "com.yourcompany.aceassistant.macos")
7. Select the necessary capabilities:
   - Push Notifications
   - App Sandbox
   - Network Access
   - User Notifications
8. Click "Continue" and then "Register"

### 4. Create Certificates

#### Development Certificate:

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)
2. Click the "+" button to add a new certificate
3. Select "Mac App Development" and click "Continue"
4. Follow the instructions to create a Certificate Signing Request (CSR) from your Mac
5. Upload the CSR and click "Continue"
6. Download the certificate and double-click to install it in your Keychain

#### Distribution Certificate:

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)
2. Click the "+" button to add a new certificate
3. Select "Mac App Distribution" for Mac App Store distribution or "Developer ID Application" for direct distribution
4. Follow the instructions to create a CSR from your Mac
5. Upload the CSR and click "Continue"
6. Download the certificate and double-click to install it in your Keychain

### 5. Create Provisioning Profiles

#### Development Provisioning Profile:

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Click the "+" button to add a new profile
3. Select "Mac App Development" and click "Continue"
4. Select your App ID and click "Continue"
5. Select your development certificate and click "Continue"
6. Enter a profile name (e.g., "Ace Assistant macOS Development") and click "Generate"
7. Download the profile and double-click to install it

#### Distribution Provisioning Profile:

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Click the "+" button to add a new profile
3. Select "Mac App Store" for App Store distribution or "Developer ID" for direct distribution
4. Select your App ID and click "Continue"
5. Select your distribution certificate and click "Continue"
6. Enter a profile name (e.g., "Ace Assistant macOS Distribution") and click "Generate"
7. Download the profile and double-click to install it

## Preparing Your macOS App for Submission

### 1. Configure Xcode Project

1. Open your project in Xcode
2. Select the project in the Project Navigator
3. Select the "Ace Assistant macOS" target
4. In the "General" tab:
   - Set the correct Bundle Identifier
   - Set the Version (e.g., 1.0.0)
   - Set the Build number (e.g., 1)
   - Select your Team
   - Ensure Deployment Info is set correctly (macOS 12.0+)
5. In the "Signing & Capabilities" tab:
   - Ensure "Automatically manage signing" is checked
   - Select your Team
   - Verify that the correct provisioning profile is selected
   - Add the App Sandbox capability
   - Configure App Sandbox entitlements:
     - Network: Incoming Connections (Server), Outgoing Connections (Client)
     - Hardware: Camera, Microphone
     - App Data: User Selected File (Read/Write)
     - User Data: Contacts, Calendars

### 2. Configure App Icons

1. Open Assets.xcassets in Xcode
2. Select AppIcon
3. Drag and drop your app icons into the appropriate slots (16pt, 32pt, 64pt, 128pt, 256pt, 512pt, 1024pt)

### 3. Update Info.plist

Ensure your Info.plist contains all necessary entries:

```xml
<key>CFBundleDisplayName</key>
<string>Ace Assistant</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>LSApplicationCategoryType</key>
<string>public.app-category.productivity</string>
<key>NSMicrophoneUsageDescription</key>
<string>Ace Assistant needs access to your microphone for voice commands.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Ace Assistant needs access to speech recognition for voice commands.</string>
<key>NSCalendarsUsageDescription</key>
<string>Ace Assistant needs access to your calendar to schedule meetings.</string>
<key>NSContactsUsageDescription</key>
<string>Ace Assistant needs access to your contacts to send emails and schedule meetings.</string>
<key>NSRemindersUsageDescription</key>
<string>Ace Assistant needs access to your reminders to create and manage tasks.</string>
```

### 4. Create App Store Screenshots

Create screenshots for all required sizes:

- 1280x800
- 1440x900
- 2560x1600
- 2880x1800

You can use the built-in screenshot tool (Shift+Command+5) to capture these screenshots.

### 5. Prepare App Store Metadata

Prepare the following information for App Store submission:

- App name
- App subtitle (30 characters max)
- App description (4000 characters max)
- Keywords (100 characters max)
- Support URL
- Marketing URL (optional)
- Privacy Policy URL
- App Store promotional text (170 characters max)
- App Store screenshots
- App Preview videos (optional)

## Building and Submitting Your App

### 1. Archive Your App

1. In Xcode, select "My Mac" as the build target
2. Select Product > Archive
3. Wait for the archiving process to complete

### 2. Validate Your App

1. In the Archives organizer, select your archive
2. Click "Validate App"
3. Select your distribution method (Mac App Store or Developer ID)
4. Follow the prompts to validate your app
5. Fix any issues that arise during validation

### 3. Upload to App Store Connect (Mac App Store Distribution)

1. In the Archives organizer, select your archive
2. Click "Distribute App"
3. Select "App Store Connect"
4. Select "Upload"
5. Follow the prompts to upload your app
6. Wait for the upload to complete and processing to finish

### 4. Export for Direct Distribution (Developer ID Distribution)

1. In the Archives organizer, select your archive
2. Click "Distribute App"
3. Select "Developer ID"
4. Follow the prompts to export your app
5. Wait for the export to complete

### 5. Notarize Your App (Developer ID Distribution Only)

Notarization is required for apps distributed outside the Mac App Store:

```bash
# Create a ZIP archive of your app
ditto -c -k --keepParent "path/to/AceAssistant.app" "path/to/AceAssistant.zip"

# Notarize the app
xcrun notarytool submit "path/to/AceAssistant.zip" --apple-id "your-apple-id@example.com" --password "app-specific-password" --team-id "YOUR_TEAM_ID"

# Check notarization status
xcrun notarytool history --apple-id "your-apple-id@example.com" --password "app-specific-password" --team-id "YOUR_TEAM_ID"

# Once notarized, staple the ticket to your app
xcrun stapler staple "path/to/AceAssistant.app"
```

### 6. Submit for Review (Mac App Store Distribution)

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Fill in all required metadata:
   - App Information
   - Pricing and Availability
   - App Privacy
   - App Store Information (including screenshots)
4. Click "Submit for Review"

## TestFlight Distribution (Mac App Store Only)

### 1. Internal Testing

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to the "TestFlight" tab
4. Add internal testers (limited to users in your organization)
5. Enable the build for internal testing

### 2. External Testing

1. Create a beta app review information
2. Add external testers or create a public link
3. Submit for Beta App Review
4. Once approved, notify your testers

## Direct Distribution (Developer ID)

### 1. Create a DMG Installer

You can use tools like `create-dmg` to create a DMG installer:

```bash
# Install create-dmg
brew install create-dmg

# Create DMG
create-dmg \
  --volname "Ace Assistant" \
  --volicon "path/to/icon.icns" \
  --background "path/to/background.png" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "AceAssistant.app" 200 190 \
  --hide-extension "AceAssistant.app" \
  --app-drop-link 600 185 \
  "AceAssistant.dmg" \
  "path/to/AceAssistant.app"
```

### 2. Host the DMG File

Host the DMG file on your website or a file hosting service.

### 3. Provide Installation Instructions

Create clear installation instructions for your users:

1. Download the DMG file
2. Open the DMG file
3. Drag the app to the Applications folder
4. Right-click the app and select "Open" (required for first launch of Developer ID apps)
5. Follow the on-screen instructions to complete installation

## App Store Optimization

### 1. App Name and Keywords

Choose a descriptive name and relevant keywords to improve discoverability.

### 2. App Description

Write a clear, compelling description that highlights your app's features and benefits.

### 3. Screenshots and Preview Videos

Create high-quality screenshots and videos that showcase your app's best features.

### 4. Ratings and Reviews

Encourage users to rate and review your app to improve its visibility.

## Post-Launch

### 1. Monitor Analytics

Use App Store Connect analytics to monitor downloads, usage, and user engagement.

### 2. Gather Feedback

Collect user feedback to identify areas for improvement.

### 3. Plan Updates

Schedule regular updates to fix bugs, add features, and keep your app fresh.

## Troubleshooting Common Issues

### 1. Signing and Notarization Issues

If you encounter signing or notarization issues:
- Verify that your certificates are valid
- Ensure your entitlements are correctly configured
- Check that your app is properly sandboxed

### 2. App Rejection

Common reasons for app rejection:
- Incomplete metadata
- Bugs or crashes
- Privacy concerns
- Non-compliance with App Store guidelines

Always carefully read the rejection reason and address the specific issues.

### 3. Gatekeeper Warnings

If users see Gatekeeper warnings:
- Ensure your app is properly signed with a Developer ID certificate
- Verify that your app is notarized
- Check that the notarization ticket is stapled to your app

## Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines for macOS](https://developer.apple.com/design/human-interface-guidelines/macos)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Notarizing macOS Software](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

## Conclusion

Following this macOS deployment guide will help ensure a smooth process for deploying your Ace Assistant application to macOS users, whether through the Mac App Store or direct distribution. Remember to thoroughly test your application before distribution to provide the best possible experience for your users.
