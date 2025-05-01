import React from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import { AuthProvider, useAuth } from "../AuthContext";
import { authApi } from "../../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserRole } from "../../types/user";

// Mock the auth API
jest.mock("../../api/auth", () => ({
  authApi: {
    login: jest.fn(),
    loginWithOtp: jest.fn(),
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Test component that uses the auth context
const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithOtp,
    requestOtp,
    verifyOtp,
    logout,
  } = useAuth();

  return (
    <>
      <Text testID="loading">{isLoading.toString()}</Text>
      <Text testID="authenticated">{isAuthenticated.toString()}</Text>
      <Text testID="user">{user ? JSON.stringify(user) : "null"}</Text>

      <TouchableOpacity
        testID="login-btn"
        onPress={() => login("test@example.com", "password")}
      >
        <Text>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="otp-login-btn"
        onPress={() => loginWithOtp("test@example.com", "123456")}
      >
        <Text>OTP Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="request-otp-btn"
        onPress={() => requestOtp("test@example.com")}
      >
        <Text>Request OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="verify-otp-btn"
        onPress={() => verifyOtp("test@example.com", "123456")}
      >
        <Text>Verify OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity testID="logout-btn" onPress={() => logout()}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
  });

  it("initializes with loading state and no user", async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("loading").props.children).toBe("true");

    await waitFor(() => {
      expect(getByTestId("loading").props.children).toBe("false");
      expect(getByTestId("authenticated").props.children).toBe("false");
      expect(getByTestId("user").props.children).toBe("null");
    });
  });

  it("loads user from storage on initialization", async () => {
    const mockToken = "test-token";
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: UserRole.EMPLOYEE,
    };

    AsyncStorage.getItem.mockResolvedValue(mockToken);
    authApi.getCurrentUser.mockResolvedValue(mockUser);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").props.children).toBe("false");
      expect(getByTestId("authenticated").props.children).toBe("true");
      expect(JSON.parse(getByTestId("user").props.children)).toEqual(mockUser);
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("token");
    expect(authApi.getCurrentUser).toHaveBeenCalled();
  });

  it("handles login correctly", async () => {
    const mockToken = "test-token";
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: UserRole.EMPLOYEE,
    };

    AsyncStorage.getItem.mockResolvedValue(null);
    authApi.login.mockResolvedValue({ session_token: mockToken });
    authApi.getCurrentUser.mockResolvedValue(mockUser);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").props.children).toBe("false");
    });

    await act(async () => {
      getByTestId("login-btn").props.onPress();
    });

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith(
        "test@example.com",
        "password"
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("token", mockToken);
      expect(getByTestId("authenticated").props.children).toBe("true");
      expect(JSON.parse(getByTestId("user").props.children)).toEqual(mockUser);
    });
  });

  it("handles logout correctly", async () => {
    const mockToken = "test-token";
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: UserRole.EMPLOYEE,
    };

    AsyncStorage.getItem.mockResolvedValue(mockToken);
    authApi.getCurrentUser.mockResolvedValue(mockUser);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("authenticated").props.children).toBe("true");
    });

    await act(async () => {
      getByTestId("logout-btn").props.onPress();
    });

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalledWith(mockToken);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("token");
      expect(getByTestId("authenticated").props.children).toBe("false");
      expect(getByTestId("user").props.children).toBe("null");
    });
  });
});
