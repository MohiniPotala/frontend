import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Avatar,
  TextInput,
  Divider,
  useTheme,
} from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";

import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { UserUpdate } from "../types/user";
import { spacing } from "../theme";
import { usersApi } from "../api/users";

const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  department: Yup.string(),
  phoneNumber: Yup.string(),
  location: Yup.string(),
  password: Yup.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("password")],
    "Passwords must match"
  ),
});

const ProfileScreen = () => {
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { disconnect } = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (values: {
    fullName: string;
    department: string;
    phoneNumber: string;
    location: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const updateData: UserUpdate = {
        full_name: values.fullName,
        department: values.department || undefined,
        phone_number: values.phoneNumber || undefined,
        location: values.location || undefined,
      };

      if (values.password) {
        updateData.password = values.password;
      }

      const updatedUser = await usersApi.updateCurrentUser(updateData);
      updateUser(updatedUser);

      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Update profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // Set loading state
            setLoading(true);

            // Disconnect socket first to ensure clean logout
            console.log("Disconnecting socket before logout");
            disconnect();

            // Call logout function with await
            const success = await logout();
            console.log("Logout successful:", success);

            // Show confirmation to user
            Alert.alert("Success", "You have been logged out successfully.");
          } catch (error) {
            console.error("Logout error:", error);
            // Force a local logout even if there was an error
            Alert.alert("Notice", "You have been logged out.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={getInitials(user.full_name)}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.roleText}>{user.role.replace("_", " ")}</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Profile Information</Text>

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

            <Formik
              initialValues={{
                fullName: user.full_name,
                department: user.department || "",
                phoneNumber: user.phone_number || "",
                location: user.location || "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={ProfileSchema}
              onSubmit={handleUpdateProfile}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View>
                  <TextInput
                    label="Full Name"
                    value={values.fullName}
                    onChangeText={handleChange("fullName")}
                    onBlur={handleBlur("fullName")}
                    error={touched.fullName && !!errors.fullName}
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.fullName && errors.fullName && (
                    <Text
                      style={[styles.errorText, { color: theme.colors.error }]}
                    >
                      {errors.fullName}
                    </Text>
                  )}

                  <TextInput
                    label="Department"
                    value={values.department}
                    onChangeText={handleChange("department")}
                    onBlur={handleBlur("department")}
                    style={styles.input}
                    mode="outlined"
                  />

                  <TextInput
                    label="Phone Number"
                    value={values.phoneNumber}
                    onChangeText={handleChange("phoneNumber")}
                    onBlur={handleBlur("phoneNumber")}
                    keyboardType="phone-pad"
                    style={styles.input}
                    mode="outlined"
                  />

                  <TextInput
                    label="Location"
                    value={values.location}
                    onChangeText={handleChange("location")}
                    onBlur={handleBlur("location")}
                    style={styles.input}
                    mode="outlined"
                  />

                  <Divider style={styles.divider} />

                  <Text style={styles.subsectionTitle}>Change Password</Text>

                  <TextInput
                    label="New Password"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    error={touched.password && !!errors.password}
                    secureTextEntry
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.password && errors.password && (
                    <Text
                      style={[styles.errorText, { color: theme.colors.error }]}
                    >
                      {errors.password}
                    </Text>
                  )}

                  <TextInput
                    label="Confirm New Password"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    secureTextEntry
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text
                      style={[styles.errorText, { color: theme.colors.error }]}
                    >
                      {errors.confirmPassword}
                    </Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}
                    loading={loading}
                    disabled={loading}
                    style={styles.updateButton}
                  >
                    Update Profile
                  </Button>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          loading={loading}
          disabled={loading}
          textColor={theme.colors.error}
          buttonColor={theme.colors.errorContainer}
        >
          Logout
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    marginBottom: spacing.m,
  },
  card: {
    marginBottom: spacing.l,
  },
  container: {
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  divider: {
    marginVertical: spacing.l,
  },
  email: {
    fontSize: 14,
    marginBottom: spacing.s,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 12,
    marginBottom: spacing.s,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.l,
  },
  input: {
    marginBottom: spacing.s,
  },
  logoutButton: {
    marginBottom: spacing.xl,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    textTransform: "capitalize",
  },
  scrollContent: {
    padding: spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.m,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.m,
  },
  updateButton: {
    marginTop: spacing.m,
  },
});

export default ProfileScreen;
