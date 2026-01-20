"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, ArrowLeft, Trash2, GraduationCap, Calendar, User, Edit3, X, Search, Filter } from "lucide-react";

/* ================= TYPES ================= */

type Program = {
  id: string;
  name: string;
};

type Member = {
  id: string;
  name: string;
  program_batch: number;
  programs: { id: string; name: string };
};

/* ================= PAGE ================= */

export default function AdminMembersPage() {
  const router = useRouter();

  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Form States (Combined for Add/Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState("");
  const [programBatch, setProgramBatch] = useState("");

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterBatch, setFilterBatch] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  /* ================= LOAD DATA ================= */

  async function loadData() {
    setInitialLoading(true);
    const [m, p] = await Promise.all([
      supabase
        .from("members")
        .select("id, name, program_batch, programs!members_program_id_fkey ( id, name )")
        .order("name"),
      supabase.from("programs").select("id, name").order("name"),
    ]);

    setMembers(
      (m.data ?? []).map((member: any) => ({
        ...member,
        programs: Array.isArray(member.programs) ? member.programs[0] : member.programs,
      }))
    );
    setPrograms(p.data ?? []);
    setInitialLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ================= FILTER & SORT ================= */

  const filteredMembers = useMemo(() => {
    let filtered = [...members];
    if (searchName) {
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(searchName.toLowerCase()));
    }
    if (filterProgram) {
      filtered = filtered.filter((m) => m.programs?.id === filterProgram);
    }
    if (filterBatch) {
      filtered = filtered.filter((m) => m.program_batch.toString() === filterBatch);
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [members, searchName, filterProgram, filterBatch]);

  const uniqueBatches = useMemo(() => {
    const batches = members.map((m) => m.program_batch);
    return [...new Set(batches)].sort((a, b) => b - a);
  }, [members]);

  /* ================= ACTIONS ================= */

  function startEdit(m: Member) {
    setEditingId(m.id);
    setName(m.name);
    setProgramId(m.programs?.id ?? "");
    setProgramBatch(String(m.program_batch));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setProgramId("");
    setProgramBatch("");
  }

  async function handleSave() {
    if (!name || !programId || !programBatch) {
      setMessage("⚠️ Lengkapi semua field");
      return;
    }

    setLoading(true);
    const payload = {
      name,
      program_id: programId,
      program_batch: Number(programBatch),
    };

    const { error } = editingId 
      ? await supabase.from("members").update(payload).eq("id", editingId)
      : await supabase.from("members").insert(payload);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage(editingId ? "✅ Berhasil diupdate" : "✅ Berhasil ditambahkan");
      cancelEdit();
      loadData();
    }
    setLoading(false);
  }

  async function remove(id: string, n: string) {
    if (!confirm(`Hapus member: "${n}"?`)) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) setMessage(`❌ ${error.message}`);
    else {
      setMessage("✅ Member berhasil dihapus");
      if (editingId === id) cancelEdit();
      loadData();
    }
  }

  /* ================= UI ================= */

  if (initialLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Kelola Members</h1>
          </div>
          <div className="flex items-center gap-3">
            {editingId && (
              <button onClick={cancelEdit} className="flex items-center gap-1 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition cursor-pointer">
                <X className="w-4 h-4" /> Batal Edit
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: FORM & FILTER */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Form Input Card */}
            <div className={`p-8 rounded-3xl border-2 transition-all ${editingId ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`${editingId ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700"} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors`}>
                {editingId ? <Edit3 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-black mb-2">{editingId ? "Edit Member" : "Tambahkan Member"}</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                {editingId ? "Perbarui detail informasi keanggotaan." : "Tambah Anggota"}
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> Nama Lengkap
                  </label>
                  <input
                    placeholder="Contoh: Zaki Fadhila"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-50 focus:outline-none transition-all font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-3 h-3" /> Program
                    </label>
                    <select
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-rose-500 focus:outline-none transition-all font-bold text-sm appearance-none"
                      value={programId}
                      onChange={(e) => setProgramId(e.target.value)}
                    >
                      <option value="">Pilih...</option>
                      {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Angkatan
                    </label>
                    <input
                      type="number"
                      placeholder="2025"
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-rose-500 focus:outline-none transition-all font-bold"
                      value={programBatch}
                      onChange={(e) => setProgramBatch(e.target.value)}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${editingId ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200" : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100"} cursor-pointer`}
                >
                  {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {loading ? "Processing..." : editingId ? "Simpan Perubahan" : "Daftarkan Member"}
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Filter Card */}
            <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Filter Pencarian
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="Cari nama..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-400 outline-none transition-all"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={filterProgram}
                    onChange={(e) => setFilterProgram(e.target.value)}
                    className="p-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="">Semua Program</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select 
                    value={filterBatch}
                    onChange={(e) => setFilterBatch(e.target.value)}
                    className="p-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="">Semua Angkatan</option>
                    {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIST */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                Daftar Member Terdaftar <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">{filteredMembers.length}</span>
              </h3>
            </div>

            <div className="space-y-4 ">
              {filteredMembers.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                  <p className="text-slate-400 font-bold italic">Member tidak ditemukan</p>
                </div>
              ) : (
                filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    className={`group relative flex items-center justify-between p-6 bg-white border-2 rounded-3xl transition-all duration-300 grid-cols-2 sm:grid-cols-1 ${editingId === m.id ? "border-rose-400 ring-4 ring-rose-50" : "border-slate-100 hover:border-rose-400"}`}
                  >
                    <div className="flex items-center gap-5 ">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-colors font-black text-lg">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 leading-tight">
                          {m.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter bg-rose-50 px-2 py-0.5 rounded">
                            {m.programs?.name || "No Program"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Batch {m.program_batch}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => startEdit(m)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => remove(m.id, m.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Hapus Member"
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