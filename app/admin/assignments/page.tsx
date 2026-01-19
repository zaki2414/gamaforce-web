"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Briefcase, 
  UserCircle, 
  Edit3, 
  X, 
  Filter, 
  Search, 
  ShieldCheck
} from "lucide-react";

/* ================= TYPES ================= */

type Team = {
  id: string;
  name: string;
  type: "ph" | "management" | "subteam";
};

type TeamUnit = {
  id: string;
  name: string;
  team_id: string;
};

type Position = {
  id: string;
  name: string;
  scope: "ph" | "management" | "subteam" | null;
  priority: number;
};

type MemberProfile = {
  id: string;
  year_order: number;
  members: { id: string; name: string };
  batches: { id: string; year: number };
};

type Assignment = {
  id: string;
  team_id: string;
  position_id: string;
  profile_id: string;
  unit_id: string | null;

  teams: { name: string };
  positions: { name: string; priority: number };
  team_units: { name: string } | null;
  member_profiles: {
    year_order: number;
    members: { name: string };
    batches: { year: number };
  };
};

export default function AdminAssignmentsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [units, setUnits] = useState<TeamUnit[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [teamId, setTeamId] = useState("");
  const [unitId, setUnitId] = useState<string>("");
  const [positionId, setPositionId] = useState("");
  const [profileId, setProfileId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterBatch, setFilterBatch] = useState("");

  /* ================= INIT ================= */

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setInitialLoading(true);
    const [t, p, prof] = await Promise.all([
      supabase.from("teams").select("id,name,type").order("type"),
      supabase.from("positions").select("id,name,scope,priority").order("priority"),
      supabase
        .from("member_profiles")
        .select(`
          id,
          year_order,
          members!member_profiles_member_id_fkey ( id, name ),
          batches!member_profiles_batch_id_fkey ( id, year )
        `)
        .order("created_at", { ascending: false }),
    ]);

    setTeams(t.data || []);
    setPositions(p.data || []);
    setProfiles(
      (prof.data || []).map((p: any) => ({
        ...p,
        members: Array.isArray(p.members) ? p.members[0] : p.members,
        batches: Array.isArray(p.batches) ? p.batches[0] : p.batches,
      }))
    );

    await loadAssignments();
    setInitialLoading(false);
  }

  useEffect(() => {
    if (!teamId) {
      setUnits([]);
      setUnitId("");
      return;
    }
    supabase
      .from("team_units")
      .select("id,name,team_id")
      .eq("team_id", teamId)
      .order("order_index")
      .then(({ data }) => {
        setUnits(data || []);
      });
  }, [teamId]);

  async function loadAssignments() {
    const { data } = await supabase
      .from("assignments")
      .select(`
        id, team_id, position_id, profile_id, unit_id,
        teams!assignments_team_id_fkey ( name ),
        positions!assignments_position_id_fkey ( name, priority ),
        team_units!assignments_unit_id_fkey ( name ),
        member_profiles!assignments_profile_id_fkey (
          year_order,
          members!member_profiles_member_id_fkey ( name ),
          batches!member_profiles_batch_id_fkey ( year )
        )
      `)
      .order("id", { ascending: false });

    setAssignments(
      (data || []).map((a: any) => ({
        ...a,
        teams: Array.isArray(a.teams) ? a.teams[0] : a.teams,
        positions: Array.isArray(a.positions) ? a.positions[0] : a.positions,
        team_units: Array.isArray(a.team_units) ? a.team_units[0] : a.team_units,
        member_profiles: Array.isArray(a.member_profiles) ? a.member_profiles[0] : a.member_profiles,
      }))
    );
  }

  /* ================= LOGIC ================= */

  const selectedTeam = teams.find((t) => t.id === teamId);
  const filteredPositions = positions.filter((p) => {
    if (!selectedTeam) return false;
    if (selectedTeam.type === "ph") return p.scope === "ph";
    if (selectedTeam.type === "management") return p.scope === null;
    if (selectedTeam.type === "subteam") return p.scope === "subteam" || p.scope === null;
    return false;
  });

  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];
    if (searchName) filtered = filtered.filter((a) => a.member_profiles.members.name.toLowerCase().includes(searchName.toLowerCase()));
    if (filterTeam) filtered = filtered.filter((a) => a.team_id === filterTeam);
    if (filterBatch) filtered = filtered.filter((a) => a.member_profiles.batches.year.toString() === filterBatch);
    return filtered.sort((a, b) => a.member_profiles.members.name.localeCompare(b.member_profiles.members.name));
  }, [assignments, searchName, filterTeam, filterBatch]);

  const uniqueBatches = useMemo(() => {
    const batches = assignments.map((a) => a.member_profiles.batches.year);
    return [...new Set(batches)].sort((a, b) => b - a);
  }, [assignments]);

  async function handleSubmit() {
    if (!teamId || !positionId || !profileId) {
      setMessage("⚠️ Lengkapi semua field wajib");
      return;
    }

    setLoading(true);
    const payload = { team_id: teamId, position_id: positionId, profile_id: profileId, unit_id: unitId || null };

    const { error } = editingId 
      ? await supabase.from("assignments").update(payload).eq("id", editingId)
      : await supabase.from("assignments").insert(payload);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage(editingId ? "✅ Berhasil diperbarui" : "✅ Berhasil ditambahkan");
      resetForm();
      await loadAssignments();
    }
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setTeamId("");
    setUnitId("");
    setPositionId("");
    setProfileId("");
  }

  function startEdit(a: Assignment) {
    setEditingId(a.id);
    setTeamId(a.team_id);
    setUnitId(a.unit_id || "");
    setPositionId(a.position_id);
    setProfileId(a.profile_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Hapus penugasan untuk: ${name}?`)) return;
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (!error) {
      setMessage("✅ Berhasil dihapus");
      loadAssignments();
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tight">Kelola Penugasan</h1>
          </div>
          {editingId && (
            <button onClick={resetForm} className="flex items-center gap-1 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition cursor-pointer">
              <X className="w-4 h-4" /> Batal Edit
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: FORM & FILTER */}
          <div className="lg:col-span-5 space-y-8">
            <div className={`p-8 rounded-3xl border-2 transition-all ${editingId ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`${editingId ? "bg-orange-400 text-white" : "bg-orange-100 text-orange-700"} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                {editingId ? <Edit3 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-black mb-2">{editingId ? "Edit Penugasan" : "Tambah Penugasan"}</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm">Tentukan tim, posisi, dan unit untuk anggota tertentu.</p>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2"><Briefcase className="w-3 h-3"/> Pilih Tim</label>
                  <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-all font-bold">
                    <option value="">-- Pilih Tim --</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2"><ShieldCheck className="w-3 h-3"/> Posisi</label>
                  <select value={positionId} onChange={(e) => setPositionId(e.target.value)} disabled={!teamId} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-all font-bold disabled:opacity-50">
                    <option value="">-- Pilih Posisi --</option>
                    {filteredPositions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {units.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2"> Unit (Opsional)</label>
                    <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-all font-bold">
                      <option value="">Tanpa Unit</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2"><UserCircle className="w-3 h-3"/> Pilih Anggota</label>
                  <select value={profileId} onChange={(e) => setProfileId(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-all font-bold">
                    <option value="">-- Pilih Anggota --</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.members.name} ({p.batches.year})</option>
                    ))}
                  </select>
                </div>

                <button onClick={handleSubmit} disabled={loading} className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${editingId ? "bg-orange-400 hover:bg-orange-400/80 text-white shadow-orange-200 cursor-pointer" : "bg-orange-400/80 hover:bg-orange-400 text-white shadow-slate-200 cursor-pointer"}`}>
                  {!loading && (editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                  {loading ? "Menyimpan..." : editingId ? "Perbarui Penugasan" : "Tambah Penugasan"}
                </button>

                {message && <div className={`p-4 rounded-xl text-xs font-bold text-center ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{message}</div>}
              </div>
            </div>

            {/* FILTER BOX */}
            <div className="p-8 rounded-3xl border-2 border-slate-200 bg-white">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Filter className="w-3 h-3"/> Filter Data</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Cari nama anggota..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-orange-300 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all" />
                </div>
                <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-orange-300 rounded-xl text-sm font-bold outline-none">
                  <option value="">Semua Tim</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-orange-300 rounded-xl text-sm font-bold outline-none">
                  <option value="">Semua Angkatan</option>
                  {uniqueBatches.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT: LIST */}
          <div className="lg:col-span-7">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              Daftar Penugasan <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{filteredAssignments.length}</span>
            </h3>

            <div className="space-y-4">
              {filteredAssignments.map((a) => (
                <div key={a.id} className={`group relative flex flex-col p-6 bg-white border-2 rounded-3xl transition-all duration-300 ${editingId === a.id ? "border-orange-400 ring-4 ring-orange-50" : "border-slate-100 hover:border-slate-300"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-12">
                      <h4 className="text-lg font-black text-slate-900 leading-tight">{a.member_profiles.members.name}</h4>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1">
                        Batch {a.member_profiles.batches.year} • Tahun Ke-{a.member_profiles.year_order}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => startEdit(a)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"><Edit3 className="w-5 h-5" /></button>
                      <button onClick={() => remove(a.id, a.member_profiles.members.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Struktur Tim</span>
                      <div className="text-sm font-bold text-slate-700">{a.teams.name}</div>
                      {a.team_units && <div className="text-[10px] font-bold text-orange-500">{a.team_units.name}</div>}
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Jabatan</span>
                      <span className="inline-block px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase">
                        {a.positions.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAssignments.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Tidak ada data yang ditemukan.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}