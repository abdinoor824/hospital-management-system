"use client";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

export default function PatientDashboard() {
  const { user } = useAuth();
  return (
    <RequireRole role="patient">
      <DashboardLayout active="Overview">
        <div className="rounded-[22px] bg-gradient-to-br from-indigo-500 to-indigo-700 px-7 py-7 text-white">
          <h1 className="text-[26px] font-bold">Welcome, {user?.name?.split(" ")[0]}!</h1>
          <p className="mt-1 text-[14px] text-white/85">Here's your health dashboard.</p>
          <a
            href="/patient/book"
            className="inline-block mt-5 bg-white text-indigo-700 rounded-lg px-5 py-2.5 text-[13.5px] font-semibold"
          >
            Book Appointment
          </a>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}