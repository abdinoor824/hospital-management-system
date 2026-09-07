"use client";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <RequireRole role="admin">
      <DashboardLayout active="Overview">
        <div className="rounded-[22px] bg-gradient-to-br from-slate-700 to-slate-900 px-7 py-7 text-white">
          <h1 className="text-[26px] font-bold">Welcome, {user?.name?.split(" ")[0]}!</h1>
          <p className="mt-1 text-[14px] text-white/85">Manage doctors, patients and appointments.</p>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}