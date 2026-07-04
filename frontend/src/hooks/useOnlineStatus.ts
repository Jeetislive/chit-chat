"use client";

import { useSocket } from "@/context/SocketContext";

export function useOnlineStatus(userId: string | undefined): boolean {
  const { onlineUsers } = useSocket();
  return userId ? onlineUsers.includes(userId) : false;
}
