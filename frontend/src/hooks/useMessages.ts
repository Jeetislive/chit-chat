"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { messageApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import type { Message, User } from "@/types";

const PAGE_SIZE = 50;

export function useMessages(selectedUser: User | null) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPage = useRef(1);
  const selectedUserId = useRef<string | null>(null);

  const fetchMessages = useCallback(async (page: number) => {
    if (!selectedUser) return;
    const isFirst = page === 1;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await messageApi.getConversation(selectedUser._id, page, PAGE_SIZE);
      if (isFirst) {
        setMessages(data.messages);
        currentPage.current = 1;
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
        currentPage.current = page;
      }
      setHasMore(data.hasMore);
    } catch {
      if (isFirst) setMessages([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser?._id !== selectedUserId.current) {
      selectedUserId.current = selectedUser?._id || null;
      currentPage.current = 1;
      setHasMore(true);
      fetchMessages(1);
    }
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    if (selectedUser && socket) {
      socket.emit("markRead", { otherUserId: selectedUser._id });
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = (msg: Message) => {
      if (!user) return;
      const isForCurrentChat =
        (msg.sender === user._id && msg.receiver === selectedUser._id) ||
        (msg.sender === selectedUser._id && msg.receiver === user._id);
      if (!isForCurrentChat) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      if (msg.sender === selectedUser._id) {
        socket.emit("markRead", { otherUserId: selectedUser._id });
      }
    };

    const handleMessagesRead = ({ readBy }: { readBy: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.receiver === readBy ? { ...m, status: "read" as const } : m
        )
      );
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, message: "This message was deleted" } : m
        )
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, selectedUser, user?._id]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || !selectedUser) return;
    fetchMessages(currentPage.current + 1);
  }, [hasMore, loadingMore, selectedUser, fetchMessages]);

  const sendMessage = useCallback(async (text: string, replyTo?: string) => {
    if (!selectedUser) return;
    try {
      const data = await messageApi.sendMessage(selectedUser._id, text, replyTo);
      setMessages((prev) => {
        if (prev.some((m) => m._id === data.newMessage._id)) return prev;
        return [...prev, data.newMessage];
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send";
      alert(message);
    }
  }, [selectedUser]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageApi.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, message: "This message was deleted" } : m
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      alert(message);
    }
  }, []);

  return { messages, loading, loadingMore, hasMore, loadMore, sendMessage, deleteMessage };
}
