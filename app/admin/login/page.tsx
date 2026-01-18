"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Import Icon dari Lucide
import { Lock, Mail, ArrowLeft, Chrome, Loader2 } from "lucide-react";

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
    if (error) {
      alert(error.message);
    } else {
      router.push("/auth/callback");
    }
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      {/* Tombol Kembali */}
      <div className="w-full max-w-md mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        {/* Header dengan Icon */}
        <div className="bg-indigo-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-indigo-100 text-sm mt-1">Please sign in to your account</p>
        </div>

        <div className="p-8">
          {/* Form Email */}
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-700"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-700"
                />
              </div>
            </div>

            <button
              onClick={loginWithEmail}
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In Now"}
            </button>
          </div>

          <div className="relative my-8 text-center">
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-100"></span>
            <span className="relative px-4 bg-white text-sm text-slate-400">or use social login</span>
          </div>

          {/* Google Login */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <Chrome className="w-5 h-5 text-red-500" />
            Continue with Google
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm italic">
        Authorized personnel only.
      </p>
    </div>
  );
}