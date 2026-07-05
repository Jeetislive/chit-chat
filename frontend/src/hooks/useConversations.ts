"use client";

import { useState, useEffect, useCallback } from "react";
import { conversationApi, messageApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import type { Conversation, Message, User } from "@/types";

export function useConversations(selectedUser: User | null) {
  const { user } = useAuth();
  const { socket, typingUsers } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(() => {
    conversationApi.getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      if (!user) return;
      const otherId = msg.sender === user._id ? msg.receiver : msg.sender;
      const isForSelected = selectedUser && (msg.sender === selectedUser._id || msg.receiver === selectedUser._id);

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.user._id === otherId);
        if (idx === -1) return prev;

        const updated = prev[idx];
        const newConv: Conversation = {
          ...updated,
          lastMessage: {
            content: msg.isDeleted
              ? "This message was deleted"
              : (msg.encrypted ? "" : (msg.content || "")),
            createdAt: msg.createdAt,
          },
          unreadCount: isForSelected ? 0 : updated.unreadCount + 1,
        };

        const next = [...prev];
        next.splice(idx, 1);
        next.unshift(newConv);
        return next;
      });
    };

    const handleMessagesRead = ({ readBy }: { readBy: string }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.user._id === readBy ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    const handleMessageDeleted = () => {};

    const handleConversationCleared = ({ byUserId }: { byUserId: string }) => {
      if (!user) return;
      const removedId = byUserId === user._id ? "" : byUserId;
      setConversations((prev) => prev.filter((c) => c.user._id !== removedId));
      fetchConversations();
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("conversationCleared", handleConversationCleared);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("conversationCleared", handleConversationCleared);
    };
  }, [socket, user?._id, selectedUser, fetchConversations]);

  const markAsRead = useCallback((conv: Conversation) => {
    if (conv.unreadCount > 0 && socket) {
      socket.emit("markRead", { otherUserId: conv.user._id });
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.user._id === conv.user._id ? { ...c, unreadCount: 0 } : c
      )
    );
  }, [socket]);

  const clearChat = useCallback(async (otherUserId: string) => {
    await messageApi.clearConversation(otherUserId);
    setConversations((prev) => prev.filter((c) => c.user._id !== otherUserId));
  }, []);

  const filtered = conversations.filter((c) => c.user);

  return { conversations: filtered, loading, markAsRead, typingUsers, clearChat };
}
