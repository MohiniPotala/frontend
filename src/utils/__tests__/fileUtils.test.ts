import {
  formatFileSize,
  getFileIcon,
  getFileExtension,
  isImageFile,
  getFileColor,
} from "../fileUtils";

describe("File Utilities", () => {
  describe("formatFileSize", () => {
    it("formats bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("formats kilobytes correctly", () => {
      expect(formatFileSize(1500)).toBe("1.5 KB");
    });

    it("formats megabytes correctly", () => {
      expect(formatFileSize(1500000)).toBe("1.4 MB");
    });
  });

  describe("getFileIcon", () => {
    it("returns image icon for image files", () => {
      expect(getFileIcon("image/jpeg")).toBe("file-image");
      expect(getFileIcon("image/png")).toBe("file-image");
    });

    it("returns PDF icon for PDF files", () => {
      expect(getFileIcon("application/pdf")).toBe("file-pdf-box");
    });

    it("returns Word icon for Word files", () => {
      expect(getFileIcon("application/msword")).toBe("file-word-box");
      expect(
        getFileIcon(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
      ).toBe("file-word-box");
    });

    it("returns Excel icon for Excel files", () => {
      expect(getFileIcon("application/vnd.ms-excel")).toBe("file-excel-box");
      expect(
        getFileIcon(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ).toBe("file-excel-box");
    });

    it("returns PowerPoint icon for PowerPoint files", () => {
      expect(getFileIcon("application/vnd.ms-powerpoint")).toBe(
        "file-powerpoint-box"
      );
      expect(
        getFileIcon(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
      ).toBe("file-powerpoint-box");
    });

    it("returns zip icon for compressed files", () => {
      expect(getFileIcon("application/zip")).toBe("zip-box");
      expect(getFileIcon("application/x-compressed")).toBe("zip-box");
    });

    it("returns default icon for other files", () => {
      expect(getFileIcon("text/plain")).toBe("file-document-outline");
      expect(getFileIcon("application/octet-stream")).toBe(
        "file-document-outline"
      );
    });
  });

  describe("getFileExtension", () => {
    it("returns the correct extension for a file name", () => {
      expect(getFileExtension("document.pdf")).toBe("pdf");
      expect(getFileExtension("image.jpg")).toBe("jpg");
      expect(getFileExtension("archive.tar.gz")).toBe("gz");
    });

    it("returns an empty string for a file name without extension", () => {
      expect(getFileExtension("README")).toBe("");
    });

    it("returns lowercase extension for uppercase file names", () => {
      expect(getFileExtension("IMAGE.JPG")).toBe("jpg");
    });
  });

  describe("isImageFile", () => {
    it("returns true for image files", () => {
      expect(isImageFile("image/jpeg")).toBe(true);
      expect(isImageFile("image/png")).toBe(true);
      expect(isImageFile("image/gif")).toBe(true);
    });

    it("returns false for non-image files", () => {
      expect(isImageFile("application/pdf")).toBe(false);
      expect(isImageFile("text/plain")).toBe(false);
      expect(isImageFile("application/zip")).toBe(false);
    });
  });

  describe("getFileColor", () => {
    it("returns green for image files", () => {
      expect(getFileColor("image/jpeg")).toBe("#4CAF50");
    });

    it("returns red for PDF files", () => {
      expect(getFileColor("application/pdf")).toBe("#F44336");
    });

    it("returns blue for Word files", () => {
      expect(getFileColor("application/msword")).toBe("#2196F3");
    });

    it("returns green for Excel files", () => {
      expect(getFileColor("application/vnd.ms-excel")).toBe("#4CAF50");
    });

    it("returns orange for PowerPoint files", () => {
      expect(getFileColor("application/vnd.ms-powerpoint")).toBe("#FF9800");
    });

    it("returns purple for compressed files", () => {
      expect(getFileColor("application/zip")).toBe("#9C27B0");
    });

    it("returns blue grey for other files", () => {
      expect(getFileColor("text/plain")).toBe("#607D8B");
    });
  });
});
