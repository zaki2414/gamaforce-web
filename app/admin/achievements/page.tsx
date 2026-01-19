"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Plus, ArrowLeft, Trash2, Calendar, Award, Edit3, X } from "lucide-react";

type Achievement = {
  id: string;
  year: number;
  title: string;
  description: string | null;
};

export default function AdminAchievementsPage() {
  const router = useRouter();
  const [data, setData] = useState<Achievement[]>([]);
  
  // State Form
  const [editingId, setEditingId] = useState<string | null>(null); // State baru untuk tracking edit
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
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
  async function load() {
    setInitialLoading(true);
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .order("year", { ascending: false });

    setData(data ?? []);
    setInitialLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ================= ACTIONS ================= */
  
  // Fungsi untuk mengisi form saat tombol edit diklik
  function startEdit(item: Achievement) {
    setEditingId(item.id);
    setYear(item.year.toString());
    setTitle(item.title);
    setDescription(item.description || "");
    setMessage(""); // Reset pesan
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll ke atas agar user sadar sedang edit
  }

  // Fungsi untuk membatalkan edit
  function cancelEdit() {
    setEditingId(null);
    setYear("");
    setTitle("");
    setDescription("");
  }

  async function handleSave() {
    if (!year || !title) {
      setMessage("⚠️ Tahun dan Judul wajib diisi");
      return;
    }

    setLoading(true);
    const payload = {
      year: Number(year),
      title,
      description: description.trim() || null,
    };

    let error;
    
    if (editingId) {
      // Jika ada editingId, lakukan UPDATE
      const { error: updateError } = await supabase
        .from("achievements")
        .update(payload)
        .eq("id", editingId);
      error = updateError;
    } else {
      // Jika tidak ada, lakukan INSERT
      const { error: insertError } = await supabase
        .from("achievements")
        .insert(payload);
      error = insertError;
    }

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage(editingId ? "✅ Berhasil diperbarui" : "✅ Berhasil ditambahkan");
      cancelEdit(); // Reset form
      await load();
    }
    setLoading(false);
  }

  async function remove(id: string, t: string) {
    if (!confirm(`Hapus prestasi: "${t}"?`)) return;
    
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Prestasi berhasil dihapus");
      if (editingId === id) cancelEdit(); // Jika yang dihapus sedang diedit, reset form
      await load();
    }
  }

  if (initialLoading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Kelola Achievements</h1>
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
          
          <div className="lg:col-span-5">
            <div className={`sticky top-24 p-8 rounded-3xl border-2 transition-all ${editingId ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`${editingId ? "bg-amber-400 text-white" : "bg-amber-100 text-amber-700"} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors`}>
                {editingId ? <Edit3 className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-black mb-2">{editingId ? "Edit Prestasi" : "Input Prestasi"}</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                {editingId ? "Perbarui informasi pencapaian tim yang sudah ada." : "Catat pencapaian terbaru tim atau individu untuk ditampilkan."}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Tahun
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 2025"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-50 focus:outline-none transition-all font-bold"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <Award className="w-3 h-3" /> Judul Prestasi
                  </label>
                  <input
                    placeholder="Contoh: Juara 1 Gemastik"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-50 focus:outline-none transition-all font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Deskripsi Singkat</label>
                  <textarea
                    placeholder="Jelaskan detail singkat tentang prestasi ini..."
                    rows={3}
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-50 focus:outline-none transition-all font-medium text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${editingId ? "bg-amber-400 hover:bg-amber-400/70 text-white shadow-amber-200 cursor-pointer" : "bg-amber-400/70 hover:bg-amber-400 text-white shadow-slate-200 cursor-pointer"}`}
                >
                  {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {loading ? "Menyimpan..." : editingId ? "Perbarui Achievement" : "Tambah Achievement"}
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              History Prestasi <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{data.length}</span>
            </h3>

            <div className="space-y-4">
              {data.map((a) => (
                <div
                  key={a.id}
                  className={`group relative flex flex-col p-6 bg-white border-2 rounded-3xl transition-all duration-300 overflow-hidden ${editingId === a.id ? "border-amber-400 ring-4 ring-amber-50" : "border-slate-100 hover:border-amber-400"}`}
                >
                  <div className="absolute top-0 right-0 bg-amber-400 text-white px-6 py-2 rounded-bl-3xl font-black text-sm tracking-tighter">
                    {a.year}
                  </div>

                  <div className="pr-12">
                    <h4 className="text-xl font-black text-slate-900 leading-tight mb-2">
                      {a.title}
                    </h4>
                    {a.description && (
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        "{a.description}"
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      <Award className="w-3 h-3" /> Certified Achievement
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => startEdit(a)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                        title="Edit Prestasi"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => remove(a.id, a.title)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Hapus Prestasi"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}