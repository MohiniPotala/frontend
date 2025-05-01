import { NavigatorScreenParams } from "@react-navigation/native";
import { TicketStatus, IssueType } from "./ticket";

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  OTP: { email: string; isRegistration?: boolean };
  Register: { email: string; otp: string };
  SetPassword: { email: string; otp: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Tickets: undefined;
  Profile: undefined;
  Notifications: undefined;
};

// Tickets Stack
export type TicketsStackParamList = {
  TicketsList: { status?: TicketStatus };
  TicketDetail: { ticketId: number };
  CreateTicket: undefined;
  EditTicket: { ticketId: number };
  Chat: { ticketId: number; ticketTitle: string };
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  TicketDetail: { ticketId: number };
  Chat: { ticketId: number; ticketTitle: string };
  CreateTicket: undefined;
  EditTicket: { ticketId: number };
  Login: undefined;
  OTP: { email: string; isRegistration?: boolean };
  Register: { email: string; otp: string };
};
