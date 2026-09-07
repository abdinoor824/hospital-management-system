"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function DoctorRecordsPage() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .recordsByDoctor(token)
      .then((res) => setRecords(res.records))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <RequireRole role="doctor">
      <DashboardLayout active="Patient Records">
        <h1 className="text-[20px] font-bold text-slate-900 mb-5">Records you've written</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-slate-400 text-sm">No records yet. Write one from a confirmed appointment.</p>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {records.map((r) => (
              <div key={r._id} className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
                <p className="text-[14.5px] font-semibold text-slate-900">
                  {r.patient?.user?.name || "Unknown patient"}
                </p>
                <p className="text-[12.5px] text-slate-400 mb-2">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {r.diagnosis && <p className="text-[13px] text-slate-700"><span className="font-medium">Diagnosis:</span> {r.diagnosis}</p>}
                {r.prescription && <p className="text-[13px] text-slate-700 mt-1"><span className="font-medium">Prescription:</span> {r.prescription}</p>}
                {r.notes && <p className="text-[13px] text-slate-500 mt-1">{r.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}