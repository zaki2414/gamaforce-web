"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  // Form States
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState("");
  const [programBatch, setProgramBatch] = useState("");

  // Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingProgramId, setEditingProgramId] = useState("");
  const [editingProgramBatch, setEditingProgramBatch] = useState("");

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterBatch, setFilterBatch] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  /* ================= LOAD DATA ================= */

  async function loadData() {
    setLoading(true);
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
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ================= FILTER & SORT MEMBERS ================= */

  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    if (searchName) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterProgram) {
      filtered = filtered.filter((m) => m.programs?.id === filterProgram);
    }

    if (filterBatch) {
      filtered = filtered.filter((m) => m.program_batch.toString() === filterBatch);
    }

    // Selalu urutkan A-Z
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [members, searchName, filterProgram, filterBatch]);

  const uniqueBatches = useMemo(() => {
    const batches = members.map((m) => m.program_batch);
    return [...new Set(batches)].sort((a, b) => b - a);
  }, [members]);

  /* ================= ACTIONS ================= */

  async function addMember() {
    if (!name || !programId || !programBatch) {
      setMessage("⚠️ Lengkapi semua field");
      return;
    }

    const { error } = await supabase.from("members").insert({
      name,
      program_id: programId,
      program_batch: Number(programBatch),
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Member berhasil ditambahkan");
      setName("");
      setProgramId("");
      setProgramBatch("");
      loadData();
    }
  }

  function startEdit(m: Member) {
    setEditingId(m.id);
    setEditingName(m.name);
    setEditingProgramId(m.programs?.id ?? "");
    setEditingProgramBatch(String(m.program_batch));
    setMessage(""); // Clear message saat mulai edit
  }

  async function saveEdit() {
    if (!editingName || !editingProgramId || !editingProgramBatch) {
      setMessage("⚠️ Lengkapi semua field");
      return;
    }

    const { error } = await supabase
      .from("members")
      .update({
        name: editingName,
        program_id: editingProgramId,
        program_batch: Number(editingProgramBatch),
      })
      .eq("id", editingId);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Member berhasil diupdate");
      setEditingId(null);
      loadData();
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditingProgramId("");
    setEditingProgramBatch("");
  }

  async function deleteMember(id: string, name: string) {
    if (!confirm(`Hapus ${name}? Semua data terkait akan hilang.`)) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) setMessage(`❌ ${error.message}`);
    else {
      setMessage("✅ Member berhasil dihapus");
      loadData();
    }
  }

  /* ================= UI ================= */

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
      Loading Members...
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium text-sm"
            >
              ← Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              {editingId ? "Edit Member Mode" : "Manage Members"}
            </h1>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full">
            {members.length} Total
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: FORM & FILTER */}
          <div className="lg:col-span-4 space-y-6">
            {/* Input Card */}
            <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${editingId ? 'border-blue-400 ring-4 ring-blue-50' : 'border-gray-200'}`}>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                {editingId ? "Modify Member" : "Add New Member"}
              </h2>
              <div className="space-y-4">
                <input
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Full Name"
                  value={editingId ? editingName : name}
                  onChange={(e) => editingId ? setEditingName(e.target.value) : setName(e.target.value)}
                />
                <select
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={editingId ? editingProgramId : programId}
                  onChange={(e) => editingId ? setEditingProgramId(e.target.value) : setProgramId(e.target.value)}
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input
                  type="number"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Batch (e.g. 2025)"
                  value={editingId ? editingProgramBatch : programBatch}
                  onChange={(e) => editingId ? setEditingProgramBatch(e.target.value) : setProgramBatch(e.target.value)}
                />
                
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={editingId ? saveEdit : addMember}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                  >
                    {editingId ? "Save Changes" : "Register Member"}
                  </button>
                  {editingId && (
                    <button onClick={cancelEdit} className="w-full py-2 text-gray-500 text-sm font-bold hover:text-gray-800 transition">
                      Cancel Editing
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
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">🔍 Quick Filter</h2>
              <div className="space-y-3">
                <input
                  placeholder="Search name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                />
                <select 
                  value={filterProgram} 
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="">All Programs</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select 
                  value={filterBatch} 
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="">All Batches</option>
                  {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {(searchName || filterProgram || filterBatch) && (
                  <button onClick={() => {setSearchName(""); setFilterProgram(""); setFilterBatch("");}} className="w-full text-xs font-bold text-red-500 hover:underline pt-2">
                    CLEAR FILTERS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: TABLE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Member Name</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase">Details</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-20 text-center text-gray-400 font-medium italic">
                          No matching members found.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m.id} className={`hover:bg-blue-50/40 transition-colors group ${editingId === m.id ? 'bg-blue-50/60' : ''}`}>
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{m.name}</div>
                            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">ID: {m.id.substring(0, 13)}...</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-semibold text-gray-700">{m.programs?.name || "No Program"}</div>
                            <div className="text-[10px] font-bold text-blue-500 uppercase">Batch {m.program_batch}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => startEdit(m)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button 
                                onClick={() => deleteMember(m.id, m.name)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                title="Delete"
                              >
                                🗑
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
              Member Database • Secured by Supabase
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}