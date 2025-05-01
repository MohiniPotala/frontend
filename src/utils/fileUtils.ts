/**
 * Format file size to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

/**
 * Get an icon name based on file type
 * @param fileType MIME type of the file
 * @returns Icon name for react-native-vector-icons
 */
export const getFileIcon = (fileType: string): string => {
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

/**
 * Get file extension from file name
 * @param fileName Name of the file
 * @returns File extension
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};

/**
 * Check if a file is an image
 * @param fileType MIME type of the file
 * @returns True if the file is an image
 */
export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith("image/");
};

/**
 * Get a color for a file type
 * @param fileType MIME type of the file
 * @returns Color hex code
 */
export const getFileColor = (fileType: string): string => {
  if (fileType.startsWith("image/")) {
    return "#4CAF50"; // Green
  } else if (fileType.includes("pdf")) {
    return "#F44336"; // Red
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return "#2196F3"; // Blue
  } else if (fileType.includes("excel") || fileType.includes("sheet")) {
    return "#4CAF50"; // Green
  } else if (
    fileType.includes("powerpoint") ||
    fileType.includes("presentation")
  ) {
    return "#FF9800"; // Orange
  } else if (fileType.includes("zip") || fileType.includes("compressed")) {
    return "#9C27B0"; // Purple
  } else {
    return "#607D8B"; // Blue Grey
  }
};
