"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, getImageUrl } from "@/lib/api";

const FILTERS = ["All", "Available Today", "Lowest Fee", "Most Experienced", "Top Rated"];
const TODAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

function pseudoStat(id, min, max) {
  const hash = String(id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return min + (hash % (max - min + 1));
}

const VALUE_PROPS = [
  { icon: "🩺", title: "Verified Doctors", desc: "Every doctor's profile, specialty, and schedule is managed and confirmed by our admin team." },
  { icon: "💳", title: "Flexible Payments", desc: "Pay by card, M-Pesa, or cash — whatever's easiest for you." },
  { icon: "📁", title: "Digital Records", desc: "Your diagnosis, prescriptions, and lab files, always accessible from your account." },
  { icon: "⚡", title: "Fast Booking", desc: "Find a doctor and book an appointment in under a minute." },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    api
      .publicDoctors()
      .then((res) => setDoctors(res.doctors))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const specialtyCount = useMemo(() => {
    return new Set(doctors.map((d) => d.specialization).filter(Boolean)).size;
  }, [doctors]);

  const withStats = useMemo(() => {
    return doctors.map((d) => ({
      ...d,
      _experience: pseudoStat(d._id, 3, 18),
      _rating: (4.5 + pseudoStat(d._id, 0, 4) / 10).toFixed(1),
      _availableToday: (d.availability || []).some((slot) => slot.day === TODAY_ABBR),
    }));
  }, [doctors]);

  const filtered = useMemo(() => {
    let list = withStats;

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(q) ||
          d.specialization?.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "Available Today") {
      list = list.filter((d) => d._availableToday);
    } else if (activeFilter === "Lowest Fee") {
      list = [...list].sort((a, b) => {
        const feeA = a.consultationFee > 0 ? a.consultationFee : Infinity;
        const feeB = b.consultationFee > 0 ? b.consultationFee : Infinity;
        return feeA - feeB;
      });
    } else if (activeFilter === "Most Experienced") {
      list = [...list].sort((a, b) => b._experience - a._experience);
    } else if (activeFilter === "Top Rated") {
      list = [...list].sort((a, b) => Number(b._rating) - Number(a._rating));
    }

    return list;
  }, [withStats, search, activeFilter]);

  function handleBook(doctorId) {
    if (!user) {
      router.push("/login");
    } else if (user.role === "patient") {
      router.push(`/patient/book?doctorId=${doctorId}`);
    } else {
      router.push(user.role === "admin" ? "/admin" : "/doctor");
    }
  }

  function dashboardHref() {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin" : user.role === "doctor" ? "/doctor" : "/patient";
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Top nav */}
      <header className="flex items-center justify-between gap-4 px-6 py-4 lg:px-10 bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-8 min-w-0">
          <a href="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-600 text-white text-[18px]">
            ⚕
          </a>
          <nav className="hidden md:flex items-center gap-1.5">
            <a href={dashboardHref()} className="text-[13.5px] font-medium text-slate-500 hover:text-slate-900 px-3 py-2 rounded-full">
              Overview
            </a>
            <span className="text-[13.5px] font-semibold bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-1.5">
              ⚕ Find Doctors
            </span>
            {user?.role === "patient" && (
              <>
                <a href="/patient/appointments" className="text-[13.5px] font-medium text-slate-500 hover:text-slate-900 px-3 py-2 rounded-full">
                  My Appointments
                </a>
                <a href="/patient/records" className="text-[13.5px] font-medium text-slate-500 hover:text-slate-900 px-3 py-2 rounded-full">
                  My Health Records
                </a>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <a
              href={dashboardHref()}
              className="h-10 w-10 rounded-full overflow-hidden bg-indigo-100 grid place-items-center text-[13px] font-semibold text-indigo-600"
            >
              {user.profilePicture ? (
                <img src={getImageUrl(user.profilePicture)} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name?.split(" ").map((p) => p[0]).join("").slice(0, 2)
              )}
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 px-6 py-14 lg:px-10 lg:py-20">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-10 bottom-[-80px] h-56 w-56 rounded-full bg-white/10" />

        <div className="relative max-w-2xl animate-fade-up">
          <span className="inline-block text-[12.5px] font-semibold bg-white/15 text-white px-3 py-1.5 rounded-full mb-4">
            ⚕ Trusted Care, Made Simple
          </span>
          <h1 className="text-[34px] sm:text-[44px] font-bold text-white leading-tight">
            Find the right doctor, book in minutes.
          </h1>
          <p className="mt-4 text-[15.5px] text-indigo-100 leading-relaxed max-w-lg">
            Browse verified doctors by specialty, check real-time availability, and pay however works for you — card, M-Pesa, or cash.
          </p>
          <div className="mt-7 flex gap-3 flex-wrap">
            <a
              href="#doctors"
              className="bg-white text-indigo-700 rounded-full px-6 py-3 text-[14px] font-semibold shadow-lg"
            >
              Browse Doctors
            </a>
            {!user && (
              <a
                href="/register"
                className="bg-white/10 border border-white/30 text-white rounded-full px-6 py-3 text-[14px] font-semibold hover:bg-white/20 transition-colors"
              >
                Create an Account
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-6 py-10 lg:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUE_PROPS.map((v, i) => (
            <div
              key={v.title}
              className="animate-fade-up bg-white rounded-[20px] border border-slate-100 p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-[26px] mb-2">{v.icon}</div>
              <p className="text-[14px] font-semibold text-slate-900">{v.title}</p>
              <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {!loading && doctors.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-slate-500">
            <span className="font-semibold text-indigo-600">{doctors.length}</span> doctor{doctors.length !== 1 ? "s" : ""} available
            {specialtyCount > 0 && (
              <>
                <span>·</span>
                <span className="font-semibold text-indigo-600">{specialtyCount}</span> specialt{specialtyCount !== 1 ? "ies" : "y"}
              </>
            )}
          </div>
        )}
      </section>

      <main id="doctors" className="px-6 py-4 lg:px-10 max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
          <div className="max-w-lg">
            <h2 className="text-[26px] font-bold text-slate-900 leading-tight">Find Your Doctor</h2>
            <p className="mt-2 text-[14.5px] text-slate-500">
              Search by name, specialty, or location — we'll help you find the right care.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[14px]">🔍</span>
            <input
              type="text"
              placeholder="Try 'cardiologist' or 'Dr. Smith'..."
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-10 pr-4 text-[13.5px] outline-none focus:border-indigo-400 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-[13px] font-medium px-4 py-2 rounded-full transition-colors ${
                activeFilter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm">No doctors found{activeFilter !== "All" ? ` for "${activeFilter}"` : ""}.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((d, i) => (
              <div
                key={d._id}
                className="animate-fade-up bg-white rounded-[24px] border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <a href={`/doctors/${d._id}`} className="block">
                  <div className="relative h-40 bg-slate-100">
                    {d.user?.profilePicture ? (
                      <img
                        src={getImageUrl(d.user.profilePicture)}
                        alt={d.user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-indigo-50 text-indigo-400 text-[40px] font-bold">
                        {d.user?.name?.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    {d._availableToday && (
                      <span className="absolute top-2.5 right-2.5 text-[10.5px] font-semibold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                        Available Today
                      </span>
                    )}
                  </div>

                  <div className="p-4 pb-0">
                    <p className="text-[15px] font-bold text-slate-900 hover:text-indigo-600">Dr. {d.user?.name}</p>
                    <p className="text-[13px] text-indigo-600 font-medium">{d.specialization}</p>

                    <div className="flex items-center gap-2 mt-2 text-[12px] text-slate-500">
                      <span>🎓 {d._experience} years experience</span>
                      <span>·</span>
                      <span className="text-amber-500 font-semibold">★ {d._rating}</span>
                    </div>

                    <div className="flex gap-1.5 mt-2.5 flex-wrap">
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Online</span>
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">In-Person</span>
                    </div>
                  </div>
                </a>

                <div className="p-4 pt-3 flex flex-col flex-1">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <div>
                      <p className="text-[10.5px] text-slate-400">Starting at</p>
                      <p className="text-[15px] font-bold text-slate-900">
                        {d.consultationFee > 0 ? `KES ${d.consultationFee}` : "—"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBook(d._id)}
                      className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold"
                    >
                      📅 Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}