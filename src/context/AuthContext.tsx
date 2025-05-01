import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import removed to fix unused variable warning
import { simplifiedAuthApi } from "../api/simplifiedAuth";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<User>;
  logout: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  loginWithOtp: async () => {},
  requestOtp: async () => {},
  verifyOtp: async () => ({} as User),
  logout: async () => false,
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user and token from AsyncStorage
    const loadUserAndToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Logging in with password for:", email);

      // Use simplified API instead of axios-based API
      const response = await simplifiedAuthApi.login(email, password);
      console.log("Login successful, got token");

      // Save token and user data
      await AsyncStorage.setItem("token", response.session_token);

      // Fetch user data
      const userData = await simplifiedAuthApi.getCurrentUser(
        response.session_token
      );
      console.log("Retrieved user data");
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      setToken(response.session_token);
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOtp = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      console.log("Logging in with OTP for:", email);

      // Use simplified API instead of axios-based API
      const response = await simplifiedAuthApi.loginWithOtp(email, otp);
      console.log("OTP login successful, got token");

      // Save token and user data
      await AsyncStorage.setItem("token", response.session_token);

      // Fetch user data
      const userData = await simplifiedAuthApi.getCurrentUser(
        response.session_token
      );
      console.log("Retrieved user data");
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      setToken(response.session_token);
      setUser(userData);
    } catch (error) {
      console.error("OTP login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (email: string) => {
    try {
      console.log("Requesting OTP for:", email);
      // Use simplified API instead of axios-based API
      await simplifiedAuthApi.requestOtp(email);
      console.log("OTP request successful");
    } catch (error) {
      console.error("Request OTP error:", error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<User> => {
    try {
      console.log("Verifying OTP for:", email);
      // Use simplified API instead of axios-based API
      const userData = await simplifiedAuthApi.verifyOtp(email, otp);
      console.log("OTP verification successful");
      return userData;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user");
      setIsLoading(true);

      // Try to call the API logout endpoint BEFORE clearing local state
      try {
        console.log("Sending logout request to server");

        // First try with no-auth logout endpoint - this should always work
        const noAuthResponse = await fetch(
          `${simplifiedAuthApi.baseUrl}/auth/logout-no-auth`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          }
        );

        console.log(
          "No-auth logout API response status:",
          noAuthResponse.status
        );

        if (noAuthResponse.ok) {
          console.log("Server logout successful with no-auth method");
        } else {
          console.warn(
            "Server no-auth logout returned status:",
            noAuthResponse.status
          );

          // If no-auth method fails, try with the API method
          await simplifiedAuthApi.logout();
        }
      } catch (apiError) {
        console.warn(
          "Logout API call failed, but will continue with local logout:",
          apiError
        );
      }

      // Now clear local state
      setToken(null);
      setUser(null);

      // Clear stored data
      console.log("Clearing local storage");
      try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");

        // Clear any other app-related data from AsyncStorage
        await AsyncStorage.removeItem("lastTicketId");
        await AsyncStorage.removeItem("lastChatTimestamp");
      } catch (storageError) {
        console.error("Error clearing AsyncStorage:", storageError);
      }

      // Force reload the app to ensure all states are reset
      // This is a more reliable way to ensure the app is in a clean state after logout
      console.log("Forcing app to reset state after logout");

      return true;
    } catch (error) {
      console.error("Logout error:", error);

      // Ensure state is cleared even if there's an error
      setToken(null);
      setUser(null);

      try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("lastTicketId");
        await AsyncStorage.removeItem("lastChatTimestamp");
      } catch (e) {
        console.error("Final attempt to clear storage failed:", e);
      }

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    loginWithOtp,
    requestOtp,
    verifyOtp,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
