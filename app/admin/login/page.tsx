"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowLeft,
  Chrome,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) alert(error.message);
    else router.push("/admin");
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 text-[#1C2B5A]">
      {/* Background Blur */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1C2B5A]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#E6B52C]/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1C2B5A] font-sans"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to site
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 space-y-8">
          {/* Header */}
          <div>
            <div>
            </div>

            <h1 className="text-3xl font-black tracking-tight font-title">
              Admin Portal
            </h1>

            <p className="text-sm text-slate-500 font-sans">
              Authenticate to access Gamaforce control panel.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5 font-sans">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gamaforce.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1C2B5A] focus:bg-white outline-none text-sm font-semibold transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1C2B5A] focus:bg-white outline-none text-sm font-semibold transition"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-2 font-sans">
            <button
              onClick={loginWithEmail}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1C2B5A] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#1C2B5A]/90 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login"
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                Or
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-200 font-black uppercase tracking-widest text-xs hover:border-[#1C2B5A] transition cursor-pointer"
            >
              <Chrome className="w-4 h-4" />
              Google Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
