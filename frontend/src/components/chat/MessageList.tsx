"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/shared/Avatar";
import StatusIcon from "./StatusIcon";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  otherUserPic?: string;
  otherUserName?: string;
  onReply?: (msg: Message) => void;
  onDelete?: (msg: Message) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

function MessageList({ messages, otherUserPic, otherUserName, onReply, onDelete, onLoadMore, hasMore, loadingMore }: MessageListProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(0);
  const isFirstLoad = useRef(true);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !onLoadMore || !hasMore || loadingMore) return;
    if (containerRef.current.scrollTop < 80) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loadingMore]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      bottomRef.current?.scrollIntoView();
      return;
    }

    const container = containerRef.current;
    const len = messages.length;

    if (len > prevLength.current) {
      const isNewMessage = messages[len - 1]?._id !== (prevLength.current > 0 ? messages[prevLength.current - 1]?._id : null);
      if (isNewMessage && container) {
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (atBottom) {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
      if (len > prevLength.current && prevLength.current > 0 && !isNewMessage) {
        const newMsg = messages[len - 1];
        const oldLast = prevLength.current > 0 ? messages[prevLength.current - 1] : null;
        if (newMsg?._id === oldLast?._id && container) {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    prevLength.current = len;
  }, [messages]);

  const handleReplyClick = (msg: Message) => {
    if (msg.isDeleted) return;
    onReply?.(msg);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2"
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasMore && !loadingMore && messages.length > 0 && (
        <div className="flex justify-center py-1">
          <button
            onClick={onLoadMore}
            className="text-[11px] text-gray-500 hover:text-indigo-400 transition"
          >
            Load older messages
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start a conversation!</p>
        </div>
      ) : (
        messages.map((msg, i) => {
          const isMine = msg.sender === user?._id || (msg.sender as unknown as { _id: string })?._id === user?._id;
          const showAvatar =
            !isMine &&
            (i === 0 || messages[i - 1]?.sender !== msg.sender);
          const replyMsg = msg.replyTo
            ? (typeof msg.replyTo === "object" ? msg.replyTo : null)
            : null;

          return (
            <div
              key={msg._id}
              className={`group flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2 animate-fadeIn`}
              style={{ animationDelay: `${i * 20}ms` }}
            >
              {!isMine && (
                <Avatar
                  name={otherUserName}
                  src={otherUserPic}
                  size={28}
                  className={showAvatar ? "" : "invisible"}
                />
              )}
              <div className="max-w-[70%]">
                <div
                  role={msg.isDeleted ? undefined : "button"}
                  tabIndex={msg.isDeleted ? undefined : 0}
                  onClick={() => handleReplyClick(msg)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !msg.isDeleted) onReply?.(msg); }}
                  className={`rounded-2xl px-4 py-2.5 shadow-lg ${
                    msg.isDeleted ? "" : "cursor-pointer"
                  } ${
                    isMine
                      ? "message-bubble-sent text-white rounded-br-sm"
                      : "message-bubble-received text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {replyMsg && (
                    <div className="mb-1.5 pl-2 border-l-2 border-white/20 text-xs text-gray-400">
                      <p className="font-medium text-indigo-400">Replying</p>
                      <p className="truncate max-w-[200px]">{replyMsg.isDeleted ? "This message was deleted" : replyMsg.content}</p>
                    </div>
                  )}
                  {msg.isDeleted ? (
                    <p className="text-sm italic text-gray-500">This message was deleted</p>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                  {!msg.isDeleted && (
                    <div className={`flex items-center justify-end gap-0.5 mt-1 ${isMine ? "text-white/60" : "text-gray-500"}`}>
                      <p className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</p>
                      {isMine && <StatusIcon status={msg.status} />}
                    </div>
                  )}
                </div>
                {isMine && !msg.isDeleted && onDelete && (
                  <div className="hidden group-hover:flex justify-end mt-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(msg); }}
                      aria-label="Delete message"
                      className="text-[10px] text-gray-500 hover:text-red-400 transition px-2 py-0.5 rounded bg-glass hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default memo(MessageList);
