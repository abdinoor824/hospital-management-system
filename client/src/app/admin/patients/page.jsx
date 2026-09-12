"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

function EditPatientModal({ patient, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: patient.user?.name || "",
    phone: patient.user?.phone || "",
    dob: patient.dob ? patient.dob.slice(0, 10) : "",
    gender: patient.gender || "",
    bloodGroup: patient.bloodGroup || "",
    address: patient.address || "",
    emergencyContact: patient.emergencyContact || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.adminUpdatePatient(patient._id, form, token);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-[22px] max-w-sm w-full p-6">
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Edit patient</h2>
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
            type="date"
            placeholder="Date of birth"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            placeholder="Blood group"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.bloodGroup}
            onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
          />
          <input
            placeholder="Address"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            placeholder="Emergency contact"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            value={form.emergencyContact}
            onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
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

export default function AdminPatientsPage() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function loadPatients() {
    setLoading(true);
    api
      .adminListPatients(token)
      .then((res) => setPatients(res.patients))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (token) loadPatients();
  }, [token]);

  async function handleDelete(patient) {
    if (!confirm(`Delete ${patient.user?.name}? This permanently removes their account. Past appointments/records stay in the system.`)) return;
    setBusyId(patient._id);
    try {
      await api.adminDeletePatient(patient._id, token);
      loadPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(patient) {
    setBusyId(patient._id);
    try {
      await api.adminToggleUserActive(patient.user._id, token);
      loadPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireRole role="admin">
      <DashboardLayout active="Patients">
        <h1 className="text-[20px] font-bold text-slate-900 mb-5">All patients</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : patients.length === 0 ? (
          <p className="text-slate-400 text-sm">No patients yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map((p) => (
              <div key={p._id} className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14.5px] font-semibold text-slate-900">{p.user?.name}</p>
                    <p className="text-[12.5px] text-slate-400">{p.user?.email}</p>
                    {p.user?.phone && <p className="text-[12.5px] text-slate-400">{p.user.phone}</p>}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      p.user?.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {p.user?.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  <button
                    onClick={() => setEditingPatient(p)}
                    className="text-[12px] font-medium bg-slate-100 text-slate-600 rounded-lg px-3 py-1.5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(p)}
                    disabled={busyId === p._id}
                    className="text-[12px] font-medium bg-amber-50 text-amber-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                  >
                    {p.user?.isActive ? "Suspend" : "Reactivate"}
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p._id}
                    className="text-[12px] font-medium bg-red-50 text-red-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingPatient && (
          <EditPatientModal
            patient={editingPatient}
            token={token}
            onClose={() => setEditingPatient(null)}
            onSaved={() => {
              setEditingPatient(null);
              loadPatients();
            }}
          />
        )}
      </DashboardLayout>
    </RequireRole>
  );
}