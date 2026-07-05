"use client";

import { useState, useCallback, memo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { useConversations } from "@/hooks/useConversations";
import { useTyping } from "@/hooks/useTyping";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ProfileModal from "@/components/shared/ProfileModal";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Avatar from "@/components/shared/Avatar";
import Skeleton from "@/components/shared/Skeleton";
import { decryptMessage, getCachedPublicKey, cachePublicKey, getSentPlaintext } from "@/lib/crypto";
import { userApi } from "@/lib/api";
import type { User, Message } from "@/types";

interface ChatAreaProps {
  selectedUser: User | null;
  onClearChat?: () => void;
}

function ChatArea({ selectedUser, onClearChat }: ChatAreaProps) {
  const { user } = useAuth();
  const { messages, loading, loadingMore, hasMore, loadMore, sendMessage, deleteMessage } = useMessages(selectedUser);
  const { clearChat } = useConversations(selectedUser);
  const { isTyping, emitTyping } = useTyping(selectedUser);
  const [showProfile, setShowProfile] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [clearTarget, setClearTarget] = useState(false);

  const handleSend = useCallback((text: string, replyToId?: string) => {
    sendMessage(text, replyToId);
  }, [sendMessage]);

  const handleReply = useCallback((msg: Message) => {
    let displayMsg = msg;
    if (msg.encrypted && msg.nonce) {
      const stored = getSentPlaintext(msg._id);
      if (stored) {
        displayMsg = { ...msg, content: stored };
      } else if (selectedUser && msg.sender !== user?._id) {
        const pubKey = getCachedPublicKey(selectedUser._id);
        if (pubKey) {
          const decrypted = decryptMessage(msg.content, msg.nonce, pubKey);
          if (decrypted) {
            displayMsg = { ...msg, content: decrypted };
          }
        } else {
          userApi.getPublicKey(selectedUser._id).then(({ publicKey }) => {
            if (publicKey) {
              cachePublicKey(selectedUser._id, publicKey);
              const decrypted = decryptMessage(msg.content, msg.nonce!, publicKey);
              if (decrypted) {
                setReplyTo({ ...msg, content: decrypted });
              }
            }
          });
        }
      }
    }
    setReplyTo(displayMsg);
  }, [selectedUser, user?._id]);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleDelete = useCallback((msg: Message) => {
    setDeleteTarget(msg);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteMessage(deleteTarget._id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMessage]);

  const confirmClear = useCallback(async () => {
    if (!selectedUser) return;
    try {
      await clearChat(selectedUser._id);
      setClearTarget(false);
      onClearChat?.();
    } catch {
      alert("Failed to clear conversation");
    }
  }, [selectedUser, clearChat, onClearChat]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-sm animate-fadeIn">
          <svg className="w-20 h-20 mx-auto mb-4 text-indigo-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-1">No conversation selected</h3>
          <p className="text-gray-500 text-sm">Choose a user from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3 border-b border-glass flex items-center gap-3">
          <button onClick={() => setShowProfile(true)} className="relative shrink-0 cursor-pointer">
            <Avatar
              name={selectedUser.name}
              src={selectedUser.profilePic}
              size={36}
              className="ring-2 ring-[var(--glass-strong-bg)] hover:ring-indigo-400/50 transition-all cursor-pointer"
            />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-white truncate">{selectedUser.name}</p>
            <p className="text-xs text-gray-500 truncate">@{selectedUser.username}</p>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            aria-label="View profile"
            className="text-xs text-gray-500 hover:text-indigo-400 transition px-3 py-1.5 rounded-lg bg-glass hover:bg-glass-hover"
          >
            View Profile
          </button>
          <button
            onClick={() => setClearTarget(true)}
            aria-label="Clear chat"
            className="text-xs text-gray-500 hover:text-red-400 transition px-3 py-1.5 rounded-lg bg-glass hover:bg-red-500/10"
          >
            Clear Chat
          </button>
        </div>

        {loading ? (
          <div className="flex-1 p-5 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[60%] ${i % 2 === 0 ? "bg-indigo-500/20" : "bg-glass"} rounded-2xl ${i % 2 === 0 ? "rounded-br-sm" : "rounded-bl-sm"} px-4 py-3`}>
                  <Skeleton lines={2} className="w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ErrorBoundary>
            <MessageList
              messages={messages}
              otherUserPic={selectedUser.profilePic}
              otherUserName={selectedUser.name}
              onReply={handleReply}
              onDelete={handleDelete}
              onLoadMore={loadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
            />
          </ErrorBoundary>
        )}

        {isTyping && (
          <div className="px-5 py-1.5 text-xs text-indigo-400 animate-fadeIn" aria-live="polite">
            typing...
          </div>
        )}

        <MessageInput
          onSend={handleSend}
          onTyping={emitTyping}
          disabled={false}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
        />
      </div>

      {showProfile && (
        <ProfileModal userId={selectedUser._id} onClose={() => setShowProfile(false)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete message"
          message="Are you sure you want to delete this message?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          destructive
        />
      )}

      {clearTarget && (
        <ConfirmDialog
          title="Clear chat"
          message="This action cannot be undone. All messages will be permanently deleted."
          confirmLabel="Clear"
          cancelLabel="Cancel"
          onConfirm={confirmClear}
          onCancel={() => setClearTarget(false)}
          destructive
        />
      )}
    </>
  );
}

export default memo(ChatArea);
