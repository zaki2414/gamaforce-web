"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadToCloudinary } from "@/lib/cloudinary";
import imageCompression from "browser-image-compression";
import Link from "next/link";
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  Camera, 
  Calendar, 
  User,
  MoreHorizontal,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";

/* ================= TYPES ================= */

type Member = { id: string; name: string };
type Batch = { id: string; year: number };

type Profile = {
  id: string;
  year_order: number;
  photo_url: string | null;
  members: { id: string; name: string };
  batches: { id: string; year: number };
};

/* ================= PAGE ================= */

export default function AdminMemberProfilesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Form States
  const [memberId, setMemberId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [yearOrder, setYearOrder] = useState("1");

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [m, b, p] = await Promise.all([
      supabase.from("members").select("id,name").order("name"),
      supabase.from("batches").select("id,year").order("year", { ascending: false }),
      supabase
        .from("member_profiles")
        .select(`
          id,
          year_order,
          photo_url,
          members!member_profiles_member_id_fkey ( id, name ),
          batches!member_profiles_batch_id_fkey ( id, year )
        `)
        .order("created_at", { ascending: false }),
    ]);

    setMembers(m.data || []);
    setBatches(b.data || []);

    const mapped = (p.data || []).map((x: any) => ({
      ...x,
      members: Array.isArray(x.members) ? x.members[0] : x.members,
      batches: Array.isArray(x.batches) ? x.batches[0] : x.batches,
    }));

    setProfiles(mapped);
    setLoading(false);
  }

  /* ================= FILTER & SORT PROFILES ================= */

  const filteredProfiles = useMemo(() => {
    let filtered = [...profiles];
    if (searchName) filtered = filtered.filter((p) => p.members?.name?.toLowerCase().includes(searchName.toLowerCase()));
    if (filterBatch) filtered = filtered.filter((p) => p.batches?.id === filterBatch);
    if (filterYear) filtered = filtered.filter((p) => p.year_order.toString() === filterYear);

    return filtered.sort((a, b) => (a.members?.name || "").localeCompare(b.members?.name || ""));
  }, [profiles, searchName, filterBatch, filterYear]);

  /* ================= ACTIONS ================= */

  async function createProfile() {
    if (!memberId || !batchId || !yearOrder) {
      setMessage("⚠️ Lengkapi semua field");
      return;
    }
    const { error } = await supabase.from("member_profiles").insert({
      member_id: memberId,
      batch_id: batchId,
      year_order: Number(yearOrder),
    });
    if (error) setMessage(`❌ ${error.message}`);
    else {
      setMessage("✅ Profile berhasil dibuat");
      setMemberId(""); setBatchId(""); setYearOrder("1");
      loadAll();
    }
  }

  async function updateYear(id: string, value: string) {
    const { error } = await supabase.from("member_profiles").update({ year_order: Number(value) }).eq("id", id);
    if (error) setMessage(`❌ ${error.message}`);
    else {
      setMessage("✅ Year order updated");
      loadAll();
    }
  }

  async function uploadPhoto(profileId: string, file: File) {
    setUploadingId(profileId);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true });
      const url = await uploadToCloudinary(compressed);
      await supabase.from("member_profiles").update({ photo_url: url }).eq("id", profileId);
      setMessage("✅ Photo uploaded");
      loadAll();
    } catch (error) {
      setMessage("❌ Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  async function deleteProfile(id: string, name: string) {
    if (!confirm(`Delete profile for ${name}?`)) return;
    const { error } = await supabase.from("member_profiles").delete().eq("id", id);
    if (error) setMessage(`❌ ${error.message}`);
    else {
      setMessage("✅ Profile deleted");
      loadAll();
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h1 className="text-xl font-black tracking-tight text-slate-900">Member Profiles</h1>
          </div>
          <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">
            {profiles.length} Total Profiles
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: FORM & FILTER */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-3xl border-2 border-slate-100 bg-slate-50">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mb-6">Tambah Profil</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> Pilih Member
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                  >
                    <option value="">Pilih Member...</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Batch
                    </label>
                    <select
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                    >
                      <option value="">Tahun</option>
                      {batches.map((b) => <option key={b.id} value={b.id}>{b.year}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3" /> Order
                    </label>
                    <select
                      value={yearOrder}
                      onChange={(e) => setYearOrder(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={createProfile}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 transition active:scale-95 cursor-pointer"
                >
                  Create Profile
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Filter */}
            <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Filter Data
              </h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Cari profil..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:border-2 focus:border-blue-500"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} className="p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:border-2 focus:border-blue-500">
                  <option value="">Semua Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.year}</option>)}
                </select>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:border-2 focus:border-blue-500">
                  <option value="">Semua Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT: DATA LIST */}
          <div className="lg:col-span-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              Daftar Profil Terintegrasi <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">{filteredProfiles.length}</span>
            </h3>

            <div className="space-y-3">
              {filteredProfiles.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400 font-bold">
                  Data tidak ditemukan
                </div>
              ) : (
                filteredProfiles.map((p) => (
                  <div key={p.id} className="group flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        {p.photo_url ? (
                          <img src={p.photo_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><ImageIcon className="w-5 h-5 text-slate-300" /></div>
                        )}
                        {uploadingId === p.id && (
                          <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900 truncate leading-none">{p.members?.name}</h4>
                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase">
                            {p.batches?.year}
                          </span>
                        </div>
                        <label className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-500 hover:text-blue-700 cursor-pointer uppercase tracking-wider transition-colors">
                          <Camera className="w-3 h-3" /> Ganti Foto
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(p.id, e.target.files[0])} />
                        </label>
                      </div>

                      <div className="px-4">
                         <select
                            value={String(p.year_order)}
                            onChange={(e) => updateYear(p.id, e.target.value)}
                            className="bg-slate-100 border-none text-[10px] font-black uppercase py-1.5 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                          >
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => deleteProfile(p.id, p.members?.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
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