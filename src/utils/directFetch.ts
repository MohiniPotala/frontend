/**
 * Direct fetch utility for testing API connectivity
 * This bypasses axios and uses the native fetch API
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const directFetch = async (
  url: string,
  method: string,
  data?: any,
  includeToken: boolean = false
) => {
  try {
    console.log(`Direct fetch ${method} to ${url}`);
    console.log("Request data:", data);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add auth token if requested
    if (includeToken) {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        headers["X-Session-Token"] = token;
        console.log("Added auth token to direct fetch request");
      } else {
        console.warn("No token available for direct fetch request");
      }
    }

    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    console.log("Direct fetch options:", {
      method,
      headers,
      bodyIncluded: !!options.body,
    });

    const response = await fetch(url, options);

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      // Handle non-JSON responses
      const textResponse = await response.text();
      try {
        // Try to parse as JSON anyway
        responseData = JSON.parse(textResponse);
      } catch (e) {
        // If it's not JSON, return as text
        responseData = { text: textResponse };
      }
    }

    console.log("Direct fetch response status:", response.status);
    console.log("Direct fetch response data:", responseData);

    // If response is not ok, throw an error
    if (!response.ok) {
      const error = new Error(
        responseData.detail || `HTTP error! status: ${response.status}`
      );
      // @ts-ignore - Add response data to error
      error.response = { status: response.status, data: responseData };
      throw error;
    }

    return { status: response.status, data: responseData };
  } catch (error) {
    console.error("Direct fetch error:", error);
    throw error;
  }
};
