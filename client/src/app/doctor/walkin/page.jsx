"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const EMPTY_FORM = {
  name: "", email: "", password: "", phone: "",
  date: "", time: "", reason: "", amount: "",
};

export default function DoctorWalkinPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await api.createWalkin(form, token);
      setSuccess(`Registered ${res.patient.name} and booked their appointment${res.payment ? ` — KES ${res.payment.amount} paid in cash.` : "."} Redirecting...`);
      setForm(EMPTY_FORM);
setTimeout(() => { window.location.href = "/doctor"; }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireRole role="doctor">
      <DashboardLayout active="Walk-in Patient">
        <div className="max-w-lg">
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">Register a walk-in patient</h1>
          <p className="text-[13px] text-slate-400 mb-5">
            For patients seen in person without an existing account. This creates their account, books the visit, and records cash payment in one step.
          </p>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {success && <p className="text-emerald-600 text-sm mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="bg-white rounded-[22px] border border-slate-100 p-6 flex flex-col gap-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mt-1">Patient details</p>
            <input
              placeholder="Full name"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Temporary password (patient can change it later)"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <input
              placeholder="Phone"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mt-3">Visit details</p>
            <input
              type="date"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <input
              type="time"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
            <textarea
              placeholder="Reason for visit"
              rows={2}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />

            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mt-3">Payment (cash)</p>
            <input
              type="number"
              min="0"
              placeholder="Amount collected (KES)"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-semibold mt-2 disabled:opacity-60"
            >
              {submitting ? "Registering..." : "Register & book"}
            </button>
          </form>
        </div>
      </DashboardLayout>
    </RequireRole>
  );
}