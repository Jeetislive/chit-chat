"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import GuestOnlyRoute from "@/components/auth/GuestOnlyRoute";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestOnlyRoute>
    <div className="animated-bg flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-slideUp">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text">Forgot Password</h1>
            <p className="text-gray-400 mt-1 text-sm">Enter your email to receive a reset code</p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 text-sm mb-6">
                If an account exists with that email, a 6-digit reset code has been sent.
              </div>
              <Link
                href={`/reset-password`}
                className="inline-block w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-indigo-500/25 text-center"
              >
                Enter Reset Code
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm animate-fadeIn" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-indigo-500/25"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </GuestOnlyRoute>
  );
}
