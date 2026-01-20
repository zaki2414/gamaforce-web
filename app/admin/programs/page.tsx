"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Plus, ArrowLeft, Trash2, Search, BookOpen, Edit3, X, Database } from "lucide-react";

export default function AdminProgramsPage() {
  const router = useRouter();

  // Data States
  const [programs, setPrograms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/admin/login");
    }
    checkAuth();
  }, [router]);

  /* ================= LOAD DATA ================= */
  async function loadPrograms() {
    setInitialLoading(true);
    const { data } = await supabase
      .from("programs")
      .select("id, name")
      .order("name");

    setPrograms(data ?? []);
    setInitialLoading(false);
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  /* ================= ACTIONS ================= */
  function startEdit(p: any) {
    setEditingId(p.id);
    setName(p.name);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setMessage("");
  }

  async function handleSave() {
    if (!name.trim()) {
      setMessage("⚠️ Nama prodi tidak boleh kosong");
      return;
    }

    setLoading(true);
    let error;

    if (editingId) {
      const { error: err } = await supabase
        .from("programs")
        .update({ name: name.trim() })
        .eq("id", editingId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("programs")
        .insert({ name: name.trim() });
      error = err;
    }

    if (error) {
      setMessage(`❌ ${error.message.includes("duplicate") ? "Prodi sudah ada" : error.message}`);
    } else {
      setMessage(editingId ? "✅ Berhasil diperbarui" : "✅ Berhasil ditambahkan");
      cancelEdit();
      loadPrograms();
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  }

  async function deleteProgram(id: string, n: string) {
    if (!confirm(`Hapus prodi ${n}? Anggota yang terhubung mungkin akan kehilangan referensi data.`)) return;

    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Prodi berhasil dihapus");
      if (editingId === id) cancelEdit();
      loadPrograms();
      setTimeout(() => setMessage(""), 3000);
    }
  }

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (initialLoading && programs.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-violet-600 font-bold">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mr-3"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar with Shadow-sm & Sticky logic */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Kelola Programs</h1>
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

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: INPUT FORM */}
          <div className="lg:col-span-5">
            <div className={`sticky top-24 p-8 rounded-3xl border-2 transition-all duration-300 ${editingId ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`${editingId ? "bg-violet-400 text-white" : "bg-violet-100 text-violet-700"} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm`}>
                {editingId ? <Edit3 className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
              </div>
              
              <h2 className="text-2xl font-black mb-2">{editingId ? "Edit Prodi" : "Tambah Program Studi"}</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                {editingId ? "Perbarui nama program studi yang sudah terdaftar dalam sistem." : "Daftarkan bidang studi baru untuk referensi data anggota. Pastikan dalam bahasa inggris dan tidak ada typo"}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <Database className="w-3 h-3" /> Nama Program Studi
                  </label>
                  <input
                    placeholder="Contoh: Computer Science"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-50 focus:outline-none transition-all font-bold text-slate-800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${editingId ? "bg-violet-500 hover:bg-violet-600 text-white shadow-violet-200" : "bg-violet-400 hover:bg-violet-500 text-white shadow-violet-100"}`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />
                  )}
                  {editingId ? "Perbarui Program" : "Simpan Program"}
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: LIST DATA (Achievement List Style) */}
          <div className="lg:col-span-7">
            <div className="mb-8 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-violet-500 transition-colors" />
              <input 
                type="text"
                placeholder="Cari program studi..."
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-sm font-bold shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold italic">
                  {searchTerm ? "Program studi tidak ditemukan." : "Belum ada program studi terdaftar."}
                </div>
              ) : (
                filteredPrograms.map((p) => (
                  <div
                    key={p.id}
                    className={`group relative flex flex-col p-6 bg-white border-2 rounded-3xl transition-all duration-300 ${editingId === p.id ? 'border-violet-400 ring-4 ring-violet-50' : 'border-slate-100 hover:border-violet-400 hover:shadow-md'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${editingId === p.id ? 'bg-violet-400 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <h4 className={`text-lg font-black leading-tight transition-colors ${editingId === p.id ? 'text-violet-700' : 'text-slate-800'}`}>
                          {p.name}
                        </h4>
                      </div>
                      <div className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-mono font-black text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                        ID: {p.id.substring(0,8)}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        <BookOpen className="w-3 h-3" /> Database Reference
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all cursor-pointer"
                          title="Edit Program"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteProgram(p.id, p.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Hapus Program"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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