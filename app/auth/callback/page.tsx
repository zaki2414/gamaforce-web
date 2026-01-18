"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!data) {
        await supabase.auth.signOut();
        alert("Akun ini tidak terdaftar sebagai admin");
        router.replace("/admin/login");
      } else {
        router.replace("/admin");
      }
    }

    checkAdmin();
  }, [router]);

  return <p>Checking access...</p>;
}
