"use client";
import { useEffect, useState } from "react";
import RequireRole from "@/components/RequireRole";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function PatientRecordsPage() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .myRecords(token)
      .then((res) => setRecords(res.records))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <RequireRole role="patient">
      <DashboardLayout active="My Records">
        <h1 className="text-[20px] font-bold text-slate-900 mb-5">My medical records</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-slate-400 text-sm">No records yet. Your doctor will add these after a visit.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((r) => (
              <div key={r._id} className="rounded-[18px] border border-slate-100 bg-white px-5 py-4">
                <p className="text-[14.5px] font-semibold text-slate-900">
                  Dr. {r.doctor?.user?.name || "Unknown"}
                </p>
                <p className="text-[12.5px] text-slate-400 mb-2">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {r.diagnosis && <p className="text-[13px] text-slate-700"><span className="font-medium">Diagnosis:</span> {r.diagnosis}</p>}
                {r.prescription && <p className="text-[13px] text-slate-700 mt-1"><span className="font-medium">Prescription:</span> {r.prescription}</p>}
                {r.notes && <p className="text-[13px] text-slate-500 mt-1">{r.notes}</p>}

                {r.attachments?.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">Attachments</p>
                    {r.attachments.map((a, i) => (
                      <a
                        key={i}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12.5px] text-indigo-600 hover:underline flex items-center gap-1.5"
                      >
                        📎 {a.filename}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}