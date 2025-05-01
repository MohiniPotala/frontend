import React from "react";
import { View, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Attachment } from "../types/ticket";

interface AttachmentItemProps {
  attachment: Attachment;
  onPress?: (attachment: Attachment) => void;
}

const AttachmentItem: React.FC<AttachmentItemProps> = ({
  attachment,
  onPress,
}) => {
  const theme = useTheme();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return "file-image";
    } else if (fileType.includes("pdf")) {
      return "file-pdf-box";
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return "file-word-box";
    } else if (fileType.includes("excel") || fileType.includes("sheet")) {
      return "file-excel-box";
    } else if (
      fileType.includes("powerpoint") ||
      fileType.includes("presentation")
    ) {
      return "file-powerpoint-box";
    } else if (fileType.includes("zip") || fileType.includes("compressed")) {
      return "zip-box";
    } else {
      return "file-document-outline";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(attachment);
    } else {
      // Default behavior: open the file
      const fileUrl = `http://localhost:8000/${attachment.file_path}`;
      Linking.openURL(fileUrl).catch((err) => {
        console.error("Error opening attachment:", err);
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Icon
        name={getFileIcon(attachment.file_type)}
        size={24}
        color={theme.colors.primary}
        style={styles.icon}
      />
      <View style={styles.details}>
        <Text style={styles.fileName} numberOfLines={1}>
          {attachment.file_name}
        </Text>
        <Text style={[styles.fileInfo, { color: theme.colors.disabled }]}>
          {formatFileSize(attachment.file_size)} •{" "}
          {new Date(attachment.uploaded_at).toLocaleString()}
        </Text>
      </View>
      <Icon name="open-in-new" size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 12,
  },
  details: {
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  fileName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 12,
  },
});

export default AttachmentItem;
