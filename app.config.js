const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

export default {
  name: IS_DEV
    ? "Smart IT Ticketing (Dev)"
    : IS_PREVIEW
    ? "Smart IT Ticketing (Preview)"
    : "Smart IT Ticketing",
  slug: "smart-it-ticketing",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./src/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/your-project-id", // Replace with your project ID
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV
      ? "com.yourcompany.smartitticketing.dev"
      : IS_PREVIEW
      ? "com.yourcompany.smartitticketing.preview"
      : "com.yourcompany.smartitticketing",
    buildNumber: "1.0.0",
    infoPlist: {
      NSCameraUsageDescription:
        "This app uses the camera to allow you to take photos for ticket attachments.",
      NSPhotoLibraryUsageDescription:
        "This app accesses your photos to allow you to attach them to tickets.",
      NSMicrophoneUsageDescription:
        "This app uses the microphone to allow you to record audio for ticket attachments.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: IS_DEV
      ? "com.yourcompany.smartitticketing.dev"
      : IS_PREVIEW
      ? "com.yourcompany.smartitticketing.preview"
      : "com.yourcompany.smartitticketing",
    versionCode: 1,
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "RECORD_AUDIO",
    ],
  },
  web: {
    favicon: "./src/assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "your-project-id", // Replace with your project ID
    },
    // For development on your local machine
    apiUrl: IS_DEV
      ? process.env.NODE_ENV === "web"
        ? "http://127.0.0.1:8000/api" // Use 127.0.0.1 for web testing
        : "http://10.0.2.2:8000/api" // Use 10.0.2.2 for Android emulator to access host machine
      : IS_PREVIEW
      ? "https://preview-api.yourcompany.com/api"
      : "https://api.yourcompany.com/api",
    wsUrl: IS_DEV
      ? process.env.NODE_ENV === "web"
        ? "ws://127.0.0.1:8000/ws" // Use 127.0.0.1 for web testing
        : "ws://10.0.2.2:8000/ws" // Use 10.0.2.2 for Android emulator to access host machine
      : IS_PREVIEW
      ? "wss://preview-api.yourcompany.com/ws"
      : "wss://api.yourcompany.com/ws",
  },
  plugins: [
    [
      "expo-document-picker",
      {
        iCloudContainerEnvironment: "Production",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to allow you to attach them to tickets.",
        cameraPermission:
          "The app uses the camera to allow you to take photos for ticket attachments.",
      },
    ],
  ],
};
