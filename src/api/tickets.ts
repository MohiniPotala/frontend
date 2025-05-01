import apiClient from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Ticket,
  TicketCreate,
  TicketUpdate,
  Attachment,
} from "../types/ticket";

interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  page_size: number;
}

export const ticketsApi = {
  // Get all tickets
  getTickets: async (
    status?: string,
    skip = 0,
    limit = 20
  ): Promise<TicketListResponse> => {
    const params = { status, skip, limit };
    const response = await apiClient.get("/tickets", { params });
    return response.data;
  },

  // Get a ticket by ID
  getTicket: async (ticketId: number): Promise<Ticket> => {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  },

  // Create a new ticket
  createTicket: async (
    ticketData: TicketCreate,
    files?: any[]
  ): Promise<Ticket> => {
    try {
      console.log("Creating ticket with data:", ticketData);
      console.log("Files to upload:", files?.length || 0);
      
      // Create a new FormData instance
      const formData = new FormData();

      // Add ticket data to form
      formData.append("title", ticketData.title);
      formData.append("description", ticketData.description);
      if (ticketData.device_name) {
        formData.append("device_name", ticketData.device_name);
      }
      if (ticketData.location) {
        formData.append("location", ticketData.location);
      }
      formData.append("issue_type", ticketData.issue_type);

      // Add files if any - IMPORTANT: backend expects field name "files"
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Create a file object compatible with React Native FormData
          const fileObj = {
            uri: file.uri,
            type: file.type || file.mimeType || 'application/octet-stream',
            name: file.name || `file-${i}.${file.uri.split('.').pop()}`,
          };
          
          console.log(`Adding file ${i} to FormData:`, fileObj);
          
          // Use the field name "files" as expected by the backend
          // The backend is looking for this exact field name in routers/tickets.py
          formData.append('files', fileObj as any);
        }
        
        console.log(`Total files appended to FormData: ${files.length}`);
      }

      // Get the token for authentication
      const token = await AsyncStorage.getItem('token');
      
      // Use fetch directly instead of axios for better control over FormData
      console.log(`Sending request to ${apiClient.defaults.baseURL}/tickets`);
      
      // Log the FormData contents for debugging
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await fetch(`${apiClient.defaults.baseURL}/tickets`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': token || '',
          // Don't set Content-Type - let the browser/RN set it with the boundary
        },
        body: formData,
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          // Try to parse as JSON first
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
          console.error(`Server error ${response.status} (JSON):`, errorJson);
        } catch (e) {
          // If not JSON, get as text
          errorText = await response.text();
          console.error(`Server error ${response.status} (Text):`, errorText);
        }
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Ticket created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating ticket:", error);
      // Add more detailed error information
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      throw error;
    }
  },

  // Update a ticket
  updateTicket: async (
    ticketId: number,
    ticketData: TicketUpdate
  ): Promise<Ticket> => {
    const response = await apiClient.put(`/tickets/${ticketId}`, ticketData);
    return response.data;
  },

  // Add an attachment to a ticket
  addAttachment: async (ticketId: number, file: any): Promise<Attachment> => {
    try {
      console.log("Adding attachment to ticket", ticketId, file);
      
      // Create a FormData object
      const formData = new FormData();
      
      // Append the file to the FormData object with the correct field name
      // The backend expects the field to be named "file"
      formData.append("file", file);
      
      // Use apiClient with the correct content type for file uploads
      // Note: We need to let the browser set the correct Content-Type with boundary
      const response = await apiClient.post(
        `/tickets/${ticketId}/attachments`, 
        formData,
        {
          headers: {
            // Remove Content-Type to let the browser set it with the correct boundary
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          // Prevent axios from trying to JSON.stringify the FormData
          transformRequest: (data) => data,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error in addAttachment:", error);
      throw error;
    }
  },
};
