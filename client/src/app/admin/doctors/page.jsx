"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", specialization: "", qualifications: "", consultationFee: "" };

function EditDoctorModal({ doctor, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: doctor.user?.name || "",
    phone: doctor.user?.phone || "",
    specialization: doctor.specialization || "",
    qualifications: doctor.qualifications || "",
    consultationFee: doctor.consultationFee || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.adminUpdateDoctor(doctor._id, form, token);
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
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Edit doctor</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            placeholder="Full name"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Phone"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Specialization"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          />
          <input
            placeholder="Qualifications"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.qualifications}
            onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Consultation fee (KES)"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.consultationFee}
            onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
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

export default function AdminDoctorsPage() {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function loadDoctors() {
    setLoading(true);
    api
      .adminListDoctors(token)
      .then((res) => setDoctors(res.doctors))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (token) loadDoctors();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.adminCreateUser({ ...form, role: "doctor" }, token);
      setSuccess(`Doctor account created for ${form.name}.`);
      setForm(EMPTY_FORM);
      loadDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(doctor) {
    if (!confirm(`Delete Dr. ${doctor.user?.name}? This permanently removes their account. Past appointments/records stay in the system.`)) return;
    setBusyId(doctor._id);
    try {
      await api.adminDeleteDoctor(doctor._id, token);
      loadDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(doctor) {
    setBusyId(doctor._id);
    try {
      await api.adminToggleUserActive(doctor.user._id, token);
      loadDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireRole role="admin">
      <DashboardLayout active="Doctors">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <section>
            <h1 className="text-[20px] font-bold text-slate-900 mb-5">All doctors</h1>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : doctors.length === 0 ? (
              <p className="text-slate-400 text-sm">No doctors yet. Add one from the form.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {doctors.map((d) => (
                  <div key={d._id} className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[14.5px] font-semibold text-slate-900">{d.user?.name}</p>
                        <p className="text-[12.5px] text-slate-400">{d.user?.email}</p>
                        <p className="text-[12.5px] text-indigo-600 mt-1">{d.specialization}</p>
                        <p className="text-[12.5px] text-slate-500 mt-1">
                          {d.consultationFee > 0 ? `KES ${d.consultationFee}` : "No fee set"}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                          d.user?.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {d.user?.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      <button
                        onClick={() => setEditingDoctor(d)}
                        className="text-[12px] font-medium bg-slate-100 text-slate-600 rounded-lg px-3 py-1.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(d)}
                        disabled={busyId === d._id}
                        className="text-[12px] font-medium bg-amber-50 text-amber-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                      >
                        {d.user?.isActive ? "Suspend" : "Reactivate"}
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        disabled={busyId === d._id}
                        className="text-[12px] font-medium bg-red-50 text-red-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-slate-900 mb-3">Add a doctor</h2>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            {success && <p className="text-emerald-600 text-sm mb-3">{success}</p>}
            <form onSubmit={handleSubmit} className="bg-white rounded-[22px] border border-slate-100 p-5 flex flex-col gap-3">
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
                placeholder="Temporary password"
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
              <input
                placeholder="Specialization (e.g. Cardiology)"
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                required
              />
              <input
                placeholder="Qualifications (optional)"
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="Consultation fee (KES)"
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create doctor"}
              </button>
            </form>
          </section>
        </div>

        {editingDoctor && (
          <EditDoctorModal
            doctor={editingDoctor}
            token={token}
            onClose={() => setEditingDoctor(null)}
            onSaved={() => {
              setEditingDoctor(null);
              loadDoctors();
            }}
          />
        )}
      </DashboardLayout>
    </RequireRole>
  );
}