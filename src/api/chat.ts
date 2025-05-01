import apiClient from "./client";
import { ChatMessage, ChatHistoryResponse } from "../types/chat";

export const chatApi = {
  // Send a chat message
  sendMessage: async (
    ticketId: number,
    message: string,
    attachment?: File
  ): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("ticket_id", ticketId.toString());

    if (attachment) {
      formData.append("attachment", attachment);
    }

    const response = await apiClient.post("/chat/messages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Get chat messages for a ticket
  getMessages: async (
    ticketId: number,
    skip = 0,
    limit = 50
  ): Promise<ChatHistoryResponse> => {
    const params = { skip, limit };
    const response = await apiClient.get(`/chat/tickets/${ticketId}/messages`, {
      params,
    });
    return response.data;
  },

  // Mark all messages in a ticket as read
  markMessagesAsRead: async (
    ticketId: number
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/chat/tickets/${ticketId}/read`);
    return response.data;
  },
};
