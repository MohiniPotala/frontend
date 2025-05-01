import apiClient from "./client";
import { User } from "../types/user";
import { API_CONFIG } from "../config";
import { directFetch } from "../utils/directFetch";

interface LoginResponse {
  session_token: string;
  user_id: number;
  expires_at: string;
}

export const authApi = {
  // Request OTP for login or registration
  requestOtp: async (email: string): Promise<void> => {
    try {
      console.log("Requesting OTP for email:", email);
      console.log("API URL:", API_CONFIG.baseURL + "/auth/request-otp");

      // Make sure email is properly formatted
      const formattedEmail = email.trim().toLowerCase();

      try {
        // First try with axios
        const response = await apiClient.post("/auth/request-otp", {
          email: formattedEmail,
        });
        console.log("OTP request successful with axios:", response.data);
        return response.data;
      } catch (axiosError) {
        console.error("Axios request failed, trying direct fetch:", axiosError);

        // If axios fails, try with direct fetch
        const directUrl = `${API_CONFIG.baseURL}/auth/request-otp`;
        const directResponse = await directFetch(
          directUrl,
          "POST",
          { email: formattedEmail },
          false // Don't include token for OTP request
        );

        console.log(
          "OTP request successful with direct fetch:",
          directResponse.data
        );
        return directResponse.data;
      }
    } catch (error) {
      console.error("OTP request failed with both methods:", error);

      // Add more detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }

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

      try {
        // First try with axios
        const response = await apiClient.post("/auth/verify-otp", {
          email: formattedEmail,
          otp: formattedOtp,
        });

        console.log("OTP verification successful with axios");
        return response.data;
      } catch (axiosError) {
        console.error(
          "Axios verification failed, trying direct fetch:",
          axiosError
        );

        // If axios fails, try with direct fetch
        const directUrl = `${API_CONFIG.baseURL}/auth/verify-otp`;
        const directResponse = await directFetch(
          directUrl,
          "POST",
          {
            email: formattedEmail,
            otp: formattedOtp,
          },
          false // Don't include token for OTP verification
        );

        console.log("OTP verification successful with direct fetch");
        return directResponse.data;
      }
    } catch (error) {
      console.error("OTP verification failed with both methods:", error);

      // Add more detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

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

      // Create request body
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

      try {
        // First try with axios
        const response = await apiClient.post(
          "/auth/set-password",
          requestBody
        );

        console.log("Set password successful with axios");
        return response.data;
      } catch (axiosError) {
        console.error(
          "Axios set password failed, trying direct fetch:",
          axiosError
        );

        // If axios fails, try with direct fetch
        const directUrl = `${API_CONFIG.baseURL}/auth/set-password`;
        const directResponse = await directFetch(
          directUrl,
          "POST",
          requestBody,
          false // Don't include token for password setup
        );

        console.log("Set password successful with direct fetch");
        return directResponse.data;
      }
    } catch (error) {
      console.error("Set password failed with both methods:", error);

      // Provide more detailed error message
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        throw new Error(error.response.data.detail || "Failed to set password");
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error(
          "No response received from server. Please check your connection."
        );
      } else {
        console.error("Error message:", error.message);
        throw error;
      }
    }
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log("Logging in with password for email:", email);

      // Make sure email is properly formatted
      const formattedEmail = email.trim().toLowerCase();

      try {
        // First try with axios
        const response = await apiClient.post("/auth/login", {
          email: formattedEmail,
          password,
        });

        console.log("Password login successful with axios");
        return response.data;
      } catch (axiosError) {
        console.error("Axios login failed, trying direct fetch:", axiosError);

        // If axios fails, try with direct fetch
        const directUrl = `${API_CONFIG.baseURL}/auth/login`;
        const directResponse = await directFetch(
          directUrl,
          "POST",
          {
            email: formattedEmail,
            password,
          },
          false // Don't include token for login
        );

        console.log("Password login successful with direct fetch");
        return directResponse.data;
      }
    } catch (error) {
      console.error("Password login failed with both methods:", error);

      // Add more detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

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

      try {
        // First try with axios
        const response = await apiClient.post("/auth/login-otp", {
          email: formattedEmail,
          otp: formattedOtp,
        });

        console.log("OTP login successful with axios");
        return response.data;
      } catch (axiosError) {
        console.error("Axios login failed, trying direct fetch:", axiosError);

        // If axios fails, try with direct fetch
        const directUrl = `${API_CONFIG.baseURL}/auth/login-otp`;
        const directResponse = await directFetch(
          directUrl,
          "POST",
          {
            email: formattedEmail,
            otp: formattedOtp,
          },
          false // Don't include token for OTP login
        );

        console.log("OTP login successful with direct fetch");
        return directResponse.data;
      }
    } catch (error) {
      console.error("OTP login failed with both methods:", error);

      // Add more detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      console.log("Logging out user");

      try {
        // First try with axios
        await apiClient.post("/auth/logout");
        console.log("Logout successful with axios");
      } catch (axiosError) {
        console.error("Axios logout failed, trying direct fetch:", axiosError);

        // If axios fails, try with direct fetch
        const directUrl = `${API_CONFIG.baseURL}/auth/logout`;
        await directFetch(
          directUrl,
          "POST",
          undefined,
          true // Include token for logout
        );

        console.log("Logout successful with direct fetch");
      }
    } catch (error) {
      console.error("Logout failed with both methods:", error);
      throw error;
    }
  },

  // Get current user info
  getCurrentUser: async (token?: string): Promise<User> => {
    try {
      console.log("Getting current user info");

      const config = token
        ? { headers: { "X-Session-Token": token } }
        : undefined;

      try {
        // First try with axios
        const response = await apiClient.get("/auth/me", config);
        console.log("Get user successful with axios");
        return response.data;
      } catch (axiosError) {
        console.error(
          "Axios get user failed, trying direct fetch:",
          axiosError
        );

        // If axios fails, try with direct fetch
        const directUrl = `${API_CONFIG.baseURL}/auth/me`;
        const directResponse = await directFetch(
          directUrl,
          "GET",
          undefined,
          true // Include token for getting current user
        );
        console.log("Get user successful with direct fetch");
        return directResponse.data;
      }
    } catch (error) {
      console.error("Get user failed with both methods:", error);
      throw error;
    }
  },
};
