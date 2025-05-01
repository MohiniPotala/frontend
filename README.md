# Smart IT Ticketing System - Comprehensive Project Report

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
   - [Authentication System](#authentication-system)
   - [Navigation System](#navigation-system)
   - [Ticket Management](#ticket-management)
   - [Real-time Communication](#real-time-communication)
   - [Notifications](#notifications)
6. [Data Flow](#data-flow)
7. [API Integration](#api-integration)
8. [State Management](#state-management)
9. [UI/UX Implementation](#uiux-implementation)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Process](#deployment-process)
12. [Conclusion](#conclusion)

## Project Overview

The Smart IT Ticketing System is a mobile application built with React Native and Expo that provides an adminless helpdesk solution for organizations. It allows employees to raise technical issues as tickets and get help from IT staff. The application features a comprehensive ticketing system with real-time communication capabilities, file attachments, and notifications.

The application is designed to be a complete solution for IT support within organizations, eliminating the need for dedicated administrators by directly connecting employees with IT staff. It provides a streamlined interface for creating, tracking, and resolving technical issues.

## Architecture

The application follows a client-server architecture:

1. **Frontend (Mobile App)**: React Native application with Expo framework
2. **Backend**: RESTful API server (likely built with FastAPI based on configuration)
3. **Real-time Communication**: WebSocket server for chat and notifications
4. **Database**: PostgreSQL or SQLite (as mentioned in the local hosting guide)

The architecture is designed to be modular, with clear separation of concerns:

- **Presentation Layer**: React Native components and screens
- **Business Logic Layer**: Context providers, services, and utilities
- **Data Access Layer**: API clients and WebSocket connections

## Technology Stack

### Frontend Framework

- **React Native**: Core framework for building the mobile application
- **Expo**: Development platform for React Native, providing additional tools and services
- **TypeScript**: For type-safe code development

### UI Components

- **React Native Paper**: Material Design component library
- **React Native Vector Icons**: Icon library

### Navigation

- **React Navigation**: Navigation library with stack and tab navigators

### State Management

- **React Context API**: For global state management
- **AsyncStorage**: For persistent local storage

### API Communication

- **Axios**: HTTP client for API requests
- **Socket.io-client**: For WebSocket connections

### Form Handling

- **Formik**: Form management library
- **Yup**: Schema validation

### File Handling

- **Expo Document Picker**: For selecting files
- **Expo File System**: For file operations
- **Expo Image Picker**: For selecting images

### Testing

- **Jest**: Testing framework
- **React Testing Library**: For component testing

## Project Structure

The project follows a well-organized structure:

```
frontend/
├── __mocks__/           # Test mocks
├── scripts/             # Build and deployment scripts
├── src/
│   ├── api/             # API client and endpoints
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context for state management
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   │   ├── auth/        # Authentication screens
│   │   ├── chat/        # Chat screens
│   │   └── tickets/     # Ticket management screens
│   ├── services/        # Service classes
│   ├── theme/           # Theme configuration
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── App.tsx              # Main app component
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

This structure promotes:

- **Modularity**: Each directory has a specific purpose
- **Reusability**: Components and utilities can be reused across the app
- **Maintainability**: Clear organization makes it easier to find and update code
- **Testability**: Separation of concerns makes testing easier

## Core Components

### Authentication System

The authentication system is implemented using React Context API through the `AuthContext.tsx` file. It provides a global state for user authentication and methods for login, logout, and session management.

**Key Features:**

- **Multiple Authentication Methods**:
  - Email + OTP (One-Time Password)
  - Password-based login
- **Session Management**:
  - Token-based authentication
  - Persistent sessions using AsyncStorage
- **User Profile**:
  - User information storage and retrieval
  - Role-based access control (Employee vs. IT Staff)

**Implementation Details:**

- The `AuthProvider` component wraps the application and provides authentication state and methods
- Authentication tokens are stored in AsyncStorage for persistence
- API requests include the authentication token via Axios interceptors
- User roles determine available features (e.g., only employees can create tickets)

**Code Flow:**

1. On app startup, `AuthProvider` checks AsyncStorage for existing tokens
2. If a token exists, it's validated and the user is automatically logged in
3. Login functions make API calls to authenticate and store tokens
4. The authentication state is used throughout the app to control access to features

### Navigation System

The navigation system is built using React Navigation and consists of two main navigators:

1. **RootNavigator**: Handles authentication flow

   - Shows auth screens when not authenticated
   - Shows main app when authenticated

2. **MainTabNavigator**: Bottom tab navigation for the main app
   - Home tab
   - Tickets tab (with nested stack navigator)
   - Notifications tab
   - Profile tab

**Implementation Details:**

- Navigation is type-safe using TypeScript definitions
- Screen options are customized with icons and styling
- The tickets navigator is a nested stack navigator within the tab navigator
- Navigation state is connected to the authentication state

**Code Flow:**

1. `RootNavigator` checks authentication state from `AuthContext`
2. If authenticated, it shows `MainTabNavigator`
3. If not authenticated, it shows authentication screens
4. `MainTabNavigator` provides access to all main app features
5. The tickets stack navigator handles ticket-specific screens

### Ticket Management

The ticket management system is the core functionality of the application, allowing users to create, view, and manage support tickets.

**Key Features:**

- **Ticket Creation**: Users can create tickets with title, description, and attachments
- **Ticket Listing**: View all tickets with filtering by status
- **Ticket Details**: View and update ticket information
- **File Attachments**: Attach files to tickets for better context
- **Status Updates**: Track ticket status (Open, In Progress, Resolved)

**Implementation Details:**

- Tickets are fetched from the backend API and displayed in a list
- Tickets can be filtered by status (Open, In Progress, Resolved)
- Ticket creation uses FormData to handle file uploads
- Ticket details screen shows all information and provides actions

**Code Flow:**

1. `TicketsScreen` fetches and displays a list of tickets
2. Users can filter tickets by status
3. `CreateTicketScreen` allows users to create new tickets with attachments
4. `TicketDetailScreen` shows ticket details and provides actions
5. API calls are made to create, update, and fetch tickets

### Real-time Communication

The real-time communication system enables chat functionality between users for ticket resolution. It's implemented using WebSockets through the Socket.io client.

**Key Features:**

- **Real-time Chat**: Instant messaging between users
- **File Sharing**: Send files in chat conversations
- **Message History**: View past messages
- **Typing Indicators**: See when someone is typing
- **Connection Status**: Indicator for WebSocket connection status

**Implementation Details:**

- WebSocket connection is managed by the `SocketService` class
- `SocketContext` provides a React Context for WebSocket state and methods
- Chat messages are stored and retrieved from the backend
- File attachments can be sent and viewed in the chat

**Code Flow:**

1. When a user opens a chat, `SocketContext` connects to the WebSocket server
2. The connection is specific to a ticket (room-based)
3. Messages are sent and received in real-time
4. The chat UI updates instantly with new messages
5. Connection status is monitored and reconnection is attempted if needed

### Notifications

The notification system keeps users informed about ticket updates and new messages.

**Key Features:**

- **Unread Count**: Badge showing number of unread notifications
- **Real-time Updates**: Instant notification of new messages
- **Status Change Alerts**: Notifications when ticket status changes

**Implementation Details:**

- Notifications are fetched from the backend API
- Unread count is displayed on the notifications tab
- WebSocket events trigger notification updates

**Code Flow:**

1. `MainTabNavigator` fetches the unread notification count
2. WebSocket events update the notification state
3. Users can view all notifications in the Notifications screen
4. Notifications are marked as read when viewed

## Data Flow

The application follows a unidirectional data flow pattern:

1. **User Interaction**: User interacts with the UI
2. **Action Dispatch**: Action is dispatched (API call, context update)
3. **State Update**: State is updated based on the action result
4. **UI Update**: UI re-renders based on the new state

**Example Flow for Creating a Ticket:**

1. User fills out ticket form and submits
2. Form data is validated using Formik and Yup
3. API call is made to create the ticket
4. On success, the tickets list is updated
5. UI shows success message and navigates to tickets list

## API Integration

The application communicates with the backend through a well-structured API client:

**Key Components:**

- **apiClient.ts**: Configures Axios with base URL, interceptors, and error handling
- **API Modules**: Separate modules for different API endpoints (auth, tickets, chat, etc.)
- **API Config**: Configuration for API URLs and settings

**Implementation Details:**

- Axios interceptors add authentication tokens to requests
- Error handling is centralized in the API client
- API responses are typed using TypeScript interfaces
- File uploads use FormData for multipart/form-data requests

**Code Flow:**

1. API client is configured with base URL and interceptors
2. API modules use the client to make specific requests
3. Responses are parsed and returned as typed objects
4. Errors are caught and handled appropriately

## State Management

The application uses React Context API for global state management:

**Key Contexts:**

- **AuthContext**: Authentication state and methods
- **SocketContext**: WebSocket connection state and methods

**Implementation Details:**

- Contexts provide both state and methods to update state
- Context providers are placed at the top level of the component tree
- Custom hooks (useAuth, useSocket) provide easy access to context values
- Local component state is used for UI-specific state

**Code Flow:**

1. Context providers initialize state and provide methods
2. Components access context through custom hooks
3. State updates trigger re-renders of consuming components
4. AsyncStorage is used for persistent state

## UI/UX Implementation

The application uses React Native Paper for a consistent Material Design look and feel:

**Key UI Components:**

- **Cards**: For displaying tickets and other information
- **Buttons**: For actions
- **Text Inputs**: For forms
- **Icons**: For visual cues
- **Status Badges**: For showing ticket status

**Implementation Details:**

- Custom theme configuration in theme/index.ts
- Responsive design for different screen sizes
- Consistent spacing and typography
- Loading indicators for async operations
- Error states for failed operations

**Code Flow:**

1. Theme is configured and provided through PaperProvider
2. Components use theme values for consistent styling
3. Responsive design adapts to different screen sizes
4. Loading and error states provide feedback to users

## Testing Strategy

The application includes a testing setup with Jest and React Testing Library:

**Test Types:**

- **Unit Tests**: For utilities and isolated functions
- **Component Tests**: For UI components
- **Integration Tests**: For connected components

**Implementation Details:**

- Tests are co-located with the code they test
- Mock implementations for external dependencies
- Test setup in jest.setup.js
- Coverage reporting configuration

## Deployment Process

The application can be deployed through Expo's build service:

**Deployment Options:**

- **Development**: Using Expo Go app
- **Testing**: Building a development APK
- **Production**: Building a production APK/IPA

**Implementation Details:**

- EAS Build configuration in eas.json
- Build scripts in package.json
- Environment-specific configuration

## Conclusion

The Smart IT Ticketing System is a comprehensive mobile application that provides a complete solution for IT support within organizations. It features a robust ticketing system, real-time communication, and notifications, all built with modern React Native practices and technologies.

The application is designed to be:

- **User-Friendly**: Intuitive interface for both employees and IT staff
- **Efficient**: Streamlined workflow for ticket creation and resolution
- **Scalable**: Well-structured codebase that can be extended
- **Maintainable**: Clear organization and separation of concerns

The combination of React Native, Expo, and modern JavaScript libraries creates a powerful yet maintainable application that can be deployed across multiple platforms from a single codebase.
