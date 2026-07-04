"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import type { User } from "@/types";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="animated-bg flex h-screen">
        <ErrorBoundary>
          <Sidebar selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        </ErrorBoundary>
        <ErrorBoundary>
          <ChatArea key={selectedUser?._id || "none"} selectedUser={selectedUser} />
        </ErrorBoundary>
      </div>
    </ProtectedRoute>
  );
}
