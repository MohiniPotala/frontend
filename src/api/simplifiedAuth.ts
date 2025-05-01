import { User } from "../types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API base URL
const API_BASE_URL = "http://127.0.0.1:8000/api";

// Interface for login response
interface LoginResponse {
  session_token: string;
  user_id: number;
  expires_at: string;
}

/**
 * Simplified auth API using direct fetch calls
 * This bypasses axios to avoid any potential issues
 */
export const simplifiedAuthApi = {
  // Expose the base URL for direct fetch calls
  baseUrl: API_BASE_URL,
  // Request OTP for login or registration
  requestOtp: async (email: string): Promise<void> => {
    try {
      console.log("Requesting OTP for email:", email);

      // Make sure email is properly formatted
      const formattedEmail = email.trim().toLowerCase();

      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: formattedEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OTP request failed:", errorData);
        throw new Error(errorData.detail || "Failed to request OTP");
      }

      const data = await response.json();
      console.log("OTP request successful:", data);
      return data;
    } catch (error) {
      console.error("OTP request failed:", error);
      throw error;
    }
  },

  // Verify OTP and get user info
  verifyOtp: async (email: string, otp: string): Promise<User> => {
    try {
      console.log("Verifying OTP for email:", email);

      // Make sure email and OTP are properly formatted
      const formattedEmail = email.trim().toLowerCase();
      const formattedOtp = otp.trim();

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formattedEmail,
          otp: formattedOtp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OTP verification failed:", errorData);
        throw new Error(errorData.detail || "Failed to verify OTP");
      }

      const data = await response.json();
      console.log("OTP verification successful:", data);
      return data;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  },

  // Set password after OTP verification
  setPassword: async (
    email: string,
    otp: string,
    password: string,
    role?: string,
    fullName?: string,
    department?: string,
    location?: string,
    phoneNumber?: string
  ): Promise<User> => {
    try {
      console.log("Setting password for email:", email);

      // Make sure email and OTP are properly formatted
      const formattedEmail = email.trim().toLowerCase();
      const formattedOtp = otp.trim();

      const requestBody: any = {
        email: formattedEmail,
        otp: formattedOtp,
        password,
        full_name: fullName || email.split("@")[0], // Use part of email as fallback
      };

      // Add role if provided
      if (role) {
        requestBody.role = role;
      }

      // Add optional fields if provided
      if (department) requestBody.department = department;
      if (location) requestBody.location = location;
      if (phoneNumber) requestBody.phone_number = phoneNumber;

      const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Set password failed:", errorData);
        throw new Error(errorData.detail || "Failed to set password");
      }

      const data = await response.json();
      console.log("Set password successful:", data);
      return data;
    } catch (error) {
      console.error("Set password failed:", error);

      // If it's already a formatted error with a message, just throw it
      if (error.message && error.message !== "[object Object]") {
        throw error;
      }

      // Otherwise, create a more user-friendly error
      throw new Error(
        "Failed to set password. Please check your connection and try again."
      );
    }
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log("Logging in with password for email:", email);

      // Make sure email is properly formatted
      const formattedEmail = email.trim().toLowerCase();

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formattedEmail,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Password login failed:", errorData);
        throw new Error(errorData.detail || "Failed to login");
      }

      const data = await response.json();
      console.log("Password login successful:", data);
      return data;
    } catch (error) {
      console.error("Password login failed:", error);
      throw error;
    }
  },

  // Login with OTP
  loginWithOtp: async (email: string, otp: string): Promise<LoginResponse> => {
    try {
      console.log("Logging in with OTP for email:", email);

      // Make sure email and OTP are properly formatted
      const formattedEmail = email.trim().toLowerCase();
      const formattedOtp = otp.trim();

      const response = await fetch(`${API_BASE_URL}/auth/login-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formattedEmail,
          otp: formattedOtp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OTP login failed:", errorData);
        throw new Error(errorData.detail || "Failed to login with OTP");
      }

      const data = await response.json();
      console.log("OTP login successful:", data);
      return data;
    } catch (error) {
      console.error("OTP login failed:", error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      console.log("API: Logging out user");

      // Get token for authenticated methods
      const token = await AsyncStorage.getItem("token");
      console.log("API: Token for logout:", token ? "Found token" : "No token");

      // Try all methods in sequence, starting with the most reliable ones

      // Method 1: Try with token in body (most reliable)
      if (token) {
        try {
          console.log("API: Trying logout with token in body");
          const bodyResponse = await fetch(
            `${API_BASE_URL}/auth/logout-with-body`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ token: token }),
            }
          );

          console.log("API: Body method response status:", bodyResponse.status);

          if (bodyResponse.ok) {
            console.log("API: Logout successful with body method");
            return;
          }
        } catch (e) {
          console.warn("API: Logout with body method failed:", e);
        }
      }

      // Method 2: Try the no-auth logout endpoint
      try {
        console.log("API: Trying no-auth logout endpoint");
        const noAuthResponse = await fetch(
          `${API_BASE_URL}/auth/logout-no-auth`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          }
        );

        console.log(
          "API: No-auth method response status:",
          noAuthResponse.status
        );

        if (noAuthResponse.ok) {
          console.log("API: No-auth logout successful");
          return;
        }
      } catch (e) {
        console.warn("API: No-auth logout method failed:", e);
      }

      // Method 3: Try with token in header
      if (token) {
        try {
          console.log("API: Trying logout with token in header");
          const headerResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "X-Session-Token": token,
            },
          });

          console.log(
            "API: Header method response status:",
            headerResponse.status
          );

          if (headerResponse.ok) {
            console.log("API: Logout successful with header method");
            return;
          }
        } catch (e) {
          console.warn("API: Logout with header method failed:", e);
        }
      }

      // Method 4: Try with token in query parameter
      if (token) {
        try {
          console.log("API: Trying logout with token in query parameter");
          const queryResponse = await fetch(
            `${API_BASE_URL}/auth/logout?token=${token}`,
            {
              method: "POST",
              headers: {
                Accept: "application/json",
              },
            }
          );

          console.log(
            "API: Query method response status:",
            queryResponse.status
          );

          if (queryResponse.ok) {
            console.log("API: Logout successful with query parameter method");
            return;
          }
        } catch (e) {
          console.warn("API: Logout with query parameter method failed:", e);
        }
      }

      console.warn(
        "API: All logout methods failed, but continuing with local logout"
      );
    } catch (error) {
      console.warn("API: Logout request failed:", error);
      // Don't throw - we want the local logout to succeed
    }
  },

  // Get current user info
  getCurrentUser: async (token?: string): Promise<User> => {
    try {
      console.log("Getting current user info");

      const storedToken = token || (await AsyncStorage.getItem("token"));
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (storedToken) {
        headers["X-Session-Token"] = storedToken;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Get user failed:", errorData);
        throw new Error(errorData.detail || "Failed to get user info");
      }

      const data = await response.json();
      console.log("Get user successful:", data);
      return data;
    } catch (error) {
      console.error("Get user failed:", error);
      throw error;
    }
  },
};
