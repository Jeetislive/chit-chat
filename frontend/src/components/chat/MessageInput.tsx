"use client";

import { useState, useRef, memo } from "react";
import EmojiPicker from "./EmojiPicker";
import type { Message } from "@/types";

interface MessageInputProps {
  onSend: (text: string, replyTo?: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

function MessageInput({ onSend, onTyping, disabled = false, replyTo, onCancelReply }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim(), replyTo?._id);
    setText("");
    setShowEmoji(false);
    if (onCancelReply) onCancelReply();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (onTyping && e.target.value.trim()) {
      onTyping();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  return (
    <div>
      {replyTo && (
        <div className="px-4 py-2 border-t border-glass flex items-center gap-3 bg-glass-hover">
          <div className="w-0.5 h-8 bg-indigo-400 shrink-0 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-indigo-400 font-medium">Replying</p>
            <p className="text-xs text-gray-400 truncate">
              {replyTo.content === "🔒 Encrypted message" ? "Message not available" : replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="text-gray-500 hover:text-white transition text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmoji((prev) => !prev)}
              aria-label="Toggle emoji picker"
              className="text-gray-500 hover:text-indigo-400 transition shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={text}
                onChange={handleChange}
                placeholder={replyTo ? "Write a reply..." : "Type a message..."}
                disabled={disabled}
                aria-label="Message input"
                className="w-full glass-input rounded-xl pl-4 pr-4 py-3 text-white placeholder-gray-500 disabled:opacity-50 transition-all"
              />
              {showEmoji && (
                <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={disabled || !text.trim()}
            aria-label="Send message"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 font-medium transition-all shadow-lg disabled:shadow-none flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default memo(MessageInput);
