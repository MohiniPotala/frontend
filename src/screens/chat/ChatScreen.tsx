import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  useTheme,
  ActivityIndicator,
  Surface,
} from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { chatApi } from "../../api/chat";
import { ChatMessage } from "../../types/chat";
import { TicketsStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

type ChatScreenNavigationProp = NativeStackNavigationProp<
  TicketsStackParamList,
  "Chat"
>;
type ChatScreenRouteProp = RouteProp<TicketsStackParamList, "Chat">;

import { API_CONFIG } from "../../config";

// WebSocket URL from config
const WS_URL = API_CONFIG.wsURL;

const ChatScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { user, token } = useAuth();
  const { joinRoom, leaveRoom, on, off, isConnected } = useSocket();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  const { ticketId, ticketTitle } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const pageSize = 20;

  // Connect to WebSocket using SocketContext
  useEffect(() => {
    if (!token) return;

    console.log(`Connecting to chat for ticket ${ticketId}`);

    // Join the room for this ticket
    joinRoom(ticketId);

    // Add connection status indicator
    const connectionStatusCheck = setInterval(() => {
      if (!isConnected) {
        console.log("Attempting to reconnect to chat...");
        joinRoom(ticketId);
      }
    }, 5000);

    // Handle incoming chat messages
    const handleChatMessage = (data: any) => {
      console.log("Received chat message in handler:", data);

      // Add new message to the list
      const newMessage: ChatMessage = {
        id: data.message_id || `temp-${Date.now()}`, // Use a temporary ID if none provided
        ticket_id: data.ticket_id,
        sender_id: data.user_id,
        sender_name: data.user_name,
        message: data.message,
        is_read: false,
        created_at: data.timestamp || new Date().toISOString(),
      };

      console.log("Created new message object:", newMessage);

      // Play a notification sound if the message is from someone else
      if (data.user_id !== user?.id) {
        // You could add a sound notification here if needed
        console.log("New message from:", data.user_name);
      }

      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some(
          (msg) =>
            msg.id === newMessage.id ||
            (msg.sender_id === newMessage.sender_id &&
              msg.message === newMessage.message &&
              Math.abs(
                new Date(msg.created_at).getTime() -
                  new Date(newMessage.created_at).getTime()
              ) < 5000)
        );

        if (messageExists) {
          console.log("Message already exists, not adding duplicate");
          return prevMessages;
        }

        console.log("Adding new message to state");
        return [newMessage, ...prevMessages];
      });
    };

    // Handle connection established
    const handleConnectionEstablished = (data: any) => {
      console.log("Connection established:", data);
      // Refresh messages when connection is established
      fetchMessages();
    };

    // Handle user joined
    const handleUserJoined = (data: any) => {
      console.log("User joined:", data);
    };

    // Register event listeners
    console.log("Registering event listeners");
    on("chat_message", handleChatMessage);
    on("connection_established", handleConnectionEstablished);
    on("user_joined", handleUserJoined);

    // Also register for generic message events as a fallback
    const handleGenericMessage = (data: any) => {
      console.log("Generic message received:", data);
      if (data.message) {
        handleChatMessage(data);
      }
    };
    on("message", handleGenericMessage);

    // Clean up WebSocket connection
    return () => {
      console.log("Cleaning up WebSocket connection");
      off("chat_message", handleChatMessage);
      off("connection_established", handleConnectionEstablished);
      off("user_joined", handleUserJoined);
      off("message", handleGenericMessage);
      leaveRoom();
      clearInterval(connectionStatusCheck);
    };
  }, [ticketId, token]);

  // Fetch messages
  const fetchMessages = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const skip = (pageNum - 1) * pageSize;
      const response = await chatApi.getMessages(ticketId, skip, pageSize);

      const newMessages = response.messages;

      if (append) {
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      } else {
        setMessages(newMessages);
      }

      setTotalMessages(response.total);
      setHasMore(newMessages.length === pageSize);

      // Mark messages as read
      await chatApi.markMessagesAsRead(ticketId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [ticketId]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedAttachment) || sending) return;

    try {
      setSending(true);

      // Optimistically add the message to the UI
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        ticket_id: ticketId,
        sender_id: user?.id || 0,
        sender_name: user?.full_name || "You",
        message: message.trim(),
        is_read: true,
        created_at: new Date().toISOString(),
        // We don't have attachment info yet
      };

      // Add to messages immediately for better UX
      setMessages((prevMessages) => [optimisticMessage, ...prevMessages]);

      // Clear input and attachment right away for better UX
      const messageCopy = message;
      const attachmentCopy = selectedAttachment;
      setMessage("");
      setSelectedAttachment(null);

      // Actually send the message
      await chatApi.sendMessage(ticketId, messageCopy, attachmentCopy);

      // No need to refresh all messages since we're using WebSockets
      // The server will send back the message with a proper ID
      // If we want to be extra safe, we could refresh after a short delay
      setTimeout(() => {
        fetchMessages();
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");

      // Restore the message if sending failed
      setMessage(message);
      if (selectedAttachment) {
        setSelectedAttachment(selectedAttachment);
      }
    } finally {
      setSending(false);
    }
  };

  const handlePickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Create a File object from the picked document
      const fileToUpload = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      };

      setSelectedAttachment(fileToUpload);
    } catch (error) {
      console.error("Error picking attachment:", error);
      Alert.alert("Error", "Failed to pick attachment");
    }
  };

  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.sender_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <Surface
          style={[
            styles.messageBubble,
            isCurrentUser
              ? [
                  styles.currentUserBubble,
                  { backgroundColor: theme.colors.primary },
                ]
              : styles.otherUserBubble,
          ]}
        >
          {!isCurrentUser && (
            <Text style={styles.senderName}>{item.sender_name}</Text>
          )}

          <Text
            style={[styles.messageText, isCurrentUser && { color: "#fff" }]}
          >
            {item.message}
          </Text>

          {item.attachment_path && (
            <TouchableOpacity
              style={styles.attachmentContainer}
              onPress={() => {
                const baseUrl = API_CONFIG.baseURL.replace("/api", "");
                const attachmentUrl = `${baseUrl}/${item.attachment_path}`;
                Linking.openURL(attachmentUrl);
              }}
            >
              {item.attachment_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <Image
                  source={{
                    uri: `${API_CONFIG.baseURL.replace("/api", "")}/${
                      item.attachment_path
                    }`,
                  }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.fileAttachment}>
                  <Icon
                    name="file-document"
                    size={24}
                    color={isCurrentUser ? "#fff" : theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.attachmentName,
                      isCurrentUser && { color: "#fff" },
                    ]}
                    numberOfLines={1}
                  >
                    {item.attachment_path.split("/").pop()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <Text
            style={[
              styles.messageTime,
              isCurrentUser && { color: "rgba(255, 255, 255, 0.7)" },
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Surface>
      </View>
    );
  };

  const isWideScreen = Dimensions.get("window").width > 768;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Connection status indicator */}
      <View
        style={[
          styles.connectionStatus,
          { backgroundColor: isConnected ? "#4CAF50" : "#F44336" },
        ]}
      >
        <Text style={styles.connectionStatusText}>
          {isConnected ? "Connected" : "Connecting..."}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          inverted
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={styles.loadingMore}
              />
            ) : null
          }
        />
      )}

      {selectedAttachment && (
        <View style={styles.selectedAttachmentContainer}>
          <View style={styles.selectedAttachment}>
            <Icon name="file-document" size={20} color={theme.colors.primary} />
            <Text style={styles.selectedAttachmentName} numberOfLines={1}>
              {selectedAttachment.name}
            </Text>
            <IconButton
              icon="close"
              size={16}
              onPress={handleRemoveAttachment}
            />
          </View>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          isWideScreen && styles.inputContainerWide,
        ]}
      >
        <IconButton
          icon="paperclip"
          size={24}
          onPress={handlePickAttachment}
          style={styles.attachButton}
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          style={styles.input}
          mode="outlined"
          multiline
          dense
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSendMessage}
              disabled={(!message.trim() && !selectedAttachment) || sending}
              color={theme.colors.primary}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  connectionStatus: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  connectionStatusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    padding: spacing.m,
  },
  messageContainer: {
    marginBottom: spacing.m,
    maxWidth: "80%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: spacing.m,
    borderRadius: 12,
    elevation: 1,
  },
  currentUserBubble: {
    borderTopRightRadius: 4,
  },
  otherUserBubble: {
    borderTopLeftRadius: 4,
    backgroundColor: "#fff",
  },
  senderName: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  attachmentContainer: {
    marginTop: spacing.s,
  },
  attachmentImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.s,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  attachmentName: {
    marginLeft: spacing.s,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.s,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  inputContainerWide: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  attachButton: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
  selectedAttachmentContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: spacing.s,
  },
  selectedAttachment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: spacing.xs,
  },
  selectedAttachmentName: {
    flex: 1,
    marginLeft: spacing.s,
  },
  loadingMore: {
    marginVertical: spacing.m,
  },
});

export default ChatScreen;
