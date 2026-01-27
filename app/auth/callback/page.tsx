"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Memverifikasi akses...");

  useEffect(() => {
    async function checkAdmin() {
      try {
        setStatus("Memeriksa autentikasi...");
        
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus("Tidak terautentikasi");
          router.replace("/admin/login");
          return;
        }

        setStatus("Memverifikasi role admin...");
        const { data } = await supabase
          .from("admins")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!data) {
          await supabase.auth.signOut();
          setStatus("Akses ditolak");
          alert("Akun ini tidak terdaftar sebagai admin");
          router.replace("/admin/login");
        } else {
          setStatus("Berhasil! Mengalihkan...");
          router.replace("/admin");
        }
      } catch (error) {
        console.error("Error:", error);
        setStatus("Terjadi kesalahan");
        router.replace("/admin/login");
      }
    }
    checkAdmin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-[#1C2B5A]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#E6B52C] rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Card Container */}
        <div className="p-8 bg-[#F8FAFF] border-2 border-[#1C2B5A]/10 rounded-3xl">
          {/* Status Text */}
          <h2 className="font-title text-2xl text-[#1C2B5A] mb-3 tracking-tight">
            Admin Portal
          </h2>
          <p className="font-sans text-[#E6B52C] font-bold text-lg mb-2 animate-pulse">
            {status}
          </p>
          <p className="font-sans text-[#1C2B5A]/60 text-sm font-medium">
            Mohon tunggu sebentar...
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-[#E6B52C] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#E6B52C] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#E6B52C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}