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
  const [uploadingId, setUploadingId] = useState(null);

  function loadRecords() {
    setLoading(true);
    api
      .recordsByDoctor(token)
      .then((res) => setRecords(res.records))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (token) loadRecords();
  }, [token]);

  async function handleFileUpload(recordId, file) {
    if (!file) return;
    setError("");
    setUploadingId(recordId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.addRecordAttachment(recordId, formData, token);
      loadRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  }

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

                {r.attachments?.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-3">
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

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <label className="inline-block cursor-pointer text-[12px] font-semibold bg-slate-100 text-slate-600 rounded-lg px-3 py-1.5">
                    {uploadingId === r._id ? "Uploading..." : "+ Add attachment (image or PDF)"}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={uploadingId === r._id}
                      onChange={(e) => handleFileUpload(r._id, e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </RequireRole>
  );
}