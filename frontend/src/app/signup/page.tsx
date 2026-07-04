"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface SignupForm {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
}

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({
    name: "", username: "", email: "", password: "",
    confirmPassword: "", phone: "", gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await signup(payload);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-bg flex min-h-screen items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-slideUp">
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 5 5 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
            <p className="text-gray-400 mt-1 text-sm">Join the chat community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm animate-fadeIn" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
                <input id="name" type="text" name="name" value={form.name} onChange={handleChange} required
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              </div>
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
                <input id="username" type="text" name="username" value={form.username} onChange={handleChange} required
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6}
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Confirm</label>
                <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
                <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange} required
                  className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Gender</label>
                <select id="gender" name="gender" value={form.gender} onChange={handleChange} required
                  className="w-full glass-input rounded-xl px-4 py-3 text-white">
                  <option value="" className="bg-gray-900">Select</option>
                  <option value="male" className="bg-gray-900">Male</option>
                  <option value="female" className="bg-gray-900">Female</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
