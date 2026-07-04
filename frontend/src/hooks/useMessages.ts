"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { messageApi, userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { encryptMessage, decryptMessage, cachePublicKey, getCachedPublicKey } from "@/lib/crypto";
import type { Message, User } from "@/types";

const PAGE_SIZE = 50;

function decryptMsg(msg: Message, senderPubKey: string): Message {
  if (!msg.encrypted || !msg.nonce || !senderPubKey) return msg;
  const decrypted = decryptMessage(msg.content, msg.nonce, senderPubKey);
  if (!decrypted) return { ...msg, content: "🔒 Encrypted message" };

  const result = { ...msg, content: decrypted };

  if (result.replyTo && typeof result.replyTo === "object" && (result.replyTo as Message).encrypted) {
    const reply = result.replyTo as Message;
    const replyDecrypted = decryptMessage(reply.content, reply.nonce!, senderPubKey);
    if (replyDecrypted) {
      result.replyTo = { ...reply, content: replyDecrypted };
    }
  }

  return result;
}

export function useMessages(selectedUser: User | null) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const currentPage = useRef(1);
  const selectedUserId = useRef<string | null>(null);
  const sentPlaintexts = useRef<Map<string, string>>(new Map());

  const ensurePublicKey = useCallback(async (userId: string): Promise<string | null> => {
    const cached = getCachedPublicKey(userId);
    if (cached) return cached;
    try {
      const { publicKey } = await userApi.getPublicKey(userId);
      if (publicKey) {
        cachePublicKey(userId, publicKey);
        return publicKey;
      }
    } catch {}
    return null;
  }, []);

  const decryptMessages = useCallback((msgs: Message[], otherUserId: string): Message[] => {
    const pubKey = getCachedPublicKey(otherUserId);
    if (!pubKey) return msgs;
    return msgs.map((m) => decryptMsg(m, pubKey));
  }, []);

  const fetchMessages = useCallback(async (page: number) => {
    if (!selectedUser) return;
    const isFirst = page === 1;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await messageApi.getConversation(selectedUser._id, page, PAGE_SIZE);
      const decrypted = decryptMessages(data.messages, selectedUser._id);
      if (isFirst) {
        setMessages(decrypted);
        currentPage.current = 1;
      } else {
        setMessages((prev) => [...decrypted, ...prev]);
        currentPage.current = page;
      }
      setHasMore(data.hasMore);
    } catch {
      if (isFirst) setMessages([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedUser, decryptMessages]);

  useEffect(() => {
    if (selectedUser?._id !== selectedUserId.current) {
      selectedUserId.current = selectedUser?._id || null;
      currentPage.current = 1;
      setHasMore(true);
      sentPlaintexts.current.clear();
      if (selectedUser) {
        ensurePublicKey(selectedUser._id);
      }
      fetchMessages(1);
    }
  }, [selectedUser, fetchMessages, ensurePublicKey]);

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

      let displayMsg = msg;

      if (msg.encrypted) {
        const storedPlaintext = sentPlaintexts.current.get(msg._id);
        if (storedPlaintext) {
          displayMsg = { ...msg, content: storedPlaintext };
          sentPlaintexts.current.delete(msg._id);
        } else {
          const pubKey = getCachedPublicKey(selectedUser._id);
          if (pubKey) {
            displayMsg = decryptMsg(msg, pubKey);
          } else {
            ensurePublicKey(selectedUser._id).then((pk) => {
              if (pk) {
                setMessages((prev) =>
                  prev.map((m) => (m._id === msg._id ? decryptMsg(msg, pk) : m))
                );
              }
            });
          }
        }
      }

      setMessages((prev) => {
        if (prev.some((m) => m._id === displayMsg._id)) return prev;
        return [...prev, displayMsg];
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
          m._id === messageId ? { ...m, isDeleted: true, content: "This message was deleted" } : m
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
  }, [socket, selectedUser, user?._id, ensurePublicKey]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || !selectedUser) return;
    fetchMessages(currentPage.current + 1);
  }, [hasMore, loadingMore, selectedUser, fetchMessages]);

  const sendMessage = useCallback(async (text: string, replyTo?: string) => {
    if (!selectedUser) return;
    try {
      const pubKey = getCachedPublicKey(selectedUser._id) || await ensurePublicKey(selectedUser._id);

      if (pubKey) {
        const encrypted = encryptMessage(text, pubKey);
        if (!encrypted) {
          alert("Encryption failed");
          return;
        }
        const data = await messageApi.sendMessage(selectedUser._id, {
          content: encrypted.content,
          nonce: encrypted.nonce,
          encrypted: true,
          replyTo,
        });
        sentPlaintexts.current.set(data.newMessage._id, text);
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.newMessage._id)) return prev;
          return [...prev, { ...data.newMessage, content: text }];
        });
      } else {
        const data = await messageApi.sendMessage(selectedUser._id, {
          content: text,
          encrypted: false,
          replyTo,
        });
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.newMessage._id)) return prev;
          return [...prev, data.newMessage];
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send";
      alert(message);
    }
  }, [selectedUser, ensurePublicKey]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageApi.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: "This message was deleted" } : m
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      alert(message);
    }
  }, []);

  return { messages, loading, loadingMore, hasMore, loadMore, sendMessage, deleteMessage };
}
