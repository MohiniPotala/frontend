import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "information-outline",
  title,
  message,
  buttonText,
  onButtonPress,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={theme.colors.disabled} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: theme.colors.disabled }]}>
          {message}
        </Text>
      )}
      {buttonText && onButtonPress && (
        <Button mode="contained" onPress={onButtonPress} style={styles.button}>
          {buttonText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  message: {
    fontSize: 14,
    marginBottom: 24,
    marginTop: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  button: {
    marginTop: 16,
  },
});

export default EmptyState;
