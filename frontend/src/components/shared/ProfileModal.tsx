"use client";

import { useState, useEffect, memo } from "react";
import { userApi, authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Avatar from "./Avatar";
import Skeleton from "./Skeleton";
import type { User } from "@/types";

interface ProfileModalProps {
  userId?: string;
  onClose: () => void;
  isOwn?: boolean;
}

function ProfileModal({ userId, onClose, isOwn }: ProfileModalProps) {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOwn) {
      authApi.getProfile().then((data) => {
        setProfile(data);
        setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", gender: data.gender || "" });
        setLoading(false);
      }).catch(() => setLoading(false));
    } else if (userId) {
      userApi.getUserProfile(userId).then((data) => {
        setProfile(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [userId, isOwn]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authApi.updateProfile(form);
      setProfile(updated);
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass-strong rounded-2xl w-full max-w-md p-6 animate-slideUp shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-xl leading-none">&times;</button>

        {loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-glass-strong animate-pulse mb-4" />
            <Skeleton lines={2} className="w-40 mb-4" />
            <div className="w-full space-y-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-lg p-3 flex justify-between items-center">
                  <Skeleton lines={1} className="w-16" />
                  <Skeleton lines={1} className="w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <Avatar name={profile?.name} src={profile?.profilePic} size={80} className="ring-2 ring-[var(--glass-strong-bg)] mb-3" />
              <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
              <p className="text-sm text-gray-400">@{profile?.username}</p>
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Name</label>
                  <input value={form.name || ""} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full glass-input rounded-lg px-3 py-2 text-white mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                  <input value={form.email || ""} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full glass-input rounded-lg px-3 py-2 text-white mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Phone</label>
                  <input value={form.phone || ""} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full glass-input rounded-lg px-3 py-2 text-white mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Gender</label>
                  <select value={form.gender || ""} onChange={(e) => setForm({...form, gender: e.target.value})} className="w-full glass-input rounded-lg px-3 py-2 text-white mt-1">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg glass glass-hover text-gray-300 transition">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white font-medium transition">
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="glass rounded-lg p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Email</span>
                  <span className="text-white text-sm">{profile?.email || "—"}</span>
                </div>
                <div className="glass rounded-lg p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Phone</span>
                  <span className="text-white text-sm">{profile?.phone || "—"}</span>
                </div>
                <div className="glass rounded-lg p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Gender</span>
                  <span className="text-white text-sm capitalize">{profile?.gender || "—"}</span>
                </div>
                <div className="glass rounded-lg p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Joined</span>
                  <span className="text-white text-sm">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                  </span>
                </div>
                {isOwn && (
                  <button onClick={() => setEditing(true)} className="w-full mt-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium transition">
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default memo(ProfileModal);
