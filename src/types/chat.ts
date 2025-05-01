export interface ChatMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  attachment_path?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  total: number;
  ticket_id: number;
}

export interface WebSocketMessage {
  type: "connection_established" | "user_joined" | "chat_message";
  message?: string;
  user_id?: number;
  user_name?: string;
  ticket_id?: number;
  timestamp?: string;
  message_id?: number;
}
