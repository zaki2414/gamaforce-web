"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Plus, ArrowLeft, Trash2, Search } from "lucide-react";

export default function AdminProgramsPage() {
  const router = useRouter();

  const [programs, setPrograms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔐 Proteksi halaman
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/admin/login");
    }
    checkAuth();
  }, [router]);

  async function loadPrograms() {
    setLoading(true);
    const { data } = await supabase
      .from("programs")
      .select("id, name")
      .order("name");

    setPrograms(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  // ➕ Tambah prodi
  async function addProgram() {
    if (!name.trim()) {
      setMessage("⚠️ Nama prodi tidak boleh kosong");
      return;
    }

    const { error } = await supabase.from("programs").insert({
      name: name.trim(),
    });

    if (error) {
      setMessage(`❌ ${error.message.includes("duplicate") ? "Prodi sudah ada" : error.message}`);
    } else {
      setMessage("✅ Program Studi berhasil ditambahkan");
      setName("");
      loadPrograms();
    }
  }

  // 🗑️ Hapus prodi
  async function deleteProgram(id: string, n: string) {
    if (!confirm(`Hapus prodi ${n}? Anggota yang terhubung mungkin akan kehilangan referensi data.`)) return;

    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Prodi berhasil dihapus");
      loadPrograms();
    }
  }

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black tracking-tight text-slate-900">Kelola Program Studi</h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Kolom Kiri: Form Input (4 cols) */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-24 bg-slate-50 p-8 rounded-3xl border-2 border-slate-100">
              <div className="bg-purple-100 text-purple-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mb-2 text-slate-900">Tambah Prodi</h2>
              <p className="text-slate-500 mb-6 font-medium text-sm">Tambahkan daftar jurusan/program studi baru.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Nama Program Studi</label>
                  <input
                    placeholder="Contoh: Teknik Informatika"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={addProgram}
                  className="w-full bg-slate-900 hover:bg-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Prodi
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: List Data (7-8 cols) */}
          <div className="md:col-span-7 lg:col-span-8">
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text"
                placeholder="Cari program studi..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all text-sm font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-medium">
                  {searchTerm ? "Prodi tidak ditemukan." : "Belum ada program studi."}
                </div>
              ) : (
                filteredPrograms.map((p) => (
                  <div
                    key={p.id}
                    className="group flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-purple-500 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-slate-800 tracking-tight">
                        {p.name}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => deleteProgram(p.id, p.name)}
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Hapus Prodi"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}