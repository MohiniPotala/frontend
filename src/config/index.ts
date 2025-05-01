import Constants from "expo-constants";

// Backend API configuration
export const API_CONFIG = {
  // API base URL - hardcoded to ensure it works
  baseURL: "http://127.0.0.1:8000/api",

  // WebSocket URL for real-time features
  wsURL: "ws://127.0.0.1:8000/ws",

  // API timeout in milliseconds
  timeout: 30000, // Increased timeout for slower connections
};

// Log API configuration on startup
console.log("API Configuration:");
console.log("- Base URL:", API_CONFIG.baseURL);
console.log("- WebSocket URL:", API_CONFIG.wsURL);

// App configuration
export const APP_CONFIG = {
  // App name
  appName: Constants.expoConfig?.name || "Smart IT Ticketing",

  // App version
  version: Constants.expoConfig?.version || "1.0.0",

  // Environment (development, preview, production)
  environment: process.env.APP_VARIANT || "development",

  // Is development environment
  isDev: (process.env.APP_VARIANT || "development") === "development",
};

export default {
  api: API_CONFIG,
  app: APP_CONFIG,
};
