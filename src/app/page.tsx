"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LoginPage from "./auth/login/page";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session check:", session);
        
        if (session) {
          window.location.href = "/dashboard";
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <LoginPage />;
}
