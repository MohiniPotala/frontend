import apiClient from "./client";

interface UnreadCountResponse {
  count: number;
}

export const notificationsApi = {
  // Get count of unread notifications
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data;
  },
};
