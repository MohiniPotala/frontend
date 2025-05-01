import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Chip,
  useTheme,
  HelperText,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import * as Yup from "yup";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { ticketsApi } from "../../api/tickets";
import { IssueType, TicketCreate } from "../../types/ticket";
import { TicketsStackParamList } from "../../types/navigation";
import { spacing } from "../../theme";

type CreateTicketScreenNavigationProp = NativeStackNavigationProp<
  TicketsStackParamList,
  "CreateTicket"
>;

const CreateTicketSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title is too long"),
  description: Yup.string().required("Description is required"),
  deviceName: Yup.string(),
  location: Yup.string(),
  issueType: Yup.string().required("Issue type is required"),
});

const CreateTicketScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<CreateTicketScreenNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const handlePickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Process the files to ensure they have all required properties
      const processedFiles = result.assets.map(file => {
        console.log("Selected file:", file);
        // Ensure we have all the required properties for the backend
        return {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || "application/octet-stream",
          size: file.size,
          // Add type property which is used by FormData
          type: file.mimeType || "application/octet-stream",
        };
      });

      console.log("Processed files:", processedFiles);

      // Add the picked files to the selected files array
      setSelectedFiles([...selectedFiles, ...processedFiles]);
    } catch (error) {
      console.error("Error picking files:", error);
      Alert.alert("Error", "Failed to pick files");
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleCreateTicket = async (values: {
    title: string;
    description: string;
    deviceName: string;
    location: string;
    issueType: string;

  }) => {
    try {
      // Show loading state immediately
      setLoading(true);
      
      // Prepare feedback for user
      Alert.alert("Processing", "Creating your ticket, please wait...");

      const ticketData: TicketCreate = {
        title: values.title,
        description: values.description,
        device_name: values.deviceName || undefined,
        location: values.location || undefined,
        issue_type: values.issueType as IssueType,
      };

      console.log("Creating ticket with data:", ticketData);
      console.log(`Preparing ${selectedFiles.length} files for upload`);

      // Convert selected files to the format expected by the API
      const filesToUpload = selectedFiles.map((file, index) => {
        // Create a proper file object that FormData can handle correctly
        const fileObj = {
          uri: file.uri,
          name: file.name || `file-${index}.${file.uri.split('.').pop()}`,
          type: file.mimeType || "application/octet-stream",
          // Ensure size is included if available
          size: file.size,
        };
        console.log(`File ${index} prepared for upload:`, fileObj);
        return fileObj;
      });

      console.log(`Total files to upload: ${filesToUpload.length}`);

      // Create the ticket
      const createdTicket = await ticketsApi.createTicket(
        ticketData,
        filesToUpload
      );
      
      console.log("Ticket created successfully:", createdTicket);

      // Clear any existing alerts and show success message
      setTimeout(() => {
        Alert.alert("Success", "Ticket created successfully", [
          {
            text: "View Ticket",
            onPress: () =>
              navigation.navigate("TicketDetail", { ticketId: createdTicket.id }),
          },
          {
            text: "Back to Tickets",
            onPress: () => navigation.navigate("TicketsList"),
          },
        ]);
      }, 500);
    } catch (error) {
      console.error("Error creating ticket:", error);
      
      // Show a more detailed error message
      setTimeout(() => {
        Alert.alert(
          "Error Creating Ticket", 
          error instanceof Error 
            ? `${error.message}` 
            : "An unexpected error occurred. Please try again."
        );
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create New Ticket</Text>
          <Text style={styles.subtitle}>
            Please provide details about your issue
          </Text>
        </View>

        <Formik
          initialValues={{
            title: "",
            description: "",
            deviceName: "",
            location: "",
            issueType: IssueType.OTHER,
          }}
          validationSchema={CreateTicketSchema}
          onSubmit={handleCreateTicket}
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
                <TouchableOpacity
                  onPress={() => setFieldValue("issueType", IssueType.VPN)}
                  style={[
                    styles.issueTypeCard,
                    values.issueType === IssueType.VPN && styles.selectedIssueType,
                  ]}
                >
                  <View style={styles.issueTypeIconContainer}>
                    <Icon 
                      name="shield-vpn" 
                      size={24} 
                      color={values.issueType === IssueType.VPN ? "#fff" : "#1976D2"} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.issueTypeLabel,
                      values.issueType === IssueType.VPN && styles.selectedIssueTypeText
                    ]}
                  >
                    VPN Issues
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFieldValue("issueType", IssueType.QUARANTINED)}
                  style={[
                    styles.issueTypeCard,
                    values.issueType === IssueType.QUARANTINED && styles.selectedIssueType,
                  ]}
                >
                  <View style={styles.issueTypeIconContainer}>
                    <Icon 
                      name="shield-alert" 
                      size={24} 
                      color={values.issueType === IssueType.QUARANTINED ? "#fff" : "#1976D2"} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.issueTypeLabel,
                      values.issueType === IssueType.QUARANTINED && styles.selectedIssueTypeText
                    ]}
                  >
                    Quarantined
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFieldValue("issueType", IssueType.MFA)}
                  style={[
                    styles.issueTypeCard,
                    values.issueType === IssueType.MFA && styles.selectedIssueType,
                  ]}
                >
                  <View style={styles.issueTypeIconContainer}>
                    <Icon 
                      name="shield-key" 
                      size={24} 
                      color={values.issueType === IssueType.MFA ? "#fff" : "#1976D2"} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.issueTypeLabel,
                      values.issueType === IssueType.MFA && styles.selectedIssueTypeText
                    ]}
                  >
                    MFA Issues
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFieldValue("issueType", IssueType.OTHER)}
                  style={[
                    styles.issueTypeCard,
                    values.issueType === IssueType.OTHER && styles.selectedIssueType,
                  ]}
                >
                  <View style={styles.issueTypeIconContainer}>
                    <Icon 
                      name="help-circle" 
                      size={24} 
                      color={values.issueType === IssueType.OTHER ? "#fff" : "#1976D2"} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.issueTypeLabel,
                      values.issueType === IssueType.OTHER && styles.selectedIssueTypeText
                    ]}
                  >
                    Other Issues
                  </Text>
                </TouchableOpacity>
              </View>
              {touched.issueType && errors.issueType && (
                <HelperText type="error" visible={true}>
                  {errors.issueType}
                </HelperText>
              )}

              <Text style={styles.sectionTitle}>Attachments</Text>

              <Button
                mode="outlined"
                onPress={handlePickFiles}
                icon="paperclip"
                style={styles.attachButton}
              >
                Add Attachments
              </Button>

              {selectedFiles.length > 0 && (
                <View style={styles.selectedFilesContainer}>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <Icon
                        name={
                          file.mimeType?.startsWith("image")
                            ? "file-image"
                            : file.mimeType?.includes("pdf")
                            ? "file-pdf"
                            : file.mimeType?.includes("word")
                            ? "file-word"
                            : file.mimeType?.includes("excel")
                            ? "file-excel"
                            : "file-document"
                        }
                        size={24}
                        color={theme.colors.primary}
                        style={styles.fileIcon}
                      />
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Button
                        icon="close"
                        mode="text"
                        compact
                        onPress={() => handleRemoveFile(index)}
                      />
                    </View>
                  ))}
                </View>
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
                  Create Ticket
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
  headerContainer: {
    marginBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.xs,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: spacing.s,
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
    justifyContent: "space-between",
  },
  issueTypeCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedIssueType: {
    backgroundColor: '#1976D2', // Primary color
    borderColor: '#1976D2',
  },
  issueTypeIconContainer: {
    marginBottom: spacing.s,
  },
  issueTypeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedIssueTypeText: {
    color: '#fff',
  },
  attachButton: {
    marginBottom: spacing.m,
  },
  selectedFilesContainer: {
    marginBottom: spacing.m,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  fileIcon: {
    marginRight: spacing.s,
  },
  fileName: {
    flex: 1,
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

export default CreateTicketScreen;
