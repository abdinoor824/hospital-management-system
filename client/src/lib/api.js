const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SERVER_URL = API_URL.replace("/api", "");

async function request(path, { method = "GET", body, token, isFormData } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  googleLogin: (credential) => request("/auth/google", { method: "POST", body: { credential } }),
 
  me: (token) => request("/auth/me", { token }),
  updateMe: (payload, token) => request("/auth/me", { method: "PUT", body: payload, token }),
  changePassword: (payload, token) => request("/auth/password", { method: "PUT", body: payload, token }),
  uploadProfilePicture: (formData, token) =>
    request("/auth/profile-picture", { method: "POST", body: formData, token, isFormData: true }),

  // listDoctors: (token) => request("/doctors", { token }),
    listDoctors: (token) => request("/doctors", { token }),
  myDoctorProfile: (token) => request("/doctors/me", { token }),
  updateMyDoctorProfile: (payload, token) => request("/doctors/me", { method: "PUT", body: payload, token }),
  publicDoctors: () => request("/public/doctors"),

  bookAppointment: (payload, token) =>
    request("/appointments", { method: "POST", body: payload, token }),
  myAppointments: (token) => request("/appointments/mine", { token }),
  updateAppointmentStatus: (id, status, token) =>
    request(`/appointments/${id}`, { method: "PATCH", body: { status }, token }),

  myRecords: (token) => request("/records/mine", { token }),
  createRecord: (payload, token) => request("/records", { method: "POST", body: payload, token }),
  recordsByDoctor: (token) => request("/records/by-doctor", { token }),

  adminCreateUser: (payload, token) =>
    request("/admin/users", { method: "POST", body: payload, token }),
  adminListDoctors: (token) => request("/admin/doctors", { token }),
  adminListPatients: (token) => request("/admin/patients", { token }),
  adminListAppointments: (token) => request("/admin/appointments", { token }),

  recordCashPayment: (payload, token) => request("/payments/cash", { method: "POST", body: payload, token }),
  paymentForAppointment: (appointmentId, token) =>
    request(`/payments/for-appointment/${appointmentId}`, { token }),

  createWalkin: (payload, token) => request("/walkin", { method: "POST", body: payload, token }),

  createStripeCheckout: (payload, token) =>
    request("/payments/stripe/create-checkout-session", { method: "POST", body: payload, token }),
  verifyStripeSession: (sessionId, token) =>
    request(`/payments/stripe/verify/${sessionId}`, { token }),
    initiateMpesa: (payload, token) =>
    request("/payments/mpesa/stkpush", { method: "POST", body: payload, token }),
  mpesaStatus: (checkoutRequestId, token) =>
    request(`/payments/mpesa/status/${checkoutRequestId}`, { token }),
};