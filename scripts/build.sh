#!/bin/bash

# Build the app for production
echo "Building app for production..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
  echo "Installing EAS CLI..."
  npm install -g eas-cli
fi

# Login to Expo (if not already logged in)
echo "Checking Expo login status..."
eas whoami || eas login

# Build for Android
echo "Building for Android..."
eas build --platform android --profile production

# Build for iOS (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Building for iOS..."
  eas build --platform ios --profile production
else
  echo "Skipping iOS build (not on macOS)"
fi

echo "Build process initiated. Check the Expo dashboard for build status."