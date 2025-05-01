import apiClient from "./client";
import { User, UserUpdate } from "../types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const usersApi = {
  // Get all users (IT staff only)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get("/users");
      return response.data;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },

  // Get all IT staff
  getItStaff: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get("/users/it-staff");
      return response.data;
    } catch (error) {
      console.error("Error getting IT staff:", error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error);
      throw error;
    }
  },

  // Update current user
  updateCurrentUser: async (userData: UserUpdate): Promise<User> => {
    try {
      console.log("Updating user profile with data:", userData);

      // Get token to ensure it's available
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token available for profile update");
        throw new Error("Authentication token not found");
      }

      // Make the API call with explicit headers
      const response = await apiClient.put("/users/me", userData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Session-Token": token,
        },
      });

      console.log("Profile update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);

      // Log more detailed error information
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

      throw error;
    }
  },
};
