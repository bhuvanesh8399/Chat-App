// src/pages/Login.jsx (or src/components/Login.jsx)
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "../services/api.js";
import { useAuth } from "../lib/AuthContext"; // if provider not used, fallback path still works

export default function Login({ onLogin, redirectTo = "/chat" }) {
  const nav = useNavigate();
  const auth = (() => {
    try {
      return useAuth?.(); // may be undefined if not wrapped in provider
    } catch {
      return null;
    }
  })();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ username: "user@demo.com", password: "password", showPw: false });

  const notify = (type, msg) => {
    if (toast?.[type]) toast[type](msg);
    else setErr(msg); // graceful fallback if toast not mounted
  };

  const handleChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.username || !form.password) {
      return notify("error", "Fill all fields");
    }
    setLoading(true);
    try {
      if (auth?.login) {
        // Context mode (expects { username, password })
        await auth.login({ username: form.username, password: form.password });
        notify("success", "Signed in");
        nav(redirectTo, { replace: true });
      } else {
        // API mode (expects email/password -> returns { token, user })
        const { token, user } = await api.login(form.username, form.password);
        notify("success", "Signed in");
        onLogin?.(user, token);
        nav(redirectTo, { replace: true });
      }
    } catch (e2) {
      const msg = e2?.response?.data?.message ?? "Login failed";
      notify("error", msg);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-white">
      {/* Left: illustration (hidden on small) */}
      <div className="hidden lg:block p-10">
        <div className="h-full w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 grid place-items-center shadow-[0_0_60px_rgba(0,0,0,0.25)]">
          <img
            src="/auth-illustration.svg"
            className="max-w-[70%]"
            alt="illustration"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.2)]"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-white/70 text-sm">
              {auth?.login ? "Sign in to continue" : "Demo mode: uses direct API login"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="text-sm opacity-80">Email / Username</label>
              <input
                className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 border border-white/20 outline-none focus:border-indigo-400/60"
                value={form.username}
                onChange={handleChange("username")}
                autoFocus
                placeholder="user@demo.com"
              />
            </div>

            <div>
              <label className="text-sm opacity-80">Password</label>
              <div className="relative">
                <input
                  type={form.showPw ? "text" : "password"}
                  className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 border border-white/20 outline-none pr-10 focus:border-indigo-400/60"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, showPw: !p.showPw }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label={form.showPw ? "Hide password" : "Show password"}
                  title={form.showPw ? "Hide password" : "Show password"}
                >
                  {form.showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {err && <div className="text-red-400 text-sm">{err}</div>}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2 font-medium hover:opacity-95 transition disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-sm text-center">
            New here? <Link to="/signup" className="text-indigo-300 underline">Create an account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
