"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api, SERVER_URL } from "@/lib/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProfilePage() {
  const { user, token, loading, updateUser } = useAuth();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoErr, setPhotoErr] = useState("");

  const [availability, setAvailability] = useState([]);
  const [availLoading, setAvailLoading] = useState(true);
  const [availSaving, setAvailSaving] = useState(false);
  const [availMsg, setAvailMsg] = useState("");
  const [availErr, setAvailErr] = useState("");

  useEffect(() => {
    if (user?.role !== "doctor" || !token) {
      setAvailLoading(false);
      return;
    }
    api
      .myDoctorProfile(token)
      .then((res) => setAvailability(res.profile.availability || []))
      .catch((err) => setAvailErr(err.message))
      .finally(() => setAvailLoading(false));
  }, [user, token]);

  if (loading) return <div className="min-h-screen grid place-items-center text-slate-400 text-sm">Loading...</div>;
  if (!user) {
    router.replace("/login");
    return null;
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoErr("");
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.uploadProfilePicture(formData, token);
      updateUser(res.user);
    } catch (err) {
      setPhotoErr(err.message);
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setProfileSaving(true);
    try {
      const res = await api.updateMe(profileForm, token);
      updateUser(res.user);
      setProfileMsg("Profile updated. Redirecting...");
      setTimeout(() => {
        window.location.href = res.user.role === "admin" ? "/admin" : res.user.role === "doctor" ? "/doctor" : "/patient";
      }, 1000);
    } catch (err) {
      setProfileErr(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordErr("");
    setPasswordMsg("");
    setPasswordSaving(true);
    try {
      await api.changePassword(passwordForm, token);
      setPasswordMsg("Password changed.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordErr(err.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  function addSlot() {
    setAvailability([...availability, { day: "Mon", startTime: "09:00", endTime: "17:00" }]);
  }

  function updateSlot(index, field, value) {
    const next = [...availability];
    next[index] = { ...next[index], [field]: value };
    setAvailability(next);
  }

  function removeSlot(index) {
    setAvailability(availability.filter((_, i) => i !== index));
  }

  async function handleAvailabilitySave() {
    setAvailErr("");
    setAvailMsg("");
    setAvailSaving(true);
    try {
      await api.updateMyDoctorProfile({ availability }, token);
      setAvailMsg("Availability saved.");
    } catch (err) {
      setAvailErr(err.message);
    } finally {
      setAvailSaving(false);
    }
  }

  return (
    <DashboardLayout active="Profile">
      <div className="max-w-lg flex flex-col gap-8">
        <section>
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">My profile</h1>
          <p className="text-[13px] text-slate-400 mb-5">{user.email} · <span className="capitalize">{user.role}</span></p>

          <div className="bg-white rounded-[22px] border border-slate-100 p-5 flex items-center gap-4">
            {user.profilePicture ? (
              <img
                src={`${SERVER_URL}${user.profilePicture}`}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-indigo-100 grid place-items-center text-indigo-600 font-semibold text-[18px]">
                {user.name?.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </div>
            )}
            <div>
              <label className="inline-block cursor-pointer text-[13px] font-semibold bg-slate-900 text-white rounded-lg px-4 py-2">
                {photoUploading ? "Uploading..." : "Upload photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
              </label>
              {photoErr && <p className="text-red-600 text-xs mt-2">{photoErr}</p>}
              {user.role === "doctor" && (
                <p className="text-[11.5px] text-slate-400 mt-2">This photo appears on the public homepage.</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-slate-900 mb-3">Edit details</h2>

          {profileErr && <p className="text-red-600 text-sm mb-3">{profileErr}</p>}
          {profileMsg && <p className="text-emerald-600 text-sm mb-3">{profileMsg}</p>}

          <form onSubmit={handleProfileSubmit} className="bg-white rounded-[22px] border border-slate-100 p-5 flex flex-col gap-3">
            <input
              placeholder="Full name"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
            <input
              placeholder="Phone"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
            <button
              type="submit"
              disabled={profileSaving}
              className="bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        {user.role === "doctor" && (
          <section>
            <h2 className="text-[15px] font-semibold text-slate-900 mb-1">Weekly availability</h2>
            <p className="text-[12.5px] text-slate-400 mb-3">
              Powers the "Available Today" filter on the homepage. Add the days and hours you see patients.
            </p>

            {availErr && <p className="text-red-600 text-sm mb-3">{availErr}</p>}
            {availMsg && <p className="text-emerald-600 text-sm mb-3">{availMsg}</p>}

            <div className="bg-white rounded-[22px] border border-slate-100 p-5">
              {availLoading ? (
                <p className="text-slate-400 text-sm">Loading...</p>
              ) : (
                <>
                  <div className="flex flex-col gap-2 mb-4">
                    {availability.length === 0 && (
                      <p className="text-slate-400 text-[13px]">No availability set yet.</p>
                    )}
                    {availability.map((slot, i) => (
                      <div key={i} className="flex items-center gap-2 flex-wrap">
                        <select
                          className="rounded-lg border border-slate-200 px-2.5 py-2 text-[13px]"
                          value={slot.day}
                          onChange={(e) => updateSlot(i, "day", e.target.value)}
                        >
                          {DAYS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <input
                          type="time"
                          className="rounded-lg border border-slate-200 px-2.5 py-2 text-[13px]"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                        />
                        <span className="text-slate-400 text-[13px]">to</span>
                        <input
                          type="time"
                          className="rounded-lg border border-slate-200 px-2.5 py-2 text-[13px]"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                        />
                        <button
                          onClick={() => removeSlot(i)}
                          className="text-red-500 text-[13px] font-medium ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={addSlot}
                      className="text-[13px] font-medium bg-slate-100 text-slate-600 rounded-lg px-4 py-2"
                    >
                      + Add day
                    </button>
                    <button
                      onClick={handleAvailabilitySave}
                      disabled={availSaving}
                      className="text-[13px] font-semibold bg-indigo-600 text-white rounded-lg px-4 py-2 disabled:opacity-60"
                    >
                      {availSaving ? "Saving..." : "Save availability"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[15px] font-semibold text-slate-900 mb-3">Change password</h2>

          {passwordErr && <p className="text-red-600 text-sm mb-3">{passwordErr}</p>}
          {passwordMsg && <p className="text-emerald-600 text-sm mb-3">{passwordMsg}</p>}

          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-[22px] border border-slate-100 p-5 flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current password"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="New password"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-slate-900 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {passwordSaving ? "Updating..." : "Change password"}
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}