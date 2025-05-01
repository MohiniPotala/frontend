import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import removed to fix unused variable warning

// Import API config
import { API_CONFIG } from "../config";

// Create axios instance with fixed configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL, // Use from config
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: API_CONFIG.timeout, // Use from config
  withCredentials: false, // Don't send cookies with cross-origin requests
  // Add retry logic for network errors
  maxRedirects: 5,
  // Don't transform request data for multipart/form-data
  transformRequest: [
    function (data, headers) {
      // If it's FormData, don't transform it
      if (data instanceof FormData) {
        // Remove Content-Type so browser can set it with boundary
        if (headers) {
          headers["Content-Type"] = "multipart/form-data";
        }
        return data;
      }

      // For JSON data, use the default transformer
      if (data && headers && headers["Content-Type"] === "application/json") {
        return JSON.stringify(data);
      }

      return data;
    },
  ],
});

// Log configuration
console.log("API Client configured with baseURL:", apiClient.defaults.baseURL);

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Log outgoing requests in development
      console.log(`API Request ${config.method?.toUpperCase()} ${config.url}`);

      // Get token for all requests
      const token = await AsyncStorage.getItem("token");

      // Special handling for specific endpoints
      if (config.url === "/auth/logout") {
        console.log("Preparing logout request with token");
        if (token) {
          config.headers["X-Session-Token"] = token;
          console.log("Added token to logout request headers");
        } else {
          console.warn("No token available for logout request");
        }
      } else if (config.url === "/users/me" && config.method === "put") {
        console.log("Preparing profile update request with token");
        if (token) {
          config.headers["X-Session-Token"] = token;
          console.log("Added token to profile update request headers");
        } else {
          console.warn("No token available for profile update request");
        }
      } else {
        // For all other requests
        if (token) {
          config.headers["X-Session-Token"] = token;
        }
      }

      // Log the headers being sent
      console.log("Request headers:", config.headers);

      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    console.log(
      `API Response [${
        response.status
      }] ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        `API Error [${
          error.response.status
        }] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}:`,
        error.response.data
      );

      // Handle 401 Unauthorized errors
      if (error.response.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;

        // Clear token and user data
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");

        // Redirect to login (handled by the auth context)
        console.log("Unauthorized access, clearing auth data");
        return Promise.reject(error);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        `API Request Error [No Response] ${originalRequest?.method?.toUpperCase()} ${
          originalRequest?.url
        }:`,
        error.request
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`API Setup Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
