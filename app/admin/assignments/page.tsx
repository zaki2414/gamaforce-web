"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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

/* ================= PAGE ================= */

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

    loadAssignments();
  }

  /* ================= LOAD UNITS ================= */

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
        setUnitId("");
      });
  }, [teamId]);

  /* ================= LOAD ASSIGNMENTS ================= */

  async function loadAssignments() {
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id,
        team_id,
        position_id,
        profile_id,
        unit_id,

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

    if (error) {
      setAssignments([]);
      setMessage(error.message);
      return;
    }

    setAssignments(
      (data || []).map((a: any) => ({
        ...a,
        teams: Array.isArray(a.teams) ? a.teams[0] : a.teams,
        positions: Array.isArray(a.positions) ? a.positions[0] : a.positions,
        team_units: Array.isArray(a.team_units) ? a.team_units[0] : a.team_units,
        member_profiles: Array.isArray(a.member_profiles)
          ? a.member_profiles[0]
          : a.member_profiles,
      }))
    );
  }

  /* ================= FILTER POSITIONS ================= */

  const selectedTeam = teams.find((t) => t.id === teamId);

  const filteredPositions = positions.filter((p) => {
    if (!selectedTeam) return false;
    if (selectedTeam.type === "ph") return p.scope === "ph";
    if (selectedTeam.type === "management") return p.scope === null;
    if (selectedTeam.type === "subteam") return p.scope === "subteam" || p.scope === null;
    return false;
  });

  /* ================= FILTER & SORT ASSIGNMENTS ================= */

const filteredAssignments = useMemo(() => {
  let filtered = [...assignments]; // Buat copy array agar tidak mutasi state asli

  // 1. Filter berdasarkan nama
  if (searchName) {
    filtered = filtered.filter((a) =>
      a.member_profiles.members.name.toLowerCase().includes(searchName.toLowerCase())
    );
  }

  // 2. Filter berdasarkan team
  if (filterTeam) {
    filtered = filtered.filter((a) => a.team_id === filterTeam);
  }

  // 3. Filter berdasarkan batch
  if (filterBatch) {
    filtered = filtered.filter(
      (a) => a.member_profiles.batches.year.toString() === filterBatch
    );
  }

  // 4. SORTING BERDASARKAN NAMA (A-Z)
  filtered.sort((a, b) => {
    const nameA = a.member_profiles.members.name.toUpperCase();
    const nameB = b.member_profiles.members.name.toUpperCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  return filtered;
}, [assignments, searchName, filterTeam, filterBatch]);

  const uniqueBatches = useMemo(() => {
    const batches = assignments.map((a) => a.member_profiles.batches.year);
    return [...new Set(batches)].sort((a, b) => b - a);
  }, [assignments]);

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!teamId || !positionId || !profileId) {
      setMessage("⚠️ Lengkapi semua field wajib");
      return;
    }

    const payload = {
      team_id: teamId,
      position_id: positionId,
      profile_id: profileId,
      unit_id: unitId || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("assignments")
        .update(payload)
        .eq("id", editingId);

      if (error) return setMessage(error.message);
      setMessage("✅ Assignment updated");
    } else {
      const { error } = await supabase.from("assignments").insert(payload);
      if (error) return setMessage(error.message);
      setMessage("✅ Assignment created");
    }

    resetForm();
    loadAssignments();
  }

  function resetForm() {
    setEditingId(null);
    setTeamId("");
    setUnitId("");
    setPositionId("");
    setProfileId("");
  }

  function handleEdit(a: Assignment) {
    setEditingId(a.id);
    setTeamId(a.team_id);
    setUnitId(a.unit_id || "");
    setPositionId(a.position_id);
    setProfileId(a.profile_id);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this assignment?")) return;
    await supabase.from("assignments").delete().eq("id", id);
    loadAssignments();
  }

  function clearFilters() {
    setSearchName("");
    setFilterTeam("");
    setFilterBatch("");
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar Sticky */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {editingId ? "Edit Assignment" : "Member Assignments"}
            </h1>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full">
            {assignments.length} Total Data
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: FORM & FILTERS */}
          <div className="lg:col-span-4 space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Input Data</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">TEAM *</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  >
                    <option value="">Select Team</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">POSITION *</label>
                  <select
                    value={positionId}
                    onChange={(e) => setPositionId(e.target.value)}
                    disabled={!teamId}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50 outline-none"
                  >
                    <option value="">Select Position</option>
                    {filteredPositions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {units.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">UNIT</label>
                    <select
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">(No Unit)</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">MEMBER *</label>
                  <select
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Member</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.members.name} ({p.batches.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                  >
                    {editingId ? "Update Data" : "Save Assignment"}
                  </button>
                  {editingId && (
                    <button onClick={resetForm} className="w-full mt-2 py-2 text-gray-500 text-sm font-semibold hover:text-gray-800 transition">
                      Cancel Edit
                    </button>
                  )}
                </div>
                {message && (
                  <div className={`text-center text-xs font-bold p-3 rounded-xl ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Filters</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                  value={filterTeam} 
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">All Teams</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select 
                  value={filterBatch} 
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="">All Batches</option>
                  {uniqueBatches.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {(searchName || filterTeam || filterBatch) && (
                  <button onClick={clearFilters} className="w-full text-xs font-bold text-red-500 hover:underline pt-2">
                    CLEAR ALL FILTERS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DATA TABLE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Member Info</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Team / Unit</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Position</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAssignments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-gray-400 font-medium">
                          No assignments match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAssignments.map((a) => (
                        <tr key={a.id} className="hover:bg-blue-50/40 transition-colors group">
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{a.member_profiles.members.name}</div>
                            <div className="text-[10px] font-bold text-gray-400">BATCH {a.member_profiles.batches.year} • YEAR {a.member_profiles.year_order}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-bold text-gray-700">{a.teams.name}</div>
                            {a.team_units && <div className="text-[10px] font-bold text-blue-500">{a.team_units.name}</div>}
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-tighter">
                              {a.positions.name}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEdit(a)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(a.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
              Internal Admin Tool • Powered by Supabase
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}