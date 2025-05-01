import React from "react";
import { render } from "@testing-library/react-native";
import LoadingScreen from "../LoadingScreen";

// Mock the useTheme hook
jest.mock("react-native-paper", () => {
  const actualPaper = jest.requireActual("react-native-paper");
  return {
    ...actualPaper,
    useTheme: () => ({
      colors: {
        primary: "#1976D2",
        text: "#000000",
      },
    }),
  };
});

describe("LoadingScreen", () => {
  it("renders correctly with default props", () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText("Loading...")).toBeTruthy();
  });

  it("renders correctly with custom message", () => {
    const customMessage = "Custom loading message";
    const { getByText } = render(<LoadingScreen message={customMessage} />);
    expect(getByText(customMessage)).toBeTruthy();
  });
});
