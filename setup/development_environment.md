# Development Environment Setup for Ace Assistant

This document outlines the setup process for the Ace Assistant development environment, focusing on creating a React Native application with macOS support that provides a personalized executive assistant with bilingual capabilities.

## Prerequisites

### Required Software

- **Node.js** (v16.0.0 or newer)
- **npm** (v8.0.0 or newer)
- **Watchman** (for file system monitoring)
- **Xcode** (14.0 or newer, for iOS and macOS development)
- **CocoaPods** (for iOS and macOS dependency management)
- **Git** (for version control)

### Development Platforms

- **macOS** (required for iOS and macOS app development)
- **iOS Simulator** (included with Xcode)
- **Physical iOS device** (for testing voice recognition)

## Installation Instructions

### 1. Install Node.js and npm

```bash
# Using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

### 2. Install Watchman

```bash
# Using Homebrew
brew install watchman

# Verify installation
watchman --version
```

### 3. Install Xcode

1. Download and install Xcode from the Mac App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Accept Xcode license:
   ```bash
   sudo xcodebuild -license accept
   ```

### 4. Install CocoaPods

```bash
sudo gem install cocoapods

# Verify installation
pod --version
```

### 5. Install React Native CLI

```bash
npm install -g react-native-cli

# Verify installation
react-native --version
```

## Project Setup

### 1. Create React Native Project

```bash
npx react-native init AceAssistant --template react-native-template-typescript
cd AceAssistant
```

### 2. Add macOS Support

```bash
npx react-native-macos-init
```

### 3. Install Required Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-vector-icons
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install react-native-linear-gradient

# Voice Recognition
npm install @react-native-voice/voice
npm install expo-speech-recognition
npm install @picovoice/react-native-voice-processor
npm install @picovoice/picovoice-react-native

# State Management
npm install @reduxjs/toolkit react-redux
npm install redux-persist

# API Integration
npm install axios
npm install react-native-dotenv

# Firebase Integration
npm install @react-native-firebase/app
npm install @react-native-firebase/firestore
npm install @react-native-firebase/auth
npm install @react-native-firebase/storage

# Calendar Integration
npm install react-native-calendars
npm install react-native-google-signin
npm install @react-native-community/datetimepicker

# Email Integration
npm install react-native-mail

# Utilities
npm install date-fns
npm install lodash
npm install uuid
npm install react-native-device-info
```

### 4. Configure iOS Permissions

Edit `ios/AceAssistant/Info.plist` to add the following permissions:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Ace needs access to your microphone for voice commands</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Ace needs speech recognition to process voice commands</string>
<key>NSCalendarsUsageDescription</key>
<string>Ace needs access to your calendar to manage events</string>
<key>NSRemindersUsageDescription</key>
<string>Ace needs access to your reminders to manage tasks</string>
```

### 5. Configure macOS Permissions

Edit `macos/AceAssistant/Info.plist` to add the following permissions:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Ace needs access to your microphone for voice commands</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Ace needs speech recognition to process voice commands</string>
<key>NSCalendarsUsageDescription</key>
<string>Ace needs access to your calendar to manage events</string>
<key>NSRemindersUsageDescription</key>
<string>Ace needs access to your reminders to manage tasks</string>
```

## Project Structure

Create the following directory structure for the project:

```
AceAssistant/
├── src/
│   ├── components/
│   │   ├── branding/
│   │   ├── calendar/
│   │   ├── common/
│   │   ├── email/
│   │   ├── meetings/
│   │   ├── settings/
│   │   ├── tasks/
│   │   └── voice/
│   ├── constants/
│   ├── hooks/
│   ├── localization/
│   ├── navigation/
│   ├── screens/
│   │   ├── iphone/
│   │   ├── mac/
│   │   └── welcome/
│   ├── services/
│   │   ├── agents/
│   │   │   ├── email/
│   │   │   ├── research/
│   │   │   ├── scheduling/
│   │   │   ├── task/
│   │   │   └── writing/
│   │   ├── reminders/
│   │   ├── sync/
│   │   └── translation/
│   ├── store/
│   ├── theme/
│   ├── types/
│   └── utils/
├── ios/
├── macos/
├── android/
└── assets/
    ├── fonts/
    └── images/
```

## Running the Application

### iOS

```bash
# Install CocoaPods dependencies
cd ios && pod install && cd ..

# Run on iOS Simulator
npx react-native run-ios

# Run on physical device
npx react-native run-ios --device
```

### macOS

```bash
# Install CocoaPods dependencies
cd macos && pod install && cd ..

# Run on macOS
npx react-native-macos run-macos
```

## Development Workflow

1. **Local Development**: Use the iOS Simulator and macOS app for rapid development and testing
2. **Device Testing**: Test on physical iOS devices for voice recognition and real-world performance
3. **TestFlight Distribution**: Use TestFlight for iOS testing instead of App Store deployment
4. **Direct macOS Installation**: Create a direct .app distribution for macOS instead of Mac App Store

## API Keys and Configuration

Create a `.env` file in the project root with the following variables (replace with actual values during deployment):

```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

PERPLEXITY_API_KEY=your_perplexity_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

PICOVOICE_API_KEY=your_picovoice_api_key
```

## Next Steps

After setting up the development environment, proceed with:

1. Implementing the core functionality
2. Developing the voice command system with bilingual support
3. Creating the reminder and organization features
4. Building the iPhone and Mac interfaces
5. Implementing cross-device synchronization

This setup provides a foundation for developing the Ace Assistant as a personalized tool specifically for you as an entrepreneur and CEO, with bilingual support and multi-agent capabilities.
