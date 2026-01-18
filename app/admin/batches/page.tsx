"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Trash2, Plus, ArrowLeft } from "lucide-react";

export default function AdminBatchesPage() {
  const router = useRouter();

  const [batches, setBatches] = useState<any[]>([]);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔐 Proteksi halaman
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      }
    }
    checkAuth();
  }, [router]);

  async function loadBatches() {
    setLoading(true);
    const { data } = await supabase
      .from("batches")
      .select("id, year")
      .order("year", { ascending: false });

    setBatches(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBatches();
  }, []);

  // ➕ Tambah batch
  async function addBatch() {
    const parsedYear = Number(year);

    if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
      setMessage("❌ Masukkan tahun yang valid (2000-2100)");
      return;
    }

    const { error } = await supabase.from("batches").insert({
      year: parsedYear,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Angkatan berhasil ditambahkan");
      setYear("");
      loadBatches();
    }
  }

  // 🗑️ Hapus batch
  async function deleteBatch(id: string, y: number) {
    const ok = confirm(
      `Yakin hapus angkatan ${y}?\nSemua data terkait tahun ini mungkin akan terdampak.`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("batches")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Angkatan berhasil dihapus");
      loadBatches();
    }
  }

  if (loading && batches.length === 0) {
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black tracking-tight">Kelola Angkatan</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Kolom Kiri: Form Input */}
          <div>
            <div className="sticky top-24">
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100">
                <div className="bg-orange-100 text-orange-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black mb-2">Tambah Angkatan</h2>
                <p className="text-slate-500 mb-6 font-medium">Input tahun akademik baru untuk sistem.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Tahun Angkatan</label>
                    <input
                      type="number"
                      placeholder="Contoh: 2026"
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-bold text-lg"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={addBatch}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Sekarang
                  </button>

                  {message && (
                    <div className={`p-4 rounded-xl text-sm font-bold text-center ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: List Data */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              Daftar Tahun Aktif <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{batches.length}</span>
            </h3>

            <div className="space-y-3">
              {batches.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-medium italic">
                  Belum ada data angkatan.
                </div>
              ) : (
                batches.map((b) => (
                  <div
                    key={b.id}
                    className="group flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-xl font-black text-slate-800 tracking-tight">
                        {b.year}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => deleteBatch(b.id, b.year)}
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus Angkatan"
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