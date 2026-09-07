"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function DoctorDashboard() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .myAppointments(token)
      .then((res) => setAppointments(res.appointments))
      .finally(() => setLoading(false));
  }, [token]);

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;

  return (
    <RequireRole role="doctor">
      <DashboardLayout active="Overview">
        <div className="rounded-[22px] bg-gradient-to-br from-emerald-500 to-emerald-700 px-7 py-7 text-white mb-6">
          <h1 className="text-[26px] font-bold">Welcome, Dr. {user?.name?.split(" ")[0]}!</h1>
          <p className="mt-1 text-[14px] text-white/85">Here's your schedule at a glance.</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl">
            <div className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
              <p className="text-[24px] font-bold text-slate-900">{appointments.length}</p>
              <p className="text-[12.5px] text-slate-400">Total appointments</p>
            </div>
            <div className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
              <p className="text-[24px] font-bold text-amber-500">{pendingCount}</p>
              <p className="text-[12.5px] text-slate-400">Pending</p>
            </div>
            <div className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
              <p className="text-[24px] font-bold text-indigo-600">{confirmedCount}</p>
              <p className="text-[12.5px] text-slate-400">Confirmed</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}