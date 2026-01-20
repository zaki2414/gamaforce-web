"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Trash2, Plus, ArrowLeft, Hash, Edit3, X } from "lucide-react";

/* ================= PAGE ================= */

export default function AdminBatchesPage() {
  const router = useRouter();

  // Data States
  const [batches, setBatches] = useState<any[]>([]);
  const [year, setYear] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/admin/login");
    }
    checkAuth();
  }, [router]);

  /* ================= LOAD DATA ================= */

  async function loadBatches() {
    setInitialLoading(true);
    const { data } = await supabase
      .from("batches")
      .select("id, year")
      .order("year", { ascending: false });

    setBatches(data ?? []);
    setInitialLoading(false);
  }

  useEffect(() => {
    loadBatches();
  }, []);

  /* ================= ACTIONS ================= */

  function startEdit(b: any) {
    setEditingId(b.id);
    setYear(b.year.toString());
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setYear("");
    setMessage("");
  }

  async function handleSave() {
    const parsedYear = Number(year);

    if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
      setMessage("❌ Masukkan tahun yang valid (2000-2100)");
      return;
    }

    setLoading(true);
    let error;

    if (editingId) {
      const { error: err } = await supabase
        .from("batches")
        .update({ year: parsedYear })
        .eq("id", editingId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("batches")
        .insert({ year: parsedYear });
      error = err;
    }

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage(editingId ? "✅ Berhasil diperbarui" : "✅ Berhasil ditambahkan");
      cancelEdit();
      loadBatches();
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  }

  async function deleteBatch(id: string, y: number) {
    if (!confirm(`Yakin hapus angkatan ${y}?\nSemua data terkait tahun ini mungkin akan terdampak.`)) return;

    const { error } = await supabase.from("batches").delete().eq("id", id);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Angkatan berhasil dihapus");
      if (editingId === id) cancelEdit();
      loadBatches();
      setTimeout(() => setMessage(""), 3000);
    }
  }

  /* ================= UI ================= */

  if (initialLoading && batches.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Sticky Navbar - Consistent with Achievement & Programs */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Kelola Angkatan</h1>
          </div>
          
          {editingId && (
            <button 
              onClick={cancelEdit}
              className="flex items-center gap-1 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" /> Batal Edit
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: INPUT FORM (Sky/sky Theme) */}
          <div className="lg:col-span-5">
            <div className={`sticky top-24 p-8 rounded-3xl border-2 transition-all duration-300 ${editingId ? "bg-sky-50 border-sky-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`${editingId ? "bg-sky-400 text-white" : "bg-sky-100 text-sky-600"} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                {editingId ? <Edit3 className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
              </div>
              
              <h2 className="text-2xl font-black mb-2">{editingId ? "Edit Angkatan" : "Tambah Angkatan"}</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                {editingId ? "Perbarui tahun angkatan. Pastikan tidak ada duplikasi data." : "Daftarkan tahun angkatan baru untuk kategorisasi anggota."}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Tahun Angkatan (YYYY)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 2027"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-sky-400 focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all font-bold text-slate-800"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${editingId ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200" : "bg-sky-400 hover:bg-sky-500 text-white shadow-sky-100"}`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />
                  )}
                  {editingId ? "Perbarui Angkatan" : "Simpan Angkatan"}
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: LIST DATA */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                Daftar Angkatan Terdaftar <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{batches.length}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {batches.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium italic">
                  Belum ada angkatan terdaftar.
                </div>
              ) : (
                batches.map((b) => (
                  <div
                    key={b.id}
                    className={`group flex items-center justify-between p-5 bg-white border-2 rounded-2xl transition-all duration-300 ${editingId === b.id ? 'border-sky-400 ring-4 ring-sky-50' : 'border-slate-100 hover:border-sky-400 hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${editingId === b.id ? 'bg-sky-400 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600'}`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className={`text-lg font-black tracking-tight ${editingId === b.id ? 'text-sky-700' : 'text-slate-800'}`}>
                        {b.year}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => startEdit(b)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all cursor-pointer"
                        title="Edit Tahun"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBatch(b.id, b.year)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Hapus Angkatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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