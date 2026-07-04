"use client";

import { useState, memo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useConversations } from "@/hooks/useConversations";
import ProfileModal from "@/components/shared/ProfileModal";
import Avatar from "@/components/shared/Avatar";
import { CardSkeleton } from "@/components/shared/Skeleton";
import type { User, Conversation } from "@/types";

interface SidebarProps {
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

function Sidebar({ selectedUser, onSelectUser }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { conversations, loading, markAsRead, typingUsers } = useConversations(selectedUser);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const handleSelect = (conv: Conversation) => {
    markAsRead(conv);
    onSelectUser(conv.user);
  };

  const filtered = conversations.filter(
    (c) =>
      c.user.name.toLowerCase().includes(search.toLowerCase()) ||
      c.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <aside className="w-80 flex flex-col flex-shrink-0 border-r border-glass">
        <div className="p-4 border-b border-glass">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setShowProfile(true)} className="relative shrink-0">
              <Avatar
                name={user?.fullName || user?.username}
                src={user?.profilePic}
                size={36}
                className="ring-2 ring-[var(--glass-strong-bg)] hover:ring-indigo-400/50 transition-all"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--online-dot-border)]" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">{user?.fullName || user?.username}</p>
              <p className="text-[11px] text-gray-500 truncate">@{user?.username}</p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="cursor-pointer text-gray-500 hover:text-indigo-400 transition shrink-0"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={logout}
              aria-label="Logout"
              className="cursor-pointer text-[11px] text-gray-500 hover:text-red-400 transition px-2.5 py-1.5 rounded-lg bg-glass hover:bg-glass-hover"
            >
              Logout
            </button>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              aria-label="Search users"
              className="w-full bg-glass border border-glass rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:bg-glass-hover transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              {search ? "No users match your search" : "No conversations yet"}
            </div>
          ) : (
            filtered.map((conv) => (
              <ConversationCard
                key={conv.user._id}
                conv={conv}
                isSelected={selectedUser?._id === conv.user._id}
                isTyping={typingUsers.includes(conv.user._id)}
                onSelect={() => handleSelect(conv)}
              />
            ))
          )}
        </div>
      </aside>

      {showProfile && <ProfileModal isOwn onClose={() => setShowProfile(false)} />}
    </>
  );
}

interface ConversationCardProps {
  conv: Conversation;
  isSelected: boolean;
  isTyping: boolean;
  onSelect: () => void;
}

const ConversationCard = memo(function ConversationCard({ conv, isSelected, isTyping, onSelect }: ConversationCardProps) {
  const isOnline = useOnlineStatus(conv.user._id);

  return (
    <button
      onClick={onSelect}
      aria-label={`Chat with ${conv.user.name}`}
      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
        isSelected ? "bg-glass-selected shadow-sm" : "hover:bg-glass-hover"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar name={conv.user.name} src={conv.user.profilePic} size={36} />
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--online-dot-border)]" />
        )}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-white truncate">{conv.user.name}</p>
          {conv.lastMessage && (
            <p className="text-[10px] text-gray-500 shrink-0">
              {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-xs truncate ${isTyping ? "text-indigo-400" : "text-gray-500"}`}>
            {isTyping ? "typing..." : conv.lastMessage ? conv.lastMessage.content : "No messages yet"}
          </p>
          {conv.unreadCount > 0 && (
            <span className="shrink-0 bg-[var(--badge-bg)] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

export default memo(Sidebar);
