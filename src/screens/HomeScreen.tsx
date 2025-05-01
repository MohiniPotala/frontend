import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { useAuth } from "../context/AuthContext";
import { ticketsApi } from "../api/tickets";
import { Ticket, TicketStatus } from "../types/ticket";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme";
import { UserRole } from "../types/user";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ticketCounts, setTicketCounts] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsApi.getTickets(undefined, 0, 5);
      setRecentTickets(response.tickets);

      // Get counts for different statuses
      const openResponse = await ticketsApi.getTickets(TicketStatus.OPEN, 0, 1);
      const inProgressResponse = await ticketsApi.getTickets(
        TicketStatus.IN_PROGRESS,
        0,
        1
      );
      const resolvedResponse = await ticketsApi.getTickets(
        TicketStatus.RESOLVED,
        0,
        1
      );

      setTicketCounts({
        open: openResponse.total,
        inProgress: inProgressResponse.total,
        resolved: resolvedResponse.total,
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return theme.colors.error;
      case TicketStatus.IN_PROGRESS:
        return theme.colors.warning;
      case TicketStatus.RESOLVED:
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return "alert-circle";
      case TicketStatus.IN_PROGRESS:
        return "progress-clock";
      case TicketStatus.RESOLVED:
        return "check-circle";
      default:
        return "ticket";
    }
  };

  const isWideScreen = Dimensions.get("window").width > 768;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.full_name}</Text>
        <Text style={styles.subGreeting}>
          {user?.role === UserRole.IT_STAFF
            ? "Manage IT support tickets"
            : "Need IT support?"}
        </Text>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>
          {user?.role === UserRole.IT_STAFF
            ? "Manage Support Tickets"
            : "Need IT Support?"}
        </Text>
        <Text style={styles.actionDescription}>
          {user?.role === UserRole.IT_STAFF
            ? "View and manage all support tickets"
            : "Create a new ticket to get help from IT support"}
        </Text>
        <Button
          mode="contained"
          onPress={() =>
            user?.role === UserRole.IT_STAFF
              ? navigation.navigate("Tickets")
              : navigation.navigate("CreateTicket")
          }
          style={styles.actionButton}
        >
          {user?.role === UserRole.IT_STAFF
            ? "View All Tickets"
            : "Create Ticket"}
        </Button>
      </View>

      <View
        style={[
          styles.statsContainer,
          isWideScreen && styles.statsContainerWide,
        ]}
      >
        <Card
          style={[
            styles.statCard,
            { borderLeftColor: theme.colors.error, borderLeftWidth: 4 },
          ]}
        >
          <Card.Content>
            <Text style={styles.statTitle}>Open</Text>
            <Text style={styles.statValue}>{ticketCounts.open}</Text>
          </Card.Content>
        </Card>

        <Card
          style={[
            styles.statCard,
            { borderLeftColor: theme.colors.warning, borderLeftWidth: 4 },
          ]}
        >
          <Card.Content>
            <Text style={styles.statTitle}>In Progress</Text>
            <Text style={styles.statValue}>{ticketCounts.inProgress}</Text>
          </Card.Content>
        </Card>

        <Card
          style={[
            styles.statCard,
            { borderLeftColor: theme.colors.success, borderLeftWidth: 4 },
          ]}
        >
          <Card.Content>
            <Text style={styles.statTitle}>Resolved</Text>
            <Text style={styles.statValue}>{ticketCounts.resolved}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.recentTicketsContainer}>
        <Text style={styles.sectionTitle}>Recent Tickets</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.loader}
          />
        ) : recentTickets.length > 0 ? (
          recentTickets.map((ticket) => (
            <Card
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() =>
                navigation.navigate("TicketDetail", { ticketId: ticket.id })
              }
            >
              <Card.Content style={styles.ticketCardContent}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTitle} numberOfLines={1}>
                    {ticket.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) },
                    ]}
                  >
                    <Icon
                      name={getStatusIcon(ticket.status)}
                      size={14}
                      color="#fff"
                    />
                    <Text style={styles.statusText}>
                      {ticket.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.description}
                </Text>

                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketDate}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </Text>
                  {ticket.assigned_to && (
                    <Text style={styles.assigneeName}>
                      Assigned to: {ticket.assignee_name}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No tickets found</Text>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Tickets")}
          style={styles.viewAllButton}
        >
          View All Tickets
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  content: {
    padding: spacing.l,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  header: {
    marginBottom: spacing.l,
  },
  subGreeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: spacing.l,
    marginBottom: spacing.l,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.s,
  },
  actionDescription: {
    fontSize: 14,
    marginBottom: spacing.m,
    opacity: 0.7,
  },
  actionButton: {
    alignSelf: "flex-start",
  },
  statsContainer: {
    flexDirection: "column",
    marginBottom: spacing.l,
  },
  statsContainerWide: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    marginBottom: spacing.m,
    marginHorizontal: 4,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  recentTicketsContainer: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.m,
  },
  ticketCard: {
    marginBottom: spacing.m,
  },
  ticketCardContent: {
    padding: spacing.s,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    textTransform: "capitalize",
  },
  ticketDescription: {
    fontSize: 14,
    marginBottom: spacing.s,
    opacity: 0.7,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  assigneeName: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyCard: {
    marginBottom: spacing.m,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.5,
  },
  viewAllButton: {
    marginTop: spacing.s,
  },
  loader: {
    marginVertical: spacing.l,
  },
});

export default HomeScreen;
