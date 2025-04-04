# Deployment Guide for Ace Assistant

This comprehensive guide outlines the steps required to deploy the Ace Assistant application to both iOS and macOS platforms. Follow these instructions to ensure a smooth deployment process.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [iOS Deployment](#ios-deployment)
4. [macOS Deployment](#macos-deployment)
5. [App Store Submission](#app-store-submission)
6. [Continuous Integration/Deployment](#continuous-integrationdeployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the deployment process, ensure you have the following:

- Apple Developer Account ($99/year)
- Xcode 15.0 or later
- Node.js 18.0 or later
- Yarn or npm
- Git
- React Native CLI
- CocoaPods (for iOS dependencies)
- Physical iOS device (iPhone) for testing (optional but recommended)
- Physical macOS device for testing (optional but recommended)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/ace-assistant.git
cd ace-assistant
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Install iOS dependencies
cd ios && pod install && cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```
API_URL=https://your-api-url.com
GOOGLE_MEET_API_KEY=your_google_meet_api_key
SUPERHUMAN_API_KEY=your_superhuman_api_key
```

For production builds, create a `.env.production` file with production values.

### 4. Set Up Certificates and Provisioning Profiles

#### For iOS:

1. Log in to the [Apple Developer Portal](https://developer.apple.com)
2. Navigate to Certificates, IDs & Profiles
3. Create an App ID for your application
4. Create Development and Distribution certificates
5. Create Provisioning Profiles for development and distribution

#### For macOS:

1. Log in to the [Apple Developer Portal](https://developer.apple.com)
2. Navigate to Certificates, IDs & Profiles
3. Create an App ID for your macOS application
4. Create Development and Distribution certificates
5. Create Provisioning Profiles for development and distribution

## iOS Deployment

### 1. Configure App Settings

Open `ios/AceAssistant.xcworkspace` in Xcode and configure the following:

1. Update Bundle Identifier to match your App ID
2. Set the Development Team
3. Configure app capabilities:
   - Push Notifications
   - Background Modes (Background fetch, Remote notifications)
   - Keychain Sharing
   - Associated Domains (if using universal links)

### 2. Update App Icons and Launch Screen

1. Replace the placeholder icons in `ios/AceAssistant/Images.xcassets/AppIcon.appiconset`
2. Update the launch screen in `ios/AceAssistant/LaunchScreen.storyboard`

### 3. Build for Testing (TestFlight)

#### Using Xcode:

1. Select the "AceAssistant" scheme
2. Select "Generic iOS Device" as the build target
3. Go to Product > Archive
4. Once archiving is complete, click "Distribute App"
5. Select "App Store Connect" and follow the prompts
6. Choose "Upload" to send the build to TestFlight

#### Using Command Line:

```bash
# Build the JavaScript bundle
npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios

# Build and archive the app
cd ios
xcodebuild -workspace AceAssistant.xcworkspace -scheme AceAssistant -configuration Release -archivePath build/AceAssistant.xcarchive archive
xcodebuild -exportArchive -archivePath build/AceAssistant.xcarchive -exportOptionsPlist exportOptions.plist -exportPath build
```

Create an `exportOptions.plist` file in the `ios` directory with the following content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

### 4. Production Release

After testing in TestFlight and confirming everything works correctly:

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new iOS app or select your existing app
3. Fill in all required metadata:
   - App name
   - Description
   - Keywords
   - Support URL
   - Marketing URL
   - Privacy Policy URL
4. Upload screenshots for all required device sizes
5. Set up app pricing and availability
6. Submit for review

## macOS Deployment

### 1. Configure macOS Project

```bash
# Create macOS specific folder if not already present
mkdir -p macos

# Copy configuration files
cp ios/Podfile macos/
```

Modify the `macos/Podfile` to target macOS instead of iOS.

### 2. Configure App Settings

Open `macos/AceAssistant.xcworkspace` in Xcode and configure the following:

1. Update Bundle Identifier to match your macOS App ID
2. Set the Development Team
3. Configure app capabilities:
   - App Sandbox
   - Network access
   - User notifications

### 3. Update App Icons

1. Replace the placeholder icons in `macos/AceAssistant/Assets.xcassets/AppIcon.appiconset`

### 4. Build for Testing

#### Using Xcode:

1. Select the "AceAssistant-macOS" scheme
2. Go to Product > Archive
3. Once archiving is complete, click "Distribute App"
4. Select "Developer ID" for direct distribution or "Mac App Store" for App Store distribution

#### Using Command Line:

```bash
# Build the JavaScript bundle
npx react-native bundle --entry-file index.js --platform macos --dev false --bundle-output macos/main.jsbundle --assets-dest macos

# Build and archive the app
cd macos
xcodebuild -workspace AceAssistant.xcworkspace -scheme AceAssistant-macOS -configuration Release -archivePath build/AceAssistant.xcarchive archive
xcodebuild -exportArchive -archivePath build/AceAssistant.xcarchive -exportOptionsPlist exportOptions.plist -exportPath build
```

Create an `exportOptions.plist` file in the `macos` directory with the following content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>mac-app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

### 5. Notarize the App (for direct distribution)

If distributing outside the Mac App Store, you must notarize your app:

```bash
# Create a ZIP archive of your app
ditto -c -k --keepParent "build/AceAssistant.app" "build/AceAssistant.zip"

# Notarize the app
xcrun notarytool submit "build/AceAssistant.zip" --apple-id "your-apple-id@example.com" --password "app-specific-password" --team-id "YOUR_TEAM_ID"

# Check notarization status
xcrun notarytool history --apple-id "your-apple-id@example.com" --password "app-specific-password" --team-id "YOUR_TEAM_ID"

# Once notarized, staple the ticket to your app
xcrun stapler staple "build/AceAssistant.app"
```

### 6. Production Release

After testing and confirming everything works correctly:

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new macOS app or select your existing app
3. Fill in all required metadata:
   - App name
   - Description
   - Keywords
   - Support URL
   - Marketing URL
   - Privacy Policy URL
4. Upload screenshots for all required device sizes
5. Set up app pricing and availability
6. Submit for review

## App Store Submission

### App Store Guidelines Compliance

Ensure your app complies with the [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/):

1. **Privacy**:
   - Implement a privacy policy
   - Request user consent for data collection
   - Include privacy labels in App Store Connect

2. **Content**:
   - Ensure all content is appropriate
   - Implement content moderation for user-generated content

3. **Functionality**:
   - Test all features thoroughly
   - Ensure app doesn't crash or have major bugs

4. **Design**:
   - Follow Apple's Human Interface Guidelines
   - Ensure accessibility compliance

### App Store Optimization (ASO)

Optimize your App Store listing:

1. **App Name**: Include relevant keywords
2. **Keywords**: Research and use high-traffic, relevant keywords
3. **Description**: Clearly explain app features and benefits
4. **Screenshots**: Create compelling, informative screenshots
5. **App Preview Videos**: Create short videos demonstrating key features
6. **Ratings and Reviews**: Encourage satisfied users to leave positive reviews

## Continuous Integration/Deployment

Set up CI/CD for automated builds and deployments:

### Using GitHub Actions

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: yarn install
      - name: Install CocoaPods
        run: cd ios && pod install
      - name: Build iOS
        run: |
          cd ios
          xcodebuild -workspace AceAssistant.xcworkspace -scheme AceAssistant -configuration Release -sdk iphoneos build CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: yarn install
      - name: Install CocoaPods
        run: cd macos && pod install
      - name: Build macOS
        run: |
          cd macos
          xcodebuild -workspace AceAssistant.xcworkspace -scheme AceAssistant-macOS -configuration Release build CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO
```

### Using Fastlane

Create a `fastlane` directory with the following structure:

```
fastlane/
├── Appfile
├── Fastfile
└── Matchfile
```

`Appfile`:
```ruby
app_identifier("com.yourcompany.aceassistant")
apple_id("your-apple-id@example.com")
team_id("YOUR_TEAM_ID")
```

`Fastfile`:
```ruby
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number
    build_app(workspace: "ios/AceAssistant.xcworkspace", scheme: "AceAssistant")
    upload_to_testflight
  end

  desc "Build and upload to App Store"
  lane :release do
    increment_build_number
    build_app(workspace: "ios/AceAssistant.xcworkspace", scheme: "AceAssistant")
    upload_to_app_store(
      skip_metadata: true,
      skip_screenshots: true
    )
  end
end

platform :mac do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number
    build_mac_app(workspace: "macos/AceAssistant.xcworkspace", scheme: "AceAssistant-macOS")
    upload_to_testflight
  end

  desc "Build and upload to Mac App Store"
  lane :release do
    increment_build_number
    build_mac_app(workspace: "macos/AceAssistant.xcworkspace", scheme: "AceAssistant-macOS")
    upload_to_app_store(
      skip_metadata: true,
      skip_screenshots: true
    )
  end
end
```

## Troubleshooting

### Common Issues and Solutions

#### Build Errors

1. **Missing Dependencies**:
   ```
   Error: Unable to resolve module X
   ```
   Solution: Run `npm install` or `yarn install` to ensure all dependencies are installed.

2. **CocoaPods Issues**:
   ```
   Error: Cannot find module 'some-pod'
   ```
   Solution: Run `cd ios && pod install` to install all CocoaPods dependencies.

3. **Xcode Build Errors**:
   ```
   Code Sign Error: No matching provisioning profiles found
   ```
   Solution: Ensure you have the correct provisioning profiles and certificates installed.

#### Deployment Errors

1. **TestFlight Upload Failure**:
   ```
   ERROR ITMS-90000: "Invalid Bundle"
   ```
   Solution: Verify your bundle identifier matches your App ID in the Apple Developer Portal.

2. **App Store Rejection**:
   Common reasons:
   - Incomplete metadata
   - Crashes during review
   - Privacy concerns
   - Misleading descriptions

   Solution: Carefully read the rejection reason and address the specific issues.

### Support Resources

- [Apple Developer Forums](https://developer.apple.com/forums/)
- [React Native GitHub Issues](https://github.com/facebook/react-native/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

## Conclusion

Following this deployment guide will help ensure a smooth process for deploying your Ace Assistant application to both iOS and macOS platforms. Remember to thoroughly test your application before submitting it to the App Store to provide the best possible experience for your users.

For any questions or issues not covered in this guide, please contact the development team at support@aceassistant.com.
