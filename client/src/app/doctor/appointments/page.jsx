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

function RecordForm({ appointment, token, onDone }) {
  const [form, setForm] = useState({ diagnosis: "", prescription: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.createRecord({ appointmentId: appointment._id, ...form }, token);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <textarea
        placeholder="Diagnosis"
        rows={2}
        className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] resize-none"
        value={form.diagnosis}
        onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
      />
      <textarea
        placeholder="Prescription"
        rows={2}
        className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] resize-none"
        value={form.prescription}
        onChange={(e) => setForm({ ...form, prescription: e.target.value })}
      />
      <textarea
        placeholder="Notes"
        rows={2}
        className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] resize-none"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-emerald-600 text-white rounded-lg py-2 text-[13px] font-semibold disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save record & mark completed"}
      </button>
    </form>
  );
}

export default function DoctorAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [writingFor, setWritingFor] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function loadAppointments() {
    setLoading(true);
    api
      .myAppointments(token)
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
  }

  useEffect(() => {
    if (token) loadAppointments();
  }, [token]);

  function isPaid(apptId) {
    return payments[apptId]?.status === "paid";
  }

  async function handleStatusChange(id, status) {
    setError("");
    setBusyId(id);
    try {
      await api.updateAppointmentStatus(id, status, token);
      loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireRole role="doctor">
      <DashboardLayout active="My Appointments">
        <h1 className="text-[20px] font-bold text-slate-900 mb-5">My appointments</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-slate-400 text-sm">No appointments assigned yet.</p>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {appointments.map((appt) => {
              const paid = isPaid(appt._id);
              return (
                <div key={appt._id} className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[14.5px] font-semibold text-slate-900">
                        {appt.patient?.user?.name || "Unknown patient"}
                      </p>
                      <p className="text-[12.5px] text-slate-400">
                        {new Date(appt.date).toLocaleDateString()} at {appt.time}
                      </p>
                      {appt.reason && <p className="text-[12.5px] text-slate-500 mt-1">{appt.reason}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[11.5px] font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[appt.status]}`}>
                        {appt.status}
                      </span>
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${paid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {paid ? "Paid" : "Awaiting payment"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 flex-wrap items-center">
                    {appt.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appt._id, "confirmed")}
                          disabled={!paid || busyId === appt._id}
                          title={!paid ? "Patient must pay before you can confirm" : ""}
                          className="text-[12.5px] font-medium bg-indigo-50 text-indigo-600 rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt._id, "cancelled")}
                          disabled={busyId === appt._id}
                          className="text-[12.5px] font-medium bg-red-50 text-red-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        {!paid && (
                          <span className="text-[11.5px] text-amber-600">Waiting for patient payment</span>
                        )}
                      </>
                    )}
                    {appt.status === "confirmed" && (
                      <button
                        onClick={() => setWritingFor(writingFor === appt._id ? null : appt._id)}
                        className="text-[12.5px] font-medium bg-emerald-50 text-emerald-600 rounded-lg px-3 py-1.5"
                      >
                        {writingFor === appt._id ? "Cancel" : "Write record & complete"}
                      </button>
                    )}
                  </div>

                  {writingFor === appt._id && (
                    <RecordForm
                      appointment={appt}
                      token={token}
                      onDone={() => {
                        setWritingFor(null);
                        loadAppointments();
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}