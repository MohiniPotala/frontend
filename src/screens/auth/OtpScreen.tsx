import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import * as Yup from "yup";

import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";

type OtpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OTP"
>;
type OtpScreenRouteProp = RouteProp<RootStackParamList, "OTP">;

const OtpSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  otp: Yup.string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be 6 digits"),
});

const OtpScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const { loginWithOtp, requestOtp, verifyOtp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { email: routeEmail = "", isRegistration = false } = route.params || {};

  useEffect(() => {
    if (routeEmail) {
      startCountdown();
    }
  }, [routeEmail]);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleResendOtp = async (email: string) => {
    try {
      setError(null);
      console.log("Resending OTP for email:", email);

      // Make sure email is properly formatted
      const formattedEmail = email.trim().toLowerCase();

      await requestOtp(formattedEmail);
      console.log("OTP resent successfully");
      startCountdown();
    } catch (err: any) {
      console.error("Resend OTP error:", err);

      // Simplified error handling
      if (err.message) {
        setError(`Failed to send OTP: ${err.message}`);
      } else {
        setError("Failed to send OTP. Please try again later.");
      }
    }
  };

  const handleVerifyOtp = async (values: { email: string; otp: string }) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Verifying OTP:", values.otp, "for email:", values.email);

      // Make sure email and OTP are properly formatted
      const formattedEmail = values.email.trim().toLowerCase();
      const formattedOtp = values.otp.trim();

      if (isRegistration) {
        // Verify OTP for registration
        console.log("Registration flow - verifying OTP");
        const user = await verifyOtp(formattedEmail, formattedOtp);
        console.log("OTP verified successfully for registration, user:", user);

        // Navigate to registration screen with email and OTP
        navigation.navigate("Register", {
          email: formattedEmail,
          otp: formattedOtp,
        });
      } else {
        // Login with OTP
        console.log("Login flow - logging in with OTP");
        await loginWithOtp(formattedEmail, formattedOtp);
        console.log("OTP login successful");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);

      // Simplified error handling
      if (err.message) {
        setError(`Verification failed: ${err.message}`);
      } else {
        setError("Invalid OTP. Please try again.");
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
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isRegistration ? "Register with OTP" : "Login with OTP"}
          </Text>

          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email
          </Text>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          <Formik
            initialValues={{ email: routeEmail, otp: "" }}
            validationSchema={OtpSchema}
            onSubmit={handleVerifyOtp}
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
                  disabled={!!routeEmail}
                  placeholder="Enter your email address"
                />
                {touched.email && errors.email && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.email}
                  </Text>
                )}

                <TextInput
                  label="OTP"
                  value={values.otp}
                  onChangeText={(text) => {
                    // Only allow digits
                    const digitsOnly = text.replace(/[^0-9]/g, "");
                    handleChange("otp")(digitsOnly);
                  }}
                  onBlur={handleBlur("otp")}
                  error={touched.otp && !!errors.otp}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Enter 6-digit code"
                />
                {touched.otp && errors.otp && (
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.otp}
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  {isRegistration ? "Continue" : "Login"}
                </Button>

                <View style={styles.resendContainer}>
                  {countdown > 0 ? (
                    <Text>Resend OTP in {countdown}s</Text>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleResendOtp(values.email)}
                      disabled={!values.email}
                    >
                      <Text
                        style={[
                          styles.resendText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        Resend OTP
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </Formik>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.backToLogin}
          >
            <Text
              style={[styles.backToLoginText, { color: theme.colors.primary }]}
            >
              Back to Login
            </Text>
          </TouchableOpacity>
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
  button: {
    marginTop: spacing.m,
    paddingVertical: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    marginBottom: spacing.s,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: spacing.l,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  backToLogin: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
  },
});

export default OtpScreen;
