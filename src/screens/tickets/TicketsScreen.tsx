import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Searchbar,
  FAB,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { ticketsApi } from "../../api/tickets";
import { Ticket, TicketStatus } from "../../types/ticket";
import { TicketsStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/user";

type TicketsScreenNavigationProp = NativeStackNavigationProp<
  TicketsStackParamList,
  "TicketsList"
>;
type TicketsScreenRouteProp = RouteProp<TicketsStackParamList, "TicketsList">;

const TicketsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<TicketsScreenNavigationProp>();
  const route = useRoute<TicketsScreenRouteProp>();
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TicketStatus | null>(
    route.params?.status || null
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 10;

  const fetchTickets = async (
    status?: TicketStatus,
    pageNum = 1,
    refresh = false
  ) => {
    try {
      if (refresh) {
        setLoading(true);
      } else if (pageNum > 1) {
        setLoadingMore(true);
      }

      const skip = (pageNum - 1) * pageSize;
      const response = await ticketsApi.getTickets(status, skip, pageSize);

      const newTickets = response.tickets;

      if (refresh || pageNum === 1) {
        setTickets(newTickets);
        setFilteredTickets(newTickets);
      } else {
        setTickets([...tickets, ...newTickets]);
        setFilteredTickets([...tickets, ...newTickets]);
      }

      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchTickets(activeFilter || undefined, 1, true);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTickets(activeFilter || undefined, page);
  }, [activeFilter]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTickets(filtered);
    } else {
      setFilteredTickets(tickets);
    }
  }, [searchQuery, tickets]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTickets(activeFilter || undefined, nextPage);
    }
  };

  const handleFilterPress = (status: TicketStatus | null) => {
    setActiveFilter(status);
    setPage(1);
  };

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

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <Card
      style={[styles.ticketCard, { borderLeftColor: getStatusColor(item.status), borderLeftWidth: 4 }]}
      onPress={() => navigation.navigate("TicketDetail", { ticketId: item.id })}
    >
      <Card.Content>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketTitleContainer}>
            <Icon 
              name={getStatusIcon(item.status)} 
              size={18} 
              color={getStatusColor(item.status)} 
              style={styles.ticketIcon}
            />
            <Text style={styles.ticketTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        <Text style={styles.ticketDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.ticketFooter}>
          <View style={styles.ticketMetadata}>
            <Icon name="calendar" size={14} color="#757575" style={styles.metadataIcon} />
            <Text style={styles.ticketDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          {item.assigned_to && (
            <View style={styles.ticketMetadata}>
              <Icon name="account" size={14} color="#757575" style={styles.metadataIcon} />
              <Text style={styles.assigneeName}>
                {item.assignee_name}
              </Text>
            </View>
          )}
          
          {item.issue_type && (
            <View style={styles.ticketMetadata}>
              <Icon 
                name={
                  item.issue_type === "VPN" ? "shield-vpn" :
                  item.issue_type === "MFA" ? "shield-key" :
                  item.issue_type === "QUARANTINED" ? "shield-alert" : "help-circle"
                } 
                size={14} 
                color="#757575" 
                style={styles.metadataIcon} 
              />
              <Text style={styles.issueType}>
                {item.issue_type}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const isWideScreen = Dimensions.get("window").width > 768;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search tickets"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View
          style={[
            styles.filterContainer,
            isWideScreen && styles.filterContainerWide,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === null && styles.activeFilterButton,
              activeFilter === null && { borderColor: theme.colors.primary },
            ]}
            onPress={() => handleFilterPress(null)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === null && { color: theme.colors.primary },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TicketStatus.OPEN && styles.activeFilterButton,
              activeFilter === TicketStatus.OPEN && {
                borderColor: theme.colors.error,
              },
            ]}
            onPress={() => handleFilterPress(TicketStatus.OPEN)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === TicketStatus.OPEN && {
                  color: theme.colors.error,
                },
              ]}
            >
              Open
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TicketStatus.IN_PROGRESS &&
                styles.activeFilterButton,
              activeFilter === TicketStatus.IN_PROGRESS && {
                borderColor: theme.colors.warning,
              },
            ]}
            onPress={() => handleFilterPress(TicketStatus.IN_PROGRESS)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === TicketStatus.IN_PROGRESS && {
                  color: theme.colors.warning,
                },
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TicketStatus.RESOLVED &&
                styles.activeFilterButton,
              activeFilter === TicketStatus.RESOLVED && {
                borderColor: theme.colors.success,
              },
            ]}
            onPress={() => handleFilterPress(TicketStatus.RESOLVED)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === TicketStatus.RESOLVED && {
                  color: theme.colors.success,
                },
              ]}
            >
              Resolved
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : filteredTickets.length > 0 ? (
        <FlatList
          data={filteredTickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="ticket-off" size={48} color={theme.colors.disabled} />
          <Text style={styles.emptyText}>No tickets found</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("CreateTicket")}
            style={styles.createButton}
          >
            Create Ticket
          </Button>
        </View>
      )}

      {user?.role === UserRole.EMPLOYEE && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={() => navigation.navigate("CreateTicket")}
          color="#fff"
        />
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
    padding: spacing.m,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchBar: {
    marginBottom: spacing.m,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.s,
  },
  filterContainerWide: {
    justifyContent: "center",
  },
  filterButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  activeFilterButton: {
    borderWidth: 2,
  },
  filterText: {
    fontSize: 14,
  },
  listContent: {
    padding: spacing.m,
  },
  ticketCard: {
    marginBottom: spacing.m,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  ticketTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ticketIcon: {
    marginRight: 8,
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
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    textTransform: "capitalize",
    fontWeight: "bold",
  },
  ticketDescription: {
    fontSize: 14,
    marginBottom: spacing.m,
    opacity: 0.7,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  ticketMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.m,
    marginBottom: spacing.xs,
  },
  metadataIcon: {
    marginRight: 4,
  },
  ticketDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  assigneeName: {
    fontSize: 12,
    opacity: 0.7,
  },
  issueType: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
    fontSize: 16,
    opacity: 0.5,
  },
  createButton: {
    marginTop: spacing.m,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: spacing.m,
    alignItems: "center",
  },
});

export default TicketsScreen;
