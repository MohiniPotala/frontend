import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message = "Something went wrong",
  onRetry,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={64} color={theme.colors.error} />
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
      {onRetry && (
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          Retry
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  button: {
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    marginTop: 16,
    textAlign: "center",
  },
});

export default ErrorScreen;
