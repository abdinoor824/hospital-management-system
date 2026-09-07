"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

function BookAppointmentForm() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDoctorId = searchParams.get("doctorId") || "";

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: preselectedDoctorId, date: "", time: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .listDoctors(token)
      .then((res) => setDoctors(res.doctors))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.bookAppointment(form, token);
      setSuccess("Appointment booked successfully. Redirecting...");
      setForm({ doctorId: "", date: "", time: "", reason: "" });
      setTimeout(() => { window.location.href = "/patient/appointments"; }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-[20px] font-bold text-slate-900 mb-5">Book an appointment</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-emerald-600 text-sm mb-4">{success}</p>}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading doctors...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-[22px] border border-slate-100 p-6 flex flex-col gap-3">
          <select
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.user?.name} — {d.specialization}
              </option>
            ))}
          </select>

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
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none"
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Booking..." : "Book appointment"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <RequireRole role="patient">
      <DashboardLayout active="Book Appointment">
        <Suspense fallback={<p className="text-slate-400 text-sm">Loading...</p>}>
          <BookAppointmentForm />
        </Suspense>
      </DashboardLayout>
    </RequireRole>
  );
}