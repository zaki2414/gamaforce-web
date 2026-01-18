"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadToCloudinary } from "@/lib/cloudinary";
import imageCompression from "browser-image-compression";
import Link from "next/link";

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

    if (searchName) {
      filtered = filtered.filter((p) =>
        p.members?.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterBatch) {
      filtered = filtered.filter((p) => p.batches?.id === filterBatch);
    }

    if (filterYear) {
      filtered = filtered.filter((p) => p.year_order.toString() === filterYear);
    }

    return filtered.sort((a, b) => {
      const nameA = a.members?.name?.toLowerCase() || "";
      const nameB = b.members?.name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });
  }, [profiles, searchName, filterBatch, filterYear]);

  /* ================= CREATE PROFILE ================= */

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

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Profile berhasil dibuat");
      setMemberId("");
      setBatchId("");
      setYearOrder("1");
      loadAll();
    }
  }

  /* ================= UPDATE YEAR ================= */

  async function updateYear(id: string, value: string) {
    const { error } = await supabase
      .from("member_profiles")
      .update({ year_order: Number(value) })
      .eq("id", id);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Year order updated");
      loadAll();
    }
  }

  /* ================= UPLOAD PHOTO ================= */

  async function uploadPhoto(profileId: string, file: File) {
    setUploadingId(profileId);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const url = await uploadToCloudinary(compressed);

      await supabase
        .from("member_profiles")
        .update({ photo_url: url })
        .eq("id", profileId);

      setMessage("✅ Photo uploaded");
      loadAll();
    } catch (error) {
      setMessage("❌ Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  /* ================= DELETE PROFILE ================= */

  async function deleteProfile(id: string, name: string) {
    if (!confirm(`Delete profile for ${name}? All assignments using it will break.`)) return;
    const { error } = await supabase.from("member_profiles").delete().eq("id", id);
    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Profile deleted");
      loadAll();
    }
  }

  function clearFilters() {
    setSearchName("");
    setFilterBatch("");
    setFilterYear("");
  }

  /* ================= UI ================= */

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin text-blue-600 text-4xl">⌛</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
            >
              ← Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Member Profiles
            </h1>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full">
            {profiles.length} Profiles
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: FORM & FILTERS */}
          <div className="lg:col-span-4 space-y-6">
            {/* Create Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Add New Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">MEMBER</label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Member</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">BATCH</label>
                    <select
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Year</option>
                      {batches.map((b) => <option key={b.id} value={b.id}>{b.year}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">YEAR ORDER</label>
                    <select
                      value={yearOrder}
                      onChange={(e) => setYearOrder(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={createProfile}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                >
                  Create Profile
                </button>
                {message && (
                  <p className={`text-center text-xs font-bold p-2 rounded-lg ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Search & Filter</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
                <select 
                  value={filterBatch} 
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="">All Batches</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.year}</option>)}
                </select>
                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="">All Year Orders</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                </select>
                {(searchName || filterBatch || filterYear) && (
                  <button onClick={clearFilters} className="w-full text-xs font-bold text-red-500 pt-2">
                    RESET FILTERS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: DATA TABLE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Profile</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Batch</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProfiles.length === 0 ? (
                      <tr><td colSpan={4} className="p-20 text-center text-gray-400">No profiles found.</td></tr>
                    ) : (
                      filteredProfiles.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/40 transition group">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                {p.photo_url ? (
                                  <img src={p.photo_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-[10px] text-gray-400">NO PIC</div>
                                )}
                                {uploadingId === p.id && (
                                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center animate-pulse">⏳</div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">{p.members?.name}</div>
                                <label className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer uppercase">
                                  Change Photo
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && uploadPhoto(p.id, e.target.files[0])} 
                                  />
                                </label>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-bold text-gray-600">{p.batches?.year}</div>
                          </td>
                          <td className="p-4">
                            <select
                              value={String(p.year_order)}
                              onChange={(e) => updateYear(p.id, e.target.value)}
                              className="bg-gray-100 border-none text-[10px] font-bold uppercase py-1 px-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="1">Year 1</option>
                              <option value="2">Year 2</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => deleteProfile(p.id, p.members?.name)}
                              className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
              Member Profile Management • Internal
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}