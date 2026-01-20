"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  GraduationCap, 
  Trophy, 
  Image as ImageIcon, 
  Info, 
  LogOut, 
  LayoutDashboard,
  ChevronRight,
  UserCircle,
  GalleryVerticalEnd,
  ArrowUpRight
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const menuItems = [
    { label: "Kelola Anggota", href: "/admin/members", icon: Users, color: "text-rose-600", bg: "bg-rose-50", hoverBorder: "hover:border-rose-400", hoverShadow: "hover:shadow-rose-100", desc: "Database Anggota" },
    { label: "Kelola Profil Anggota", href: "/admin/member-profiles", icon: UserCircle, color: "text-indigo-600", bg: "bg-indigo-50", hoverBorder: "hover:border-indigo-400", hoverShadow: "hover:shadow-indigo-100", desc: "Foto & Bio Tahunan" },
    { label: "Kelola Assignment", href: "/admin/assignments", icon: UserPlus, color: "text-orange-600", bg: "bg-orange-50", hoverBorder: "hover:border-orange-400", hoverShadow: "hover:shadow-orange-100", desc: "Tim dan Posisi" },
    { label: "Kelola Angkatan", href: "/admin/batches", icon: Calendar, color: "text-sky-600", bg: "bg-sky-50", hoverBorder: "hover:border-sky-400", hoverShadow: "hover:shadow-sky-100", desc: "Tahun Periode Aktif" },
    { label: "Kelola Prodi", href: "/admin/programs", icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50", hoverBorder: "hover:border-violet-400", hoverShadow: "hover:shadow-violet-100", desc: "Daftar Program Studi" },
    { label: "Kelola Achievements", href: "/admin/achievements", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50", hoverBorder: "hover:border-amber-400", hoverShadow: "hover:shadow-amber-100", desc: "Prestasi Tim" },
    { label: "Kelola Gallery", href: "/admin/gallery", icon: GalleryVerticalEnd, color: "text-teal-600", bg: "bg-teal-50", hoverBorder: "hover:border-teal-400", hoverShadow: "hover:shadow-teal-100", desc: "Dokumentasi" },
    { label: "Kelola Sponsor", href: "/admin/sponsors", icon: ImageIcon, color: "text-pink-600", bg: "bg-pink-50", hoverBorder: "hover:border-pink-400", hoverShadow: "hover:shadow-pink-100", desc: "Partner Logo" },
    { label: "Kelola Informasi & Kontak", href: "/admin/about", icon: Info, color: "text-slate-600", bg: "bg-slate-50", hoverBorder: "hover:border-slate-400", hoverShadow: "hover:shadow-slate-100", desc: "Informasi Tim" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#1C2B5A] rounded-lg transition text-slate-600">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base font-black tracking-tight text-[#1C2B5A] font-title leading-5 pt-1">Admin <br /> Central</h1>
          </div>
          <button 
            onClick={logout}
            className="group flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-red-600 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-[#1C2B5A] tracking-tight font-title">Hello, Admin</h2>
          <p className="text-slate-400 text-sm font-bold uppercase mt-1 tracking-[0.2em]">Content Management System</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group relative bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-35 ${item.hoverBorder} ${item.hoverShadow} hover:-translate-y-1`}
            >
              <item.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.04] group-hover:opacity-[0.1] group-hover:scale-110 transition-all duration-500 ${item.color}`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${item.bg} ${item.color} p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-500`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-slate-900 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className={`mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 ${item.color}`}>
                Kelola <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}