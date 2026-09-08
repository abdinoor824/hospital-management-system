"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing payment session.");
      return;
    }

    api
      .verifyStripeSession(sessionId, token)
      .then((res) => {
        if (res.payment) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage("Payment not completed.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [sessionId, token, authLoading]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-[22px] border border-slate-100 p-8 text-center">
        {status === "verifying" && (
          <p className="text-slate-500 text-sm">Verifying your payment...</p>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center text-2xl">✓</div>
            <h1 className="text-[18px] font-bold text-slate-900 mb-1">Payment successful</h1>
            <p className="text-[13.5px] text-slate-500 mb-5">Your appointment is now marked as paid.</p>
            <button
              onClick={() => router.push("/patient/appointments")}
              className="bg-indigo-600 text-white rounded-lg py-2.5 px-5 text-sm font-semibold w-full"
            >
              Back to my appointments
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-50 text-red-600 grid place-items-center text-2xl">!</div>
            <h1 className="text-[18px] font-bold text-slate-900 mb-1">Something went wrong</h1>
            <p className="text-[13.5px] text-slate-500 mb-5">{message}</p>
            <button
              onClick={() => router.push("/patient/appointments")}
              className="bg-slate-900 text-white rounded-lg py-2.5 px-5 text-sm font-semibold w-full"
            >
              Back to my appointments
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-400 text-sm">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}