import "react-native-gesture-handler/jestSetup";

// Mock the AsyncStorage module
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock the react-native-vector-icons module
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

// Mock Expo modules
jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      type: "success",
      uri: "file://test.jpg",
      name: "test.jpg",
      size: 1024,
    })
  ),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///document/directory/",
  cacheDirectory: "file:///cache/directory/",
  downloadAsync: jest.fn(() => Promise.resolve({ uri: "file://test.jpg" })),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({ exists: true, uri: "file://test.jpg", size: 1024 })
  ),
  readAsStringAsync: jest.fn(() => Promise.resolve("file content")),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock the Linking module
jest.mock("react-native/Libraries/Linking/Linking", () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

// Mock the WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  onopen: jest.fn(),
  onclose: jest.fn(),
  onerror: jest.fn(),
  onmessage: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock the console methods
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
