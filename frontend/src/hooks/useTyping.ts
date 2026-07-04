"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import type { User } from "@/types";

export function useTyping(selectedUser: User | null) {
  const { socket } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ senderId }: { senderId: string }) => {
      if (senderId === selectedUser._id) setIsTyping(true);
    };

    const handleStopTyping = ({ senderId }: { senderId: string }) => {
      if (senderId === selectedUser._id) setIsTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, selectedUser]);

  const emitTyping = useCallback(() => {
    if (!socket || !selectedUser) return;
    socket.emit("typing", { receiverId: selectedUser._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, 2000);
  }, [socket, selectedUser]);

  return { isTyping, emitTyping };
}
