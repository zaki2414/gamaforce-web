"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Plus, ArrowLeft, Trash2, Calendar, Award } from "lucide-react";

type Achievement = {
  id: string;
  year: number;
  title: string;
  description: string | null;
};

export default function AdminAchievementsPage() {
  const router = useRouter();
  const [data, setData] = useState<Achievement[]>([]);
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
  async function add() {
    if (!year || !title) {
      setMessage("⚠️ Tahun dan Judul wajib diisi");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("achievements").insert({
      year: Number(year),
      title,
      description: description.trim() || null,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Prestasi berhasil ditambahkan");
      setYear("");
      setTitle("");
      setDescription("");
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
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black tracking-tight text-slate-900">Kelola Achievements</h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: FORM (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
              <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mb-2">Input Prestasi</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                Catat pencapaian terbaru tim atau individu untuk ditampilkan di landing page.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Tahun
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 2025"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-50 focus:outline-none transition-all font-bold"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <Award className="w-3 h-3" /> Judul Prestasi
                  </label>
                  <input
                    placeholder="Contoh: Juara 1 Gemastik"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-50 focus:outline-none transition-all font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Deskripsi Singkat</label>
                  <textarea
                    placeholder="Jelaskan detail singkat tentang prestasi ini..."
                    rows={3}
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-50 focus:outline-none transition-all font-medium text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={add}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  {loading ? "Menyimpan..." : "Tambah Achievement"}
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: LIST (7 cols) */}
          <div className="lg:col-span-7">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              History Prestasi <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{data.length}</span>
            </h3>

            <div className="space-y-4">
              {data.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-3xl">
                  <Trophy className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium italic">Belum ada data prestasi.</p>
                </div>
              ) : (
                data.map((a) => (
                  <div
                    key={a.id}
                    className="group relative flex flex-col p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-amber-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Badge Tahun */}
                    <div className="absolute top-0 right-0 bg-amber-500 text-white px-6 py-2 rounded-bl-3xl font-black text-sm tracking-tighter">
                      {a.year}
                    </div>

                    <div className="pr-12">
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight mb-2">
                        {a.title}
                      </h4>
                      {a.description && (
                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                          "{a.description}"
                        </p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        <Award className="w-3 h-3" /> Certified Achievement
                      </div>
                      <button
                        onClick={() => remove(a.id, a.title)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                        title="Hapus Prestasi"
                      >
                        <Trash2 className="w-5 h-5" />
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