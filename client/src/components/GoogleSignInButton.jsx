"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const ROLE_REDIRECT = { admin: "/admin", doctor: "/doctor", patient: "/" };

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);

  useEffect(() => {
    function initGoogle() {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const user = await loginWithGoogle(response.credential);
            window.location.href = ROLE_REDIRECT[user.role] || "/";
          } catch (err) {
            alert(err.message);
          }
        },
      });

    //   window.google.accounts.id.renderButton(buttonRef.current, {
    //     theme: "filled_black",
    //     size: "large",
    //     width: buttonRef.current.offsetWidth,
    //     shape: "pill",
    //   });
          window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        width: Math.min(buttonRef.current.offsetWidth, 380),
        shape: "pill",
      });
    }

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    }
  }, [loginWithGoogle]);


  return <div ref={buttonRef} className="w-full flex justify-center overflow-hidden" />;
}