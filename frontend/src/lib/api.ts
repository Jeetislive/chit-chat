import type { User, Message, Conversation, SendMessageResponse, MessagesResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, data: Record<string, unknown>) {
    super((data?.error as string) || (data?.err as string) || "Something went wrong");
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const authApi = {
  signup: (body: Record<string, string>) => request<User>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { username: string; password: string }) => request<User>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  getProfile: () => request<User>("/auth/profile"),
  updateProfile: (body: Record<string, string>) => request<User>("/auth/profile", { method: "PUT", body: JSON.stringify(body) }),
};

export const userApi = {
  getUsers: () => request<User[]>("/users"),
  getUserProfile: (id: string) => request<User>(`/users/${id}`),
};

export const conversationApi = {
  getConversations: () => request<Conversation[]>("/conversations"),
};

export const messageApi = {
  getConversation: (userId: string, page = 1, limit = 50) =>
    request<MessagesResponse>(`/messages/${userId}?page=${page}&limit=${limit}`),
  sendMessage: (userId: string, message: string, replyTo?: string) =>
    request<SendMessageResponse>(`/messages/send/${userId}`, { method: "POST", body: JSON.stringify({ message, replyTo }) }),
  deleteMessage: (messageId: string) =>
    request<void>(`/messages/${messageId}`, { method: "DELETE" }),
};
