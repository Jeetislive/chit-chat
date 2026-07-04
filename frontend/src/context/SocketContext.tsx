"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import type { SocketContextValue } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:9000";

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user?._id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
      setTypingUsers([]);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      query: { userId: user._id },
    });

    newSocket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
      setTypingUsers((prev) => prev.filter((id) => users.includes(id)));
    });

    newSocket.on("typing", ({ senderId }: { senderId: string }) => {
      setTypingUsers((prev) => prev.includes(senderId) ? prev : [...prev, senderId]);
    });

    newSocket.on("stopTyping", ({ senderId }: { senderId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== senderId));
    });

    newSocket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, typingUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
