"use client";

import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ROLE_REDIRECT = { admin: "/admin", doctor: "/doctor", patient: "/" };

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(ROLE_REDIRECT[user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#1e1b4b,_#0a0a12)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12121c]/80 backdrop-blur-xl p-8 shadow-2xl">
        <h1 className="text-[26px] font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Sign In to Your Account
        </h1>
        <p className="mt-2 text-[13.5px] text-slate-400 leading-relaxed">
          Welcome back to your hospital management dashboard.
        </p>

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        {/* <button
          type="button"
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-[14px] font-medium text-slate-200 hover:bg-white/10 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.96H.96A8.997 8.997 0 000 9c0 1.45.35 2.83.96 4.04l3.01-2.34z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Sign in with Google
        </button> */}
                <div className="mt-6">
          <GoogleSignInButton />
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[12px] text-slate-500">Or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-300 mb-1.5 block">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-slate-300">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-[14px] text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            <a href="#" className="mt-2 inline-block text-[12.5px] text-slate-400 hover:text-slate-300">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 py-3 text-[14.5px] font-semibold text-white shadow-lg shadow-indigo-900/40 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-slate-400 text-center">
          No account? <a href="/register" className="text-indigo-400 font-medium hover:text-indigo-300">Register</a>
        </p>
      </div>
    </div>
  );
}