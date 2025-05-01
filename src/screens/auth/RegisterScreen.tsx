import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  useTheme,
  RadioButton,
} from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import * as Yup from "yup";

import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";
import { authApi } from "../../api/auth";
import { UserRole } from "../../types/user";

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, "Register">;

const RegisterSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  department: Yup.string(),
  phoneNumber: Yup.string(),
  location: Yup.string(),
  role: Yup.string().required("Please select a role"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const RegisterScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const { loginWithOtp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { email, otp } = route.params;

  const handleRegister = async (values: {
    fullName: string;
    department: string;
    phoneNumber: string;
    location: string;
    role: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Set password using the OTP and include all user information
      await authApi.setPassword(
        email,
        otp,
        values.password,
        values.role as UserRole,
        values.fullName,
        values.department,
        values.location,
        values.phoneNumber
      );

      // Login with OTP
      await loginWithOtp(email, otp);
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Complete Registration</Text>

          <Text style={styles.subtitle}>
            Please provide your information to complete the registration
          </Text>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          <Formik
            initialValues={{
              fullName: "",
              department: "",
              phoneNumber: "",
              location: "",
              role: UserRole.EMPLOYEE, // Default to employee
              password: "",
              confirmPassword: "",
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View style={styles.form}>
                <TextInput
                  label="Email"
                  value={email}
                  disabled
                  style={styles.input}
                  mode="outlined"
                />

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
                  label="Department (Optional)"
                  value={values.department}
                  onChangeText={handleChange("department")}
                  onBlur={handleBlur("department")}
                  style={styles.input}
                  mode="outlined"
                />

                <TextInput
                  label="Phone Number (Optional)"
                  value={values.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  keyboardType="phone-pad"
                  style={styles.input}
                  mode="outlined"
                />

                <TextInput
                  label="Location (Optional)"
                  value={values.location}
                  onChangeText={handleChange("location")}
                  onBlur={handleBlur("location")}
                  style={styles.input}
                  mode="outlined"
                />

                <Text style={styles.sectionTitle}>Select Your Role</Text>
                <View style={styles.roleContainer}>
                  <View style={styles.roleOption}>
                    <RadioButton
                      value={UserRole.EMPLOYEE}
                      status={
                        values.role === UserRole.EMPLOYEE
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => setFieldValue("role", UserRole.EMPLOYEE)}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={styles.roleText}
                      onPress={() => setFieldValue("role", UserRole.EMPLOYEE)}
                    >
                      Employee
                    </Text>
                  </View>

                  <View style={styles.roleOption}>
                    <RadioButton
                      value={UserRole.IT_STAFF}
                      status={
                        values.role === UserRole.IT_STAFF
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => setFieldValue("role", UserRole.IT_STAFF)}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={styles.roleText}
                      onPress={() => setFieldValue("role", UserRole.IT_STAFF)}
                    >
                      IT Staff
                    </Text>
                  </View>
                </View>
                {touched.role && errors.role && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.role}
                  </Text>
                )}

                <TextInput
                  label="Password"
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
                  label="Confirm Password"
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
                  style={styles.button}
                >
                  Complete Registration
                </Button>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.l,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.m,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: spacing.l,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  roleContainer: {
    flexDirection: "row",
    marginBottom: spacing.m,
    justifyContent: "space-around",
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  roleText: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  button: {
    marginTop: spacing.m,
    paddingVertical: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    marginBottom: spacing.s,
  },
});

export default RegisterScreen;
