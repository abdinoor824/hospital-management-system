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

function MpesaModal({ appointment, token, onClose, onPaid }) {
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("form");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStage("waiting");
    try {
      const amount = appointment.doctor?.consultationFee || 1000;
      const res = await api.initiateMpesa({ appointmentId: appointment._id, phone, amount }, token);

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const statusRes = await api.mpesaStatus(res.checkoutRequestId, token);
          if (statusRes.status === "paid") {
            clearInterval(interval);
            onPaid();
          } else if (statusRes.status === "failed") {
            clearInterval(interval);
            setStage("error");
            setError("Payment was cancelled or failed on your phone.");
          } else if (attempts >= 20) {
            clearInterval(interval);
            setStage("error");
            setError("Timed out waiting for payment. Check your phone or try again.");
          }
        } catch {
          // ignore transient errors, keep polling
        }
      }, 3000);
    } catch (err) {
      setStage("error");
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="bg-white rounded-[22px] max-w-sm w-full p-6">
        <h2 className="text-[17px] font-bold text-slate-900 mb-1">Pay with M-Pesa</h2>
        <p className="text-[13px] text-slate-400 mb-4">
          Enter your M-Pesa phone number. You'll get a prompt on your phone to complete payment.
        </p>

        {stage === "form" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="tel"
              placeholder="e.g. 0712345678"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 text-[13px] font-medium bg-slate-100 text-slate-600 rounded-lg py-2.5">
                Cancel
              </button>
              <button type="submit" className="flex-1 text-[13px] font-semibold bg-emerald-600 text-white rounded-lg py-2.5">
                Send prompt
              </button>
            </div>
          </form>
        )}

        {stage === "waiting" && (
          <div className="text-center py-4">
            <p className="text-[13.5px] text-slate-600 mb-2">Check your phone for the M-Pesa prompt...</p>
            <p className="text-[12px] text-slate-400">Waiting for confirmation (this can take up to a minute)</p>
          </div>
        )}

        {stage === "error" && (
          <div>
            <p className="text-red-600 text-[13px] mb-4">{error}</p>
            <button onClick={onClose} className="w-full text-[13px] font-medium bg-slate-100 text-slate-600 rounded-lg py-2.5">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RescheduleModal({ appointment, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: appointment.date ? appointment.date.slice(0, 10) : "",
    time: appointment.time || "",
    reason: appointment.reason || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.rescheduleMyAppointment(appointment._id, form, token);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="bg-white rounded-[22px] max-w-sm w-full p-6">
        <h2 className="text-[17px] font-bold text-slate-900 mb-1">Reschedule appointment</h2>
        <p className="text-[13px] text-slate-400 mb-4">
          With Dr. {appointment.doctor?.user?.name || "Unknown"}
        </p>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 text-[13px] font-medium bg-slate-100 text-slate-600 rounded-lg py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 text-[13px] font-semibold bg-indigo-600 text-white rounded-lg py-2.5 disabled:opacity-60">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [mpesaAppointment, setMpesaAppointment] = useState(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function loadData() {
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
    if (token) loadData();
  }, [token]);

  function paymentInfo(apptId) {
    const p = payments[apptId];
    if (!p) return { text: "No payment yet", style: PAYMENT_STYLES.none, isPaid: false };
    if (p.status === "paid") return { text: `Paid (${p.method})`, style: PAYMENT_STYLES.paid, isPaid: true };
    return { text: "Payment pending", style: PAYMENT_STYLES.pending, isPaid: false };
  }

  async function handlePayWithCard(appt) {
    setError("");
    setPayingId(appt._id);
    try {
      const amount = appt.doctor?.consultationFee || 1000;
      const res = await api.createStripeCheckout({ appointmentId: appt._id, amount }, token);
      window.location.href = res.url;
    } catch (err) {
      setError(err.message);
      setPayingId(null);
    }
  }

  async function handleCancel(appt) {
    if (!confirm("Cancel this appointment?")) return;
    setBusyId(appt._id);
    try {
      await api.cancelMyAppointment(appt._id, token);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireRole role="patient">
      <DashboardLayout active="My Appointments">
        <h1 className="text-[20px] font-bold text-slate-900 mb-5">My appointments</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-slate-400 text-sm">No appointments yet. Book one from the sidebar.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => {
              const pay = paymentInfo(appt._id);
              const isPending = appt.status === "pending";
              return (
                <div
                  key={appt._id}
                  className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-100 bg-white px-5 py-4 flex-wrap"
                >
                  <div>
                    <p className="text-[14.5px] font-semibold text-slate-900">
                      Dr. {appt.doctor?.user?.name || "Unknown"}
                    </p>
                    <p className="text-[12.5px] text-slate-400">
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>
                    {appt.reason && <p className="text-[12.5px] text-slate-500 mt-1">{appt.reason}</p>}
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <span className={`text-[11.5px] font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[appt.status]}`}>
                      {appt.status}
                    </span>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${pay.style}`}>
                      {pay.text}
                    </span>

                    {isPending && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setReschedulingAppointment(appt)}
                          disabled={busyId === appt._id}
                          className="text-[12px] font-semibold bg-slate-100 text-slate-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(appt)}
                          disabled={busyId === appt._id}
                          className="text-[12px] font-semibold bg-red-50 text-red-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {!pay.isPaid && appt.status !== "cancelled" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handlePayWithCard(appt)}
                          disabled={payingId === appt._id}
                          className="text-[12px] font-semibold bg-indigo-600 text-white rounded-lg px-3 py-1.5 disabled:opacity-60"
                        >
                          {payingId === appt._id ? "Redirecting..." : "Pay with card"}
                        </button>
                        <button
                          onClick={() => setMpesaAppointment(appt)}
                          className="text-[12px] font-semibold bg-emerald-600 text-white rounded-lg px-3 py-1.5"
                        >
                          Pay with M-Pesa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mpesaAppointment && (
          <MpesaModal
            appointment={mpesaAppointment}
            token={token}
            onClose={() => setMpesaAppointment(null)}
            onPaid={() => {
              setMpesaAppointment(null);
              loadData();
            }}
          />
        )}

        {reschedulingAppointment && (
          <RescheduleModal
            appointment={reschedulingAppointment}
            token={token}
            onClose={() => setReschedulingAppointment(null)}
            onSaved={() => {
              setReschedulingAppointment(null);
              loadData();
            }}
          />
        )}
      </DashboardLayout>
    </RequireRole>
  );
}