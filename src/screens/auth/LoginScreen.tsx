import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import * as Yup from "yup";

import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters"),
});

const LoginScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, requestOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useOtp, setUseOtp] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);

      if (useOtp) {
        // Request OTP
        console.log("Requesting OTP for email:", values.email);

        // Make sure email is properly formatted
        const formattedEmail = values.email.trim().toLowerCase();

        await requestOtp(formattedEmail);
        console.log("OTP requested successfully, navigating to OTP screen");
        navigation.navigate("OTP", { email: formattedEmail });
      } else {
        // Login with password
        console.log("Logging in with password for email:", values.email);

        // Make sure email is properly formatted
        const formattedEmail = values.email.trim().toLowerCase();

        await login(formattedEmail, values.password);
        console.log("Login successful");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // Simplified error handling
      if (err.message) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
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
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Smart IT Ticketing</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            {useOtp ? "Login with OTP" : "Login with Password"}
          </Text>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                <TextInput
                  label="Email"
                  value={values.email}
                  onChangeText={(text) => {
                    // Convert to lowercase and trim whitespace
                    handleChange("email")(text.toLowerCase().trim());
                  }}
                  onBlur={handleBlur("email")}
                  error={touched.email && !!errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Enter your email address"
                />
                {touched.email && errors.email && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.email}
                  </Text>
                )}

                {!useOtp && (
                  <>
                    <TextInput
                      label="Password"
                      value={values.password}
                      onChangeText={(text) => {
                        // Trim whitespace
                        handleChange("password")(text.trim());
                      }}
                      onBlur={handleBlur("password")}
                      error={touched.password && !!errors.password}
                      secureTextEntry
                      style={styles.input}
                      mode="outlined"
                      placeholder="Enter your password"
                    />
                    {touched.password && errors.password && (
                      <Text
                        style={[
                          styles.errorText,
                          { color: theme.colors.error },
                        ]}
                      >
                        {errors.password}
                      </Text>
                    )}
                  </>
                )}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  {useOtp ? "Request OTP" : "Login"}
                </Button>
              </View>
            )}
          </Formik>

          <TouchableOpacity
            onPress={() => setUseOtp(!useOtp)}
            style={styles.switchMethod}
          >
            <Text style={[styles.switchText, { color: theme.colors.primary }]}>
              {useOtp
                ? "Login with password instead"
                : "Login with OTP instead"}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                setUseOtp(true);
                navigation.navigate("OTP", { email: "", isRegistration: true });
              }}
            >
              <Text
                style={[styles.registerLink, { color: theme.colors.primary }]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "center",
    padding: spacing.l,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: spacing.m,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: spacing.s,
  },
  button: {
    marginTop: spacing.m,
    paddingVertical: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    marginBottom: spacing.s,
  },
  switchMethod: {
    marginTop: spacing.l,
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.l,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LoginScreen;
