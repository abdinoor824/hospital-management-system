"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, getImageUrl } from "@/lib/api";

const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

function pseudoStat(id, min, max) {
  const hash = String(id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return min + (hash % (max - min + 1));
}

export default function DoctorPublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .publicDoctorById(id)
      .then((res) => setDoctor(res.doctor))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleBook() {
    if (!user) {
      router.push("/login");
    } else if (user.role === "patient") {
      router.push(`/patient/book?doctorId=${id}`);
    } else {
      router.push(user.role === "admin" ? "/admin" : "/doctor");
    }
  }

  function dashboardHref() {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin" : user.role === "doctor" ? "/doctor" : "/patient";
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f4f6fb] text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f4f6fb] px-4 text-center">
        <div>
          <p className="text-slate-500 text-sm mb-4">{error || "Doctor not found."}</p>
          <a href="/" className="text-indigo-600 font-medium text-sm">Back to homepage</a>
        </div>
      </div>
    );
  }

  const experience = pseudoStat(doctor._id, 3, 18);
  const rating = (4.5 + pseudoStat(doctor._id, 0, 4) / 10).toFixed(1);
  const availability = doctor.availability || [];
  const sortedAvailability = [...availability].sort(
    (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Top nav, matches homepage */}
      <header className="flex items-center justify-between gap-4 px-6 py-4 lg:px-10 bg-white border-b border-slate-100 sticky top-0 z-30">
        <a href="/" className="flex items-center gap-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-600 text-white text-[18px]">⚕</div>
          <span className="text-[15px] font-bold text-slate-900 hidden sm:inline">HMS</span>
        </a>
        <div className="flex items-center gap-2.5">
          {user ? (
            <a href={dashboardHref()} className="text-[13.5px] font-semibold bg-indigo-600 text-white rounded-full px-4 py-2">
              Go to dashboard
            </a>
          ) : (
            <>
              <a href="/login" className="text-[13.5px] font-medium text-slate-600 px-3 py-2">Sign in</a>
              <a href="/register" className="text-[13.5px] font-semibold bg-indigo-600 text-white rounded-full px-4 py-2">
                Register
              </a>
            </>
          )}
        </div>
      </header>

      <main className="px-6 py-8 lg:px-10 max-w-4xl mx-auto">
        <a href="/" className="text-[13px] text-slate-500 hover:text-slate-800 mb-4 inline-block">← Back to all doctors</a>

        <div className="bg-white rounded-[28px] border border-slate-100 overflow-hidden">
          {/* Header section */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-slate-100">
            <div className="h-28 w-28 rounded-full overflow-hidden shrink-0 bg-indigo-50">
              {doctor.user?.profilePicture ? (
                <img src={getImageUrl(doctor.user.profilePicture)} alt={doctor.user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-indigo-400 text-[36px] font-bold">
                  {doctor.user?.name?.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-[24px] font-bold text-slate-900">Dr. {doctor.user?.name}</h1>
              <p className="text-[15px] text-indigo-600 font-medium mt-0.5">{doctor.specialization}</p>
              {doctor.qualifications && (
                <p className="text-[13.5px] text-slate-500 mt-1">{doctor.qualifications}</p>
              )}

              <div className="flex items-center gap-3 mt-3 flex-wrap text-[13px] text-slate-500">
                <span>🎓 {experience} years experience</span>
                <span>·</span>
                <span className="text-amber-500 font-semibold">★ {rating}</span>
              </div>

              <div className="flex gap-1.5 mt-3 flex-wrap">
                <span className="text-[11.5px] font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Online</span>
                <span className="text-[11.5px] font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">In-Person</span>
                {availability.some((s) => s.day === TODAY_ABBR) && (
                  <span className="text-[11.5px] font-semibold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                    Available Today
                  </span>
                )}
              </div>
            </div>

            <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-2">
              <div>
                <p className="text-[11px] text-slate-400">Consultation fee</p>
                <p className="text-[20px] font-bold text-slate-900">
                  {doctor.consultationFee > 0 ? `KES ${doctor.consultationFee}` : "—"}
                </p>
              </div>
              <button
                onClick={handleBook}
                className="w-full sm:w-auto bg-indigo-600 text-white rounded-lg px-6 py-2.5 text-[13.5px] font-semibold"
              >
                📅 Book Appointment
              </button>
            </div>
          </div>

          {/* Weekly availability */}
          <div className="p-6 sm:p-8">
            <h2 className="text-[15px] font-bold text-slate-900 mb-4">Weekly Availability</h2>
            {sortedAvailability.length === 0 ? (
              <p className="text-slate-400 text-[13.5px]">This doctor hasn't set their weekly availability yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedAvailability.map((slot, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                      slot.day === TODAY_ABBR ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <span className="text-[13.5px] font-semibold text-slate-700">{slot.day}</span>
                    <span className="text-[13px] text-slate-500">{slot.startTime} – {slot.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}