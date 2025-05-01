import React from "react";
import { render } from "@testing-library/react-native";
import StatusBadge from "../StatusBadge";
import { TicketStatus } from "../../types/ticket";

// Mock the useTheme hook
jest.mock("react-native-paper", () => {
  const actualPaper = jest.requireActual("react-native-paper");
  return {
    ...actualPaper,
    useTheme: () => ({
      colors: {
        primary: "#1976D2",
        error: "#F44336",
        warning: "#FFC107",
        success: "#4CAF50",
      },
    }),
  };
});

// Mock the Icon component
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

describe("StatusBadge", () => {
  it("renders OPEN status correctly", () => {
    const { getByText } = render(<StatusBadge status={TicketStatus.OPEN} />);
    expect(getByText("open")).toBeTruthy();
  });

  it("renders IN_PROGRESS status correctly", () => {
    const { getByText } = render(
      <StatusBadge status={TicketStatus.IN_PROGRESS} />
    );
    expect(getByText("in progress")).toBeTruthy();
  });

  it("renders RESOLVED status correctly", () => {
    const { getByText } = render(
      <StatusBadge status={TicketStatus.RESOLVED} />
    );
    expect(getByText("resolved")).toBeTruthy();
  });

  it("renders with small size correctly", () => {
    const { getByText } = render(
      <StatusBadge status={TicketStatus.OPEN} size="small" />
    );
    expect(getByText("open")).toBeTruthy();
  });

  it("renders with large size correctly", () => {
    const { getByText } = render(
      <StatusBadge status={TicketStatus.OPEN} size="large" />
    );
    expect(getByText("open")).toBeTruthy();
  });
});
