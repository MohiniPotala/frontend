import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config";

// Get WebSocket URL from config
const WS_BASE_URL = API_CONFIG.wsURL;

// Define a proper type for the callback functions
type MessageCallback = (data: any) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<MessageCallback>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private currentTicketId: number | null = null;

  // Initialize socket connection for a specific ticket
  async connect(ticketId: number): Promise<void> {
    // Store the current ticket ID
    this.currentTicketId = ticketId;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("Socket already connected");
      return;
    }

    try {
      // Get auth token
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Create WebSocket URL with ticket ID and token
      const wsUrl = `${WS_BASE_URL}/chat/${ticketId}?token=${token}`;

      // Connect to WebSocket server
      this.socket = new WebSocket(wsUrl);

      // Set up event listeners
      this.socket.onopen = () => {
        console.log("Socket connected");
        this.reconnectAttempts = 0;
      };

      this.socket.onclose = (event) => {
        console.log(`Socket disconnected: ${event.code} - ${event.reason}`);
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error("Socket error:", error);
      };

      // Handle incoming messages
      this.socket.onmessage = (event) => {
        try {
          console.log("WebSocket message received:", event.data);
          const data = JSON.parse(event.data);
          console.log("Parsed WebSocket data:", data);

          // Determine the event type from the data
          if (data.type === "chat_message") {
            console.log("Received chat message:", data);
            this.notifyListeners("chat_message", data);
            this.notifyListeners("notification", data);
          } else if (data.type === "ticket_update") {
            console.log("Received ticket update:", data);
            this.notifyListeners("ticket_update", data);
          } else if (data.type === "connection_established") {
            console.log("Connection established:", data);
            this.notifyListeners("connection_established", data);
          } else if (data.type === "user_joined") {
            console.log("User joined:", data);
            this.notifyListeners("user_joined", data);
          } else {
            // Default to message event
            console.log("Received generic message:", data);
            this.notifyListeners("message", data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          console.error("Raw message:", event.data);
        }
      };
    } catch (error) {
      console.error("Socket connection error:", error);
      throw error;
    }
  }

  // Handle reconnection logic
  private handleReconnect(): void {
    // Don't attempt to reconnect if we've explicitly disconnected
    if (this.socket === null) {
      console.log(
        "Socket was explicitly disconnected, not attempting to reconnect"
      );
      return;
    }

    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.currentTicketId
    ) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      // Use exponential backoff for reconnection attempts
      const delay =
        this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
      console.log(`Will attempt reconnection in ${delay}ms`);

      setTimeout(() => {
        if (this.currentTicketId) {
          console.log(`Reconnecting to ticket ${this.currentTicketId}`);
          this.connect(this.currentTicketId);
        } else {
          console.log("No ticket ID available for reconnection");
        }
      }, delay);
    } else {
      console.log("Max reconnection attempts reached or no ticket ID");
      // Reset socket to null to allow for manual reconnection
      this.socket = null;
      this.currentTicketId = null;
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      console.log("Closing WebSocket connection");
      this.socket.close();
      this.socket = null;
      this.currentTicketId = null;

      // Clear all listeners to prevent memory leaks
      this.listeners.clear();

      console.log("WebSocket disconnected and listeners cleared");
    } else {
      console.log("No active WebSocket connection to disconnect");
    }
  }

  // Send message to server
  send(data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Socket not connected, cannot send message");
      return;
    }

    this.socket.send(JSON.stringify(data));
  }

  // Join a room is not needed with the backend implementation
  // as the connection is already for a specific ticket
  joinRoom(ticketId: number): void {
    if (this.currentTicketId !== ticketId) {
      this.disconnect();
      this.connect(ticketId);
    }
  }

  // Leave a room
  leaveRoom(): void {
    this.disconnect();
  }

  // Add event listener
  on(event: string, callback: MessageCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Remove event listener
  off(event: string, callback: MessageCallback): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.delete(callback);
    }
  }

  // Notify all listeners of an event
  private notifyListeners(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
