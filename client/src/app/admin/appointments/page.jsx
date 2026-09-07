"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-indigo-50 text-indigo-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-red-50 text-red-600",
};

const PAYMENT_STYLES = {
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  none: "bg-slate-100 text-slate-500",
};

export default function AdminAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    api
      .adminListAppointments(token)
      .then(async (res) => {
        setAppointments(res.appointments);
        const entries = await Promise.all(
          res.appointments.map(async (appt) => {
            const p = await api.paymentForAppointment(appt._id, token).catch(() => ({ payment: null }));
            return [appt._id, p.payment];
          })
        );
        setPayments(Object.fromEntries(entries));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function paymentLabel(apptId) {
    const p = payments[apptId];
    if (!p) return { text: "No payment yet", style: PAYMENT_STYLES.none };
    if (p.status === "paid") return { text: `Paid (${p.method})`, style: PAYMENT_STYLES.paid };
    return { text: "Payment pending", style: PAYMENT_STYLES.pending };
  }

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <RequireRole role="admin">
      <DashboardLayout active="Appointments">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-[20px] font-bold text-slate-900">All appointments</h1>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-[12.5px] font-medium px-3 py-1.5 rounded-full capitalize ${
                  filter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm">No appointments found.</p>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {filtered.map((appt) => {
              const pay = paymentLabel(appt._id);
              return (
                <div
                  key={appt._id}
                  className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-100 bg-white px-5 py-4"
                >
                  <div>
                    <p className="text-[14.5px] font-semibold text-slate-900">
                      {appt.patient?.user?.name || "Unknown"} → Dr. {appt.doctor?.user?.name || "Unknown"}
                    </p>
                    <p className="text-[12.5px] text-slate-400">
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>
                    {appt.reason && <p className="text-[12.5px] text-slate-500 mt-1">{appt.reason}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    <span className={`text-[11.5px] font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[appt.status]}`}>
                      {appt.status}
                    </span>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${pay.style}`}>
                      {pay.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}