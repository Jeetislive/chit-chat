export interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  gender?: string;
  profilePic?: string;
  fullName?: string;
  token?: string;
  refreshToken?: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
  replyTo?: Message | string | null;
  isDeleted?: boolean;
}

export interface ConversationUser {
  _id: string;
  name: string;
  username: string;
  profilePic?: string;
}

export interface LastMessage {
  message: string;
  createdAt: string;
}

export interface Conversation {
  user: ConversationUser;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  signup: (body: Record<string, string>) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

export interface SocketContextValue {
  socket: import("socket.io-client").Socket | null;
  onlineUsers: string[];
  typingUsers: string[];
}

export interface SendMessageResponse {
  newMessage: Message;
}

export interface MessagesResponse {
  messages: Message[];
  page: number;
  hasMore: boolean;
  total: number;
}
