import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

// Ticket Screens
import TicketsScreen from "../screens/tickets/TicketsScreen";
import TicketDetailScreen from "../screens/tickets/TicketDetailScreen";
import CreateTicketScreen from "../screens/tickets/CreateTicketScreen";
import EditTicketScreen from "../screens/tickets/EditTicketScreen";
import ChatScreen from "../screens/chat/ChatScreen";

// Types
import { MainTabParamList, TicketsStackParamList } from "../types/navigation";
import { notificationsApi } from "../api/notifications";

const Tab = createBottomTabNavigator<MainTabParamList>();
const TicketsStack = createNativeStackNavigator<TicketsStackParamList>();

// Tickets Stack Navigator
const TicketsNavigator = () => {
  return (
    <TicketsStack.Navigator>
      <TicketsStack.Screen
        name="TicketsList"
        component={TicketsScreen}
        options={{ title: "Tickets" }}
      />
      <TicketsStack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={({ route }) => ({ title: `Ticket #${route.params.ticketId}` })}
      />
      <TicketsStack.Screen
        name="CreateTicket"
        component={CreateTicketScreen}
        options={{ title: "Create Ticket" }}
      />
      <TicketsStack.Screen
        name="EditTicket"
        component={EditTicketScreen}
        options={{ title: "Edit Ticket" }}
      />
      <TicketsStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params.ticketTitle })}
      />
    </TicketsStack.Navigator>
  );
};

const MainTabNavigator = () => {
  const theme = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsApi.getUnreadCount();
        setUnreadCount(response.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Set up interval to periodically check for new notifications
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="ticket" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" color={color} size={size} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
