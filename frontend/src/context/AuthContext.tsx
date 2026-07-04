"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi, userApi } from "@/lib/api";
import { generateAndStoreKeyPair, getMyPublicKey, clearKeys } from "@/lib/crypto";
import type { User, AuthContextValue } from "@/types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("user");
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const ensurePublicKeySaved = useCallback(async () => {
    const pub = getMyPublicKey();
    if (!pub) {
      generateAndStoreKeyPair();
    }
    const newPub = getMyPublicKey();
    if (newPub) {
      try { await userApi.savePublicKey(newPub); } catch { /* server down */ }
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await authApi.login({ username, password });
    localStorage.setItem("token", data.token!);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data));
    await ensurePublicKeySaved();
    setUser(data);
    return data;
  }, [ensurePublicKeySaved]);

  const signup = useCallback(async (body: Record<string, string>) => {
    const data = await authApi.signup(body);
    localStorage.setItem("token", data.token!);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data));
    await ensurePublicKeySaved();
    setUser(data);
    return data;
  }, [ensurePublicKeySaved]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    clearKeys();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.getProfile();
      const full = { ...user, ...data, fullName: data.name } as User;
      localStorage.setItem("user", JSON.stringify(full));
      setUser(full);
      return full;
    } catch { return user; }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
