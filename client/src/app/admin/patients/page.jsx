"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function AdminPatientsPage() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .adminListPatients(token)
      .then((res) => setPatients(res.patients))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

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
                <p className="text-[14.5px] font-semibold text-slate-900">{p.user?.name}</p>
                <p className="text-[12.5px] text-slate-400">{p.user?.email}</p>
                {p.user?.phone && <p className="text-[12.5px] text-slate-400">{p.user.phone}</p>}
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}