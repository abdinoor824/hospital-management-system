"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/lib/api";


const NAV_BY_ROLE = {
  admin: [
    { label: "Overview", href: "/admin" },
    { label: "Doctors", href: "/admin/doctors" },
    { label: "Patients", href: "/admin/patients" },
    { label: "Appointments", href: "/admin/appointments" },
  ],
   doctor: [
    { label: "Overview", href: "/doctor" },
    { label: "My Appointments", href: "/doctor/appointments" },
    { label: "Walk-in Patient", href: "/doctor/walkin" },
    { label: "Patient Records", href: "/doctor/records" },
  ],
  patient: [
    { label: "Overview", href: "/patient" },
    { label: "Book Appointment", href: "/patient/book" },
    { label: "My Appointments", href: "/patient/appointments" },
    { label: "My Records", href: "/patient/records" },
  ],
};

export default function DashboardLayout({ children, active }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = NAV_BY_ROLE[user?.role] || [];

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const sidebarContent = (
    <>
      <div>
        <div className="px-2 mb-8 flex items-center justify-between">
          <div>
            <span className="text-[17px] font-bold text-slate-900">HMS</span>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role} panel</p>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="lg:hidden text-slate-400 text-xl leading-none px-2"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        {/* <nav className="flex flex-col gap-1">
          {nav.map((item) => ( */}
                  <nav className="flex flex-col gap-1">
          <a
            href="/"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
          >
            🏠 Home
          </a>
          <div className="h-px bg-slate-100 my-1" />
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                active === item.label
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-1">
        <a
          href="/profile"
          onClick={() => setMenuOpen(false)}
          className={`rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
            active === "Profile"
              ? "bg-indigo-50 text-indigo-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Profile
        </a>
        <button
          onClick={handleLogout}
          className="rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-left"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between bg-white border-r border-slate-100 px-5 py-6">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col justify-between px-5 py-6 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between gap-4 px-6 py-5 lg:px-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
              aria-label="Open menu"
            >
              ☰
            </button>
            <p className="text-[15px] font-semibold text-slate-900">{active}</p>
          </div>
          <div className="flex items-center gap-2.5">
           

<a href="/profile" className="h-9 w-9 rounded-full overflow-hidden bg-indigo-100 grid place-items-center text-[12px] font-semibold text-indigo-600">
  {user?.profilePicture ? (
    <img src={getImageUrl(user.profilePicture)} alt={user.name} className="h-full w-full object-cover" />
  ) : (
    user?.name?.split(" ").map((p) => p[0]).join("").slice(0, 2)
  )}
</a>

            <span className="text-[13.5px] font-medium text-slate-700 hidden sm:inline">{user?.name}</span>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}