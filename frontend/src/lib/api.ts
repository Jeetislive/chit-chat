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

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) return false;
    if (data.token) {
      localStorage.setItem("token", data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  const isAuthEndpoint = endpoint === "/auth/login" || endpoint === "/auth/signup";

  if (res.status === 401 && !endpoint.includes("/auth/refresh") && !isAuthEndpoint) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = localStorage.getItem("token");
      headers.Authorization = `Bearer ${newToken}`;
      const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      const retryData = await retryRes.json();
      if (!retryRes.ok) throw new ApiError(retryRes.status, retryData);
      return retryData as T;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

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
  forgotPassword: (email: string) => request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  verifyResetCode: (email: string, code: string) => request<{ message: string }>("/auth/verify-reset-code", { method: "POST", body: JSON.stringify({ email, code }) }),
  resetPassword: (email: string, code: string, newPassword: string) => request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code, newPassword }) }),
};

export const userApi = {
  getUsers: () => request<User[]>("/users"),
  getUserProfile: (id: string) => request<User>(`/users/${id}`),
  savePublicKey: (publicKey: string) => request<{ message: string }>("/users/public-key", { method: "PUT", body: JSON.stringify({ publicKey }) }),
  getPublicKey: (userId: string) => request<{ publicKey: string }>(`/users/public-key/${userId}`),
};

export const conversationApi = {
  getConversations: () => request<Conversation[]>("/conversations"),
};

export const messageApi = {
  getConversation: (userId: string, page = 1, limit = 50) =>
    request<MessagesResponse>(`/messages/${userId}?page=${page}&limit=${limit}`),
  sendMessage: (userId: string, body: { content: string; nonce?: string; encrypted?: boolean; replyTo?: string }) =>
    request<SendMessageResponse>(`/messages/send/${userId}`, { method: "POST", body: JSON.stringify(body) }),
  deleteMessage: (messageId: string) =>
    request<void>(`/messages/${messageId}`, { method: "DELETE" }),
  clearConversation: (userId: string) =>
    request<{ deletedCount: number; hadConversation: boolean }>(`/messages/conversation/${userId}`, { method: "DELETE" }),
};
