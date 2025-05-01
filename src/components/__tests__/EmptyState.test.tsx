import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EmptyState from "../EmptyState";

// Mock the useTheme hook
jest.mock("react-native-paper", () => {
  const actualPaper = jest.requireActual("react-native-paper");
  return {
    ...actualPaper,
    useTheme: () => ({
      colors: {
        primary: "#1976D2",
        text: "#000000",
        disabled: "#9E9E9E",
      },
    }),
    Button: ({ children, onPress }) => (
      <actualPaper.TouchableOpacity onPress={onPress} testID="button">
        {children}
      </actualPaper.TouchableOpacity>
    ),
  };
});

// Mock the Icon component
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

describe("EmptyState", () => {
  it("renders correctly with required props", () => {
    const title = "No items found";
    const { getByText } = render(<EmptyState title={title} />);
    expect(getByText(title)).toBeTruthy();
  });

  it("renders correctly with message", () => {
    const title = "No items found";
    const message = "Try adjusting your search or filters";
    const { getByText } = render(
      <EmptyState title={title} message={message} />
    );
    expect(getByText(title)).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it("renders correctly with button and handles press", () => {
    const title = "No items found";
    const buttonText = "Create New";
    const onButtonPress = jest.fn();

    const { getByText, getByTestId } = render(
      <EmptyState
        title={title}
        buttonText={buttonText}
        onButtonPress={onButtonPress}
      />
    );

    expect(getByText(title)).toBeTruthy();
    expect(getByText(buttonText)).toBeTruthy();

    fireEvent.press(getByTestId("button"));
    expect(onButtonPress).toHaveBeenCalled();
  });

  it("does not render button when buttonText is not provided", () => {
    const title = "No items found";
    const onButtonPress = jest.fn();

    const { queryByTestId } = render(
      <EmptyState title={title} onButtonPress={onButtonPress} />
    );

    expect(queryByTestId("button")).toBeNull();
  });

  it("does not render button when onButtonPress is not provided", () => {
    const title = "No items found";
    const buttonText = "Create New";

    const { queryByTestId } = render(
      <EmptyState title={title} buttonText={buttonText} />
    );

    expect(queryByTestId("button")).toBeNull();
  });
});
