import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TicketStatus } from "../types/ticket";

interface StatusBadgeProps {
  status: TicketStatus;
  size?: "small" | "medium" | "large";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "medium",
}) => {
  const theme = useTheme();

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return theme.colors.error;
      case TicketStatus.IN_PROGRESS:
        return theme.colors.warning;
      case TicketStatus.RESOLVED:
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return "alert-circle";
      case TicketStatus.IN_PROGRESS:
        return "progress-clock";
      case TicketStatus.RESOLVED:
        return "check-circle";
      default:
        return "ticket";
    }
  };

  const getSizeStyles = (size: "small" | "medium" | "large") => {
    switch (size) {
      case "small":
        return {
          container: {
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
          },
          text: {
            fontSize: 10,
          },
          icon: 12,
        };
      case "large":
        return {
          container: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
          },
          text: {
            fontSize: 14,
          },
          icon: 18,
        };
      case "medium":
      default:
        return {
          container: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          },
          text: {
            fontSize: 12,
          },
          icon: 14,
        };
    }
  };

  const sizeStyles = getSizeStyles(size);
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const statusText = status.replace("_", " ");

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: statusColor },
      ]}
    >
      <Icon
        name={statusIcon}
        size={sizeStyles.icon}
        color="#fff"
        style={styles.icon}
      />
      <Text style={[styles.text, sizeStyles.text]}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: "#fff",
    textTransform: "capitalize",
  },
});

export default StatusBadge;
