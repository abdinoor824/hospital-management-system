"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("hms_token");
    if (stored) {
      setToken(stored);
      api.me(stored).then((res) => setUser(res.user)).catch(() => {
        localStorage.removeItem("hms_token");
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function persist(res) {
    localStorage.setItem("hms_token", res.token);
    setToken(res.token);
    setUser(res.user);
  }

  async function login(email, password) {
    const res = await api.login({ email, password });
    persist(res);
    return res.user;
  }

  async function register(payload) {
    const res = await api.register(payload);
    persist(res);
    return res.user;
  }

  async function loginWithGoogle(credential) {
    const res = await api.googleLogin(credential);
    persist(res);
    return res.user;
  }

  function logout() {
    localStorage.removeItem("hms_token");
    setToken(null);
    setUser(null);
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}