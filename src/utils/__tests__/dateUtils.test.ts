import {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
} from "../dateUtils";

// Mock the Date object
const mockDate = new Date(2023, 5, 15, 10, 30, 0); // June 15, 2023, 10:30:00
const originalDate = global.Date;

describe("Date Utilities", () => {
  beforeAll(() => {
    // Mock the Date constructor
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          return new originalDate(date);
        }
        return mockDate;
      }

      static now() {
        return mockDate.getTime();
      }
    } as any;
  });

  afterAll(() => {
    // Restore the original Date
    global.Date = originalDate;
  });

  describe("formatDate", () => {
    it("formats a date string correctly", () => {
      const dateString = "2023-06-10T15:30:00Z";
      const result = formatDate(dateString);

      // The exact format will depend on the locale, but we can check for the date
      expect(result).toContain("10");
      expect(result).toContain("2023");
    });
  });

  describe("formatTime", () => {
    it("formats a time string correctly", () => {
      const dateString = "2023-06-10T15:30:00Z";
      const result = formatTime(dateString);

      // The exact format will depend on the locale, but we can check for the time
      expect(result).toContain("30");
    });
  });

  describe("formatDateTime", () => {
    it("formats a date and time string correctly", () => {
      const dateString = "2023-06-10T15:30:00Z";
      const result = formatDateTime(dateString);

      // The exact format will depend on the locale, but we can check for the date and time
      expect(result).toContain("10");
      expect(result).toContain("2023");
      expect(result).toContain("30");
    });
  });

  describe("getRelativeTime", () => {
    it('returns "just now" for times less than a minute ago', () => {
      const dateString = new Date(mockDate.getTime() - 30 * 1000).toISOString(); // 30 seconds ago
      const result = getRelativeTime(dateString);
      expect(result).toBe("just now");
    });

    it("returns minutes for times less than an hour ago", () => {
      const dateString = new Date(
        mockDate.getTime() - 10 * 60 * 1000
      ).toISOString(); // 10 minutes ago
      const result = getRelativeTime(dateString);
      expect(result).toBe("10 minutes ago");
    });

    it('returns "minute" (singular) for 1 minute ago', () => {
      const dateString = new Date(
        mockDate.getTime() - 1 * 60 * 1000
      ).toISOString(); // 1 minute ago
      const result = getRelativeTime(dateString);
      expect(result).toBe("1 minute ago");
    });

    it("returns hours for times less than a day ago", () => {
      const dateString = new Date(
        mockDate.getTime() - 5 * 60 * 60 * 1000
      ).toISOString(); // 5 hours ago
      const result = getRelativeTime(dateString);
      expect(result).toBe("5 hours ago");
    });

    it('returns "hour" (singular) for 1 hour ago', () => {
      const dateString = new Date(
        mockDate.getTime() - 1 * 60 * 60 * 1000
      ).toISOString(); // 1 hour ago
      const result = getRelativeTime(dateString);
      expect(result).toBe("1 hour ago");
    });

    it("returns days for times less than a week ago", () => {
      const dateString = new Date(
        mockDate.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(); // 3 days ago
      const result = getRelativeTime(dateString);
      expect(result).toBe("3 days ago");
    });

    it('returns "day" (singular) for 1 day ago', () => {
      const dateString = new Date(
        mockDate.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(); // 1 day ago
      const result = getRelativeTime(dateString);
      expect(result).toBe("1 day ago");
    });

    it("returns formatted date for times more than a week ago", () => {
      const dateString = new Date(
        mockDate.getTime() - 10 * 24 * 60 * 60 * 1000
      ).toISOString(); // 10 days ago
      const result = getRelativeTime(dateString);

      // Should return the formatted date
      expect(result).toContain("2023");
    });
  });
});
