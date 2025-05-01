import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Button,

  useTheme,
  ActivityIndicator,
  Menu,
} from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as DocumentPicker from "expo-document-picker";

import { ticketsApi } from "../../api/tickets";
import apiClient from "../../api/client";
import {
  Ticket,
  TicketStatus,
  IssueType,
  Attachment,
} from "../../types/ticket";
import { TicketsStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/user";

type TicketDetailScreenNavigationProp = NativeStackNavigationProp<
  TicketsStackParamList,
  "TicketDetail"
>;
type TicketDetailScreenRouteProp = RouteProp<
  TicketsStackParamList,
  "TicketDetail"
>;

const TicketDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<TicketDetailScreenNavigationProp>();
  const route = useRoute<TicketDetailScreenRouteProp>();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const { ticketId } = route.params;

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketsApi.getTicket(ticketId);
      setTicket(response);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      Alert.alert("Error", "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTicket();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;

    try {
      const updatedTicket = await ticketsApi.updateTicket(ticketId, { status });
      setTicket(updatedTicket);
      setMenuVisible(false);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      Alert.alert("Error", "Failed to update ticket status");
    }
  };

  const handleAddAttachment = async () => {
    try {
      setUploadingAttachment(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Create a proper file object for upload
      const fileToUpload = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      };

      // Log the file details for debugging
      console.log("File to upload:", {
        uri: fileToUpload.uri,
        name: fileToUpload.name,
        type: fileToUpload.type,
        size: file.size
      });

      // Add attachment to ticket
      await ticketsApi.addAttachment(
        ticketId,
        fileToUpload as any
      );

      // Refresh ticket to show new attachment
      await fetchTicket();

      Alert.alert("Success", "Attachment added successfully");
    } catch (error) {
      console.error("Error adding attachment:", error);
      // Show more detailed error message if available
      if (error instanceof Error) {
        Alert.alert("Error", `Failed to add attachment: ${error.message}`);
      } else {
        Alert.alert("Error", "Failed to add attachment");
      }
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleOpenAttachment = async (attachment: Attachment) => {
    try {
      // Extract the base URL from the API client configuration
      // This ensures we use the same server for attachments as for API calls
      const apiBaseUrl = apiClient.defaults.baseURL || "";
      // Remove "/api" from the end if present
      const baseUrl = apiBaseUrl.replace(/\/api$/, "");
      
      // Construct the full URL to the attachment
      const attachmentUrl = `${baseUrl}/${attachment.file_path}`;
      
      console.log("Opening attachment URL:", attachmentUrl);

      // Check if the URL can be opened
      const supported = await Linking.canOpenURL(attachmentUrl);

      if (supported) {
        await Linking.openURL(attachmentUrl);
      } else {
        // If not supported, show more helpful error with details
        console.error("URL not supported:", attachmentUrl);
        Alert.alert(
          "Cannot Open Attachment", 
          `Your device doesn't support opening this file type (${attachment.file_type}) or the URL is not accessible. Try downloading the file first.`
        );
      }
    } catch (error) {
      console.error("Error opening attachment:", error);
      if (error instanceof Error) {
        Alert.alert("Error", `Failed to open attachment: ${error.message}`);
      } else {
        Alert.alert("Error", "Failed to open attachment");
      }
    }
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

  const getIssueTypeIcon = (issueType: IssueType) => {
    switch (issueType) {
      case IssueType.VPN:
        return "shield-vpn";
      case IssueType.QUARANTINED:
        return "shield-alert";
      case IssueType.MFA:
        return "shield-key";
      case IssueType.OTHER:
      default:
        return "help-circle";
    }
  };

  const isWideScreen = Dimensions.get("window").width > 768;

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>Ticket not found</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={[styles.headerCard, isWideScreen && styles.headerWide]}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <View style={styles.ticketIdContainer}>
              <Icon name="ticket" size={20} color={theme.colors.primary} style={styles.ticketIcon} />
              <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
            </View>
            <Text style={styles.title}>{ticket.title}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ticket.status) },
            ]}>
              <Icon 
                name={
                  ticket.status === TicketStatus.OPEN ? "alert-circle" :
                  ticket.status === TicketStatus.IN_PROGRESS ? "progress-clock" :
                  ticket.status === TicketStatus.RESOLVED ? "check-circle" : "ticket"
                } 
                size={16} 
                color="#fff" 
                style={styles.statusIcon} 
              />
              <Text style={styles.statusText}>
                {ticket.status.replace("_", " ")}
              </Text>
            </View>

            {user?.role === UserRole.IT_STAFF && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={styles.statusButton}
                    icon="pencil"
                  >
                    Update Status
                  </Button>
                }
              >
              <Menu.Item
                onPress={() => handleStatusChange(TicketStatus.OPEN)}
                title="Open"
                disabled={ticket.status === TicketStatus.OPEN}
              />
              <Menu.Item
                onPress={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                title="In Progress"
                disabled={ticket.status === TicketStatus.IN_PROGRESS}
              />
              <Menu.Item
                onPress={() => handleStatusChange(TicketStatus.RESOLVED)}
                title="Resolved"
                disabled={ticket.status === TicketStatus.RESOLVED}
              />
            </Menu>
          )}
        </View>
      </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created by:</Text>
            <Text style={styles.infoValue}>{ticket.creator_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created on:</Text>
            <Text style={styles.infoValue}>
              {new Date(ticket.created_at).toLocaleString()}
            </Text>
          </View>

          {ticket.assigned_to && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned to:</Text>
              <Text style={styles.infoValue}>{ticket.assignee_name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Issue Type:</Text>
            <View style={styles.issueTypeContainer}>
              <Icon
                name={getIssueTypeIcon(ticket.issue_type)}
                size={16}
                color={theme.colors.primary}
                style={styles.issueTypeIcon}
              />
              <Text style={styles.infoValue}>
                {ticket.issue_type.replace("_", " ")}
              </Text>
            </View>
          </View>

          {ticket.device_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device:</Text>
              <Text style={styles.infoValue}>{ticket.device_name}</Text>
            </View>
          )}

          {ticket.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{ticket.location}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.descriptionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{ticket.description}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.attachmentsCard}>
        <Card.Content>
          <View style={styles.attachmentsHeader}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            <Button
              mode="text"
              onPress={handleAddAttachment}
              loading={uploadingAttachment}
              disabled={uploadingAttachment}
              icon="paperclip"
            >
              Add
            </Button>
          </View>

          {ticket.attachments.length > 0 ? (
            ticket.attachments.map((attachment) => (
              <TouchableOpacity
                key={attachment.id}
                style={styles.attachmentItem}
                onPress={() => handleOpenAttachment(attachment)}
              >
                <Icon
                  name={
                    attachment.file_type.startsWith("image")
                      ? "file-image"
                      : attachment.file_type.includes("pdf")
                      ? "file-pdf"
                      : attachment.file_type.includes("word")
                      ? "file-word"
                      : attachment.file_type.includes("excel")
                      ? "file-excel"
                      : "file-document"
                  }
                  size={24}
                  color={theme.colors.primary}
                  style={styles.attachmentIcon}
                />
                <View style={styles.attachmentDetails}>
                  <Text style={styles.attachmentName}>
                    {attachment.file_name}
                  </Text>
                  <Text style={styles.attachmentInfo}>
                    {(attachment.file_size / 1024).toFixed(2)} KB •{" "}
                    {new Date(attachment.uploaded_at).toLocaleString()}
                  </Text>
                </View>
                <Icon
                  name="open-in-new"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noAttachmentsText}>No attachments</Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        {user?.role === UserRole.EMPLOYEE &&
          ticket.status !== TicketStatus.RESOLVED && (
            <Button
              mode="outlined"
              onPress={() =>
                navigation.navigate("EditTicket", { ticketId: ticket.id })
              }
              style={styles.actionButton}
              icon="pencil"
            >
              Edit Ticket
            </Button>
          )}

        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("Chat", {
              ticketId: ticket.id,
              ticketTitle: ticket.title,
            })
          }
          style={styles.actionButton}
          icon="chat"
        >
          Chat
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginLeft: spacing.m,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: spacing.xl,
  },
  attachmentDetails: {
    flex: 1,
  },
  attachmentIcon: {
    marginRight: spacing.m,
  },
  attachmentInfo: {
    fontSize: 12,
    opacity: 0.5,
  },
  attachmentItem: {
    alignItems: "center",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: spacing.m,
  },
  attachmentName: {
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  attachmentsCard: {
    marginBottom: spacing.l,
  },
  attachmentsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  backButton: {
    marginTop: spacing.m,
  },
  container: {
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  content: {
    padding: spacing.l,
  },
  description: {
    lineHeight: 22,
  },
  descriptionCard: {
    marginBottom: spacing.l,
  },
  errorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    marginVertical: spacing.l,
  },
  header: {
    marginBottom: spacing.l,
  },
  headerCard: {
    marginBottom: spacing.l,
  },
  headerWide: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCard: {
    marginBottom: spacing.l,
  },
  infoLabel: {
    fontWeight: "bold",
    opacity: 0.7,
    width: 100,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: spacing.s,
  },
  infoValue: {
    flex: 1,
  },
  issueTypeContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  issueTypeIcon: {
    marginRight: spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  noAttachmentsText: {
    opacity: 0.5,
    paddingVertical: spacing.l,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.m,
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  statusButton: {
    marginLeft: spacing.s,
  },
  statusChip: {
    marginRight: spacing.m,
  },
  statusContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.m,
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusText: {
    color: "#fff",
    textTransform: "capitalize",
  },
  ticketIcon: {
    marginRight: spacing.xs,
  },
  ticketId: {
    fontSize: 14,
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  ticketIdContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  titleContainer: {
    marginBottom: spacing.m,
  },
  titleContainer: {
    flex: 1,
    marginBottom: spacing.m,
  },
});

export default TicketDetailScreen;
