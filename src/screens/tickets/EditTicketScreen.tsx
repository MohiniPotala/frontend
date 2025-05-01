import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Chip,
  useTheme,
  HelperText,
  ActivityIndicator,
} from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import * as Yup from "yup";

import { ticketsApi } from "../../api/tickets";
import { IssueType, TicketUpdate } from "../../types/ticket";
import { TicketsStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";

type EditTicketScreenNavigationProp = NativeStackNavigationProp<
  TicketsStackParamList,
  "EditTicket"
>;
type EditTicketScreenRouteProp = RouteProp<TicketsStackParamList, "EditTicket">;

const EditTicketSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title is too long"),
  description: Yup.string().required("Description is required"),
  deviceName: Yup.string(),
  location: Yup.string(),
  issueType: Yup.string().required("Issue type is required"),
});

const EditTicketScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<EditTicketScreenNavigationProp>();
  const route = useRoute<EditTicketScreenRouteProp>();

  const [loading, setLoading] = useState(false);
  const [fetchingTicket, setFetchingTicket] = useState(true);
  const [ticket, setTicket] = useState<any>(null);

  const { ticketId } = route.params;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setFetchingTicket(true);
        const response = await ticketsApi.getTicket(ticketId);
        setTicket(response);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        Alert.alert("Error", "Failed to load ticket details");
        navigation.goBack();
      } finally {
        setFetchingTicket(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleUpdateTicket = async (values: {
    title: string;
    description: string;
    deviceName: string;
    location: string;
    issueType: string;
  }) => {
    try {
      setLoading(true);

      const ticketData: TicketUpdate = {
        title: values.title,
        description: values.description,
        device_name: values.deviceName || undefined,
        location: values.location || undefined,
        issue_type: values.issueType as IssueType,
      };

      const updatedTicket = await ticketsApi.updateTicket(ticketId, ticketData);

      Alert.alert("Success", "Ticket updated successfully", [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("TicketDetail", { ticketId: updatedTicket.id }),
        },
      ]);
    } catch (error) {
      console.error("Error updating ticket:", error);
      Alert.alert("Error", "Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTicket) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Edit Ticket</Text>

        <Formik
          initialValues={{
            title: ticket.title,
            description: ticket.description,
            deviceName: ticket.device_name || "",
            location: ticket.location || "",
            issueType: ticket.issue_type,
          }}
          validationSchema={EditTicketSchema}
          onSubmit={handleUpdateTicket}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <View style={styles.form}>
              <TextInput
                label="Title"
                value={values.title}
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
                error={touched.title && !!errors.title}
                style={styles.input}
                mode="outlined"
              />
              {touched.title && errors.title && (
                <HelperText type="error" visible={true}>
                  {errors.title}
                </HelperText>
              )}

              <TextInput
                label="Description"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                error={touched.description && !!errors.description}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={5}
              />
              {touched.description && errors.description && (
                <HelperText type="error" visible={true}>
                  {errors.description}
                </HelperText>
              )}

              <TextInput
                label="Device Name (Optional)"
                value={values.deviceName}
                onChangeText={handleChange("deviceName")}
                onBlur={handleBlur("deviceName")}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Location (Optional)"
                value={values.location}
                onChangeText={handleChange("location")}
                onBlur={handleBlur("location")}
                style={styles.input}
                mode="outlined"
              />

              <Text style={styles.sectionTitle}>Issue Type</Text>

              <View style={styles.issueTypeContainer}>
                <Chip
                  selected={values.issueType === IssueType.VPN}
                  onPress={() => setFieldValue("issueType", IssueType.VPN)}
                  style={[
                    styles.issueTypeChip,
                    values.issueType === IssueType.VPN && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={[
                    values.issueType === IssueType.VPN && { color: "#fff" },
                  ]}
                  icon="shield-vpn"
                >
                  VPN
                </Chip>

                <Chip
                  selected={values.issueType === IssueType.QUARANTINED}
                  onPress={() =>
                    setFieldValue("issueType", IssueType.QUARANTINED)
                  }
                  style={[
                    styles.issueTypeChip,
                    values.issueType === IssueType.QUARANTINED && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={[
                    values.issueType === IssueType.QUARANTINED && {
                      color: "#fff",
                    },
                  ]}
                  icon="shield-alert"
                >
                  Quarantined
                </Chip>

                <Chip
                  selected={values.issueType === IssueType.MFA}
                  onPress={() => setFieldValue("issueType", IssueType.MFA)}
                  style={[
                    styles.issueTypeChip,
                    values.issueType === IssueType.MFA && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={[
                    values.issueType === IssueType.MFA && { color: "#fff" },
                  ]}
                  icon="shield-key"
                >
                  MFA
                </Chip>

                <Chip
                  selected={values.issueType === IssueType.OTHER}
                  onPress={() => setFieldValue("issueType", IssueType.OTHER)}
                  style={[
                    styles.issueTypeChip,
                    values.issueType === IssueType.OTHER && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={[
                    values.issueType === IssueType.OTHER && { color: "#fff" },
                  ]}
                  icon="help-circle"
                >
                  Other
                </Chip>
              </View>
              {touched.issueType && errors.issueType && (
                <HelperText type="error" visible={true}>
                  {errors.issueType}
                </HelperText>
              )}

              <View style={styles.buttonsContainer}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Update Ticket
                </Button>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: spacing.l,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    marginBottom: spacing.l,
  },
  backButton: {
    marginTop: spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.l,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: spacing.m,
    marginTop: spacing.m,
  },
  issueTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.m,
  },
  issueTypeChip: {
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.l,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default EditTicketScreen;
