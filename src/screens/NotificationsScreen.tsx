import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { chatApi } from "../api/chat";
import { ticketsApi } from "../api/tickets";
import { ChatMessage } from "../types/chat";
import { Ticket } from "../types/ticket";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme";

type NotificationsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  type: "message" | "ticket_update";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  ticketId: number;
  ticketTitle?: string;
  sender?: string;
}

const NotificationsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NotificationsScreenNavigationProp>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Get unread messages from all tickets
      const ticketsResponse = await ticketsApi.getTickets();
      const tickets = ticketsResponse.tickets;

      let allNotifications: Notification[] = [];

      // For each ticket, get unread messages
      const ticketPromises = tickets.map(async (ticket) => {
        try {
          const messagesResponse = await chatApi.getMessages(ticket.id);
          // Get both read and unread messages, but mark them differently
          const messages = messagesResponse.messages.slice(0, 5); // Limit to 5 most recent messages per ticket
          
          // Convert messages to notifications
          return messages.map((msg) => ({
            id: `message-${msg.id}`,
            type: "message" as const,
            title: `Message in ticket #${ticket.id}: ${ticket.title}`,
            description:
              msg.message.length > 50
                ? `${msg.message.substring(0, 50)}...`
                : msg.message,
            timestamp: msg.created_at,
            read: msg.is_read,
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            sender: msg.sender_name,
          }));
        } catch (error) {
          console.error(`Error fetching messages for ticket ${ticket.id}:`, error);
          return [];
        }
      });

      // Wait for all promises to resolve
      const notificationArrays = await Promise.all(ticketPromises);
      
      // Flatten the array of arrays
      allNotifications = notificationArrays.flat();

      // Also add ticket status updates as notifications
      const ticketNotifications = tickets.map(ticket => ({
        id: `ticket-${ticket.id}`,
        type: "ticket_update" as const,
        title: `Ticket #${ticket.id}: ${ticket.title}`,
        description: `Status: ${ticket.status.replace('_', ' ')}`,
        timestamp: ticket.updated_at || ticket.created_at,
        read: true, // These are not marked as unread
        ticketId: ticket.id,
        ticketTitle: ticket.title,
      }));

      allNotifications = [...allNotifications, ...ticketNotifications];

      // Sort notifications by timestamp (newest first)
      allNotifications.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    if (notification.type === "message") {
      // Mark messages as read
      chatApi.markMessagesAsRead(notification.ticketId);

      // Navigate to chat
      navigation.navigate("Chat", {
        ticketId: notification.ticketId,
        ticketTitle:
          notification.ticketTitle || `Ticket #${notification.ticketId}`,
      });
    } else {
      // Navigate to ticket detail
      navigation.navigate("TicketDetail", { ticketId: notification.ticketId });
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <Card
      style={[
        styles.notificationCard,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Card.Content style={styles.notificationContent}>
        <View style={styles.notificationIcon}>
          <Icon
            name={
              item.type === "message" ? "message-text" : "ticket-confirmation"
            }
            size={24}
            color={item.read ? theme.colors.disabled : theme.colors.primary}
          />
        </View>
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {item.sender && (
            <Text style={styles.notificationSender}>From: {item.sender}</Text>
          )}
          <Text style={styles.notificationDescription}>{item.description}</Text>
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            {!item.read && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>New</Text>
              </View>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <Divider />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="bell-off" size={48} color={theme.colors.disabled} />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: spacing.l,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContent: {
    padding: spacing.m,
  },
  notificationCard: {
    marginBottom: spacing.s,
    borderRadius: 8,
    overflow: 'hidden',
  },
  readNotification: {
    opacity: 0.8,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
    backgroundColor: "#f0f7ff",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.s,
  },
  notificationIcon: {
    marginRight: spacing.m,
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  notificationSender: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: spacing.xs,
    color: "#555",
  },
  notificationDescription: {
    fontSize: 14,
    marginBottom: spacing.s,
    lineHeight: 20,
  },
  notificationFooter: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: spacing.xs,
    color: "#555",
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.5,
  },
  unreadBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.m,
    fontSize: 16,
    opacity: 0.5,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NotificationsScreen;
