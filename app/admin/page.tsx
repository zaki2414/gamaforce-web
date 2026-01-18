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
  UserCircle
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
    { label: "Kelola Anggota", href: "/admin/members", icon: Users, color: "text-blue-700", bg: "bg-blue-100" },
    { label: "Member Profiles", href: "/admin/member-profiles", icon: UserCircle, color: "text-indigo-700", bg: "bg-indigo-100" },
    { label: "Kelola Assignment", href: "/admin/assignments", icon: UserPlus, color: "text-emerald-700", bg: "bg-emerald-100" },
    { label: "Kelola Angkatan", href: "/admin/batches", icon: Calendar, color: "text-orange-700", bg: "bg-orange-100" },
    { label: "Kelola Prodi", href: "/admin/programs", icon: GraduationCap, color: "text-purple-700", bg: "bg-purple-100" },
    { label: "Kelola Achievements", href: "/admin/achievements", icon: Trophy, color: "text-amber-700", bg: "bg-amber-100" },
    { label: "Kelola Sponsor", href: "/admin/sponsors", icon: ImageIcon, color: "text-pink-700", bg: "bg-pink-100" },
    { label: "About & Contact", href: "/admin/about", icon: Info, color: "text-slate-700", bg: "bg-slate-100" },
  ];

  return (
    // Memaksa background putih terang agar tidak abu-abu
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Admin Central</h1>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 leading-tight">Selamat Datang, Admin</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Sistem Manajemen Data Website</p>
        </div>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="group bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className={`${item.bg} ${item.color} p-4 rounded-2xl`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div>
                <span className="block text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </span>
                <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Modul {item.label.split(' ')[1] || 'Sistem'}</span>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 py-8 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            System Version 2.0.4 • © 2026 Admin Dashboard
          </p>
        </footer>
      </main>
    </div>
  );
}