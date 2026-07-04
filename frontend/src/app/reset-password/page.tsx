"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import GuestOnlyRoute from "@/components/auth/GuestOnlyRoute";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"code" | "password" | "done">("code");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !code) { setError("Please fill all fields"); return; }
    setLoading(true);
    try {
      await authApi.verifyResetCode(email, code);
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <GuestOnlyRoute>
      <div className="animated-bg flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-green-500/20 blur-[100px]" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px]" />
        </div>
        <div className="relative w-full max-w-md animate-slideUp">
          <div className="glass-strong rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">Password Reset!</h1>
            <p className="text-gray-400 mb-6">Your password has been reset successfully.</p>
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-indigo-500/25"
            >
              Sign In
            </Link>
      </div>
    </div>
    </div>
    </GuestOnlyRoute>
  );
  }

  return (
    <GuestOnlyRoute>
    <div className="animated-bg flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-slideUp">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text">
              {step === "code" ? "Reset Password" : "New Password"}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {step === "code" ? "Enter the code sent to your email" : "Choose a new password"}
            </p>
          </div>

          {step === "code" ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm animate-fadeIn" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Email
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

              <div>
                <label htmlFor="code" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Reset Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all tracking-[8px] text-center text-xl font-bold"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-indigo-500/25"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm animate-fadeIn" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 transition-all"
                  placeholder="Re-enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-indigo-500/25"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Back to Sign In
            </Link>
          </p>
      </div>
    </div>
    </div>
    </GuestOnlyRoute>
  );
}
