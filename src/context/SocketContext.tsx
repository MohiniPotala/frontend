import React, { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/socketService";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  isConnected: boolean;
  connect: (ticketId: number) => Promise<void>;
  disconnect: () => void;
  send: (data: Record<string, unknown>) => void;
  joinRoom: (ticketId: number) => void;
  leaveRoom: () => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  send: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  on: () => {},
  off: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useAuth();

  // We'll connect to socket only when needed for a specific ticket
  // This is now handled by the joinRoom method
  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log("Auth state changed - disconnecting socket");
      disconnect();
    }

    return () => {
      console.log("SocketContext unmounting - disconnecting socket");
      disconnect();
    };
  }, [isAuthenticated, token]);

  // Check connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(socketService.isConnected());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const connect = async (ticketId: number) => {
    try {
      await socketService.connect(ticketId);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect to socket:", error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    console.log("SocketContext: Disconnecting socket service");
    socketService.disconnect();
    setIsConnected(false);
  };

  const send = (data: Record<string, unknown>) => {
    socketService.send(data);
  };

  const joinRoom = (ticketId: number) => {
    socketService.joinRoom(ticketId);
    setIsConnected(socketService.isConnected());
  };

  const leaveRoom = () => {
    socketService.leaveRoom();
    setIsConnected(false);
  };

  const on = (event: string, callback: (...args: unknown[]) => void) => {
    socketService.on(event, callback);
  };

  const off = (event: string, callback: (...args: unknown[]) => void) => {
    socketService.off(event, callback);
  };

  const value = {
    isConnected,
    connect,
    disconnect,
    send,
    joinRoom,
    leaveRoom,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
