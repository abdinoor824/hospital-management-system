"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== role) {
      router.replace(`/${user.role}`);
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <div className="min-h-screen grid place-items-center text-slate-400 text-sm">Loading...</div>;
  }

  return children;
}