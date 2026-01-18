"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type OrphanedAssignment = {
  id: string;
  team_id: string;
  position_id: string;
  profile_id: string;
  issue: string;
};

export default function DataCleanupPage() {
  const [orphanedAssignments, setOrphanedAssignments] = useState<OrphanedAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function checkOrphans() {
    setLoading(true);
    setMessage("🔍 Checking for orphaned data...");

    // Get all assignments
    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, team_id, position_id, profile_id");

    // Get all valid profile IDs
    const { data: profiles } = await supabase
      .from("member_profiles")
      .select("id");

    const validProfileIds = new Set((profiles || []).map(p => p.id));

    // Find orphans
    const orphans: OrphanedAssignment[] = [];
    
    for (const assignment of assignments || []) {
      if (!validProfileIds.has(assignment.profile_id)) {
        orphans.push({
          ...assignment,
          issue: "Profile ID does not exist in member_profiles table"
        });
      }
    }

    setOrphanedAssignments(orphans);
    setMessage(`✅ Found ${orphans.length} orphaned assignments`);
    setLoading(false);
  }

  async function deleteOrphan(id: string) {
    if (!confirm("Delete this orphaned assignment?")) return;

    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setMessage("✅ Deleted orphaned assignment");
      checkOrphans(); // Re-check
    }
  }

  async function cleanupAllOrphans() {
    if (!confirm(`Delete ALL ${orphanedAssignments.length} orphaned assignments?`)) return;

    setLoading(true);
    setMessage("🗑️ Deleting orphaned assignments...");

    let deleted = 0;
    for (const orphan of orphanedAssignments) {
      await supabase.from("assignments").delete().eq("id", orphan.id);
      deleted++;
    }

    setMessage(`✅ Deleted ${deleted} orphaned assignments`);
    checkOrphans();
  }

  useEffect(() => {
    checkOrphans();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-black text-white min-h-screen">
      <Link href="/admin" className="text-yellow-400 hover:underline">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold my-6">🧹 Data Cleanup Tool</h1>

      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500 rounded">
        <p className="text-blue-400">{message}</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={checkOrphans}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          🔍 Re-check Orphans
        </button>

        {orphanedAssignments.length > 0 && (
          <button
            onClick={cleanupAllOrphans}
            disabled={loading}
            className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50"
          >
            🗑️ Delete All Orphans ({orphanedAssignments.length})
          </button>
        )}
      </div>

      {/* ORPHANED ASSIGNMENTS TABLE */}
      <h2 className="text-xl font-bold mb-4">
        Orphaned Assignments ({orphanedAssignments.length})
      </h2>

      {orphanedAssignments.length === 0 ? (
        <div className="p-8 text-center bg-green-900/20 border border-green-500 rounded">
          <p className="text-green-400 text-lg">✅ No orphaned assignments found!</p>
          <p className="text-gray-400 text-sm mt-2">All assignments reference valid member profiles.</p>
        </div>
      ) : (
        <div className="border border-white/20 rounded overflow-hidden">
          <div className="grid grid-cols-5 p-3 bg-white/10 font-bold text-sm">
            <div>Assignment ID</div>
            <div>Team ID</div>
            <div>Position ID</div>
            <div>Profile ID (Missing)</div>
            <div>Actions</div>
          </div>

          {orphanedAssignments.map(orphan => (
            <div key={orphan.id} className="grid grid-cols-5 p-3 border-t border-white/10 items-center hover:bg-white/5">
              <div className="text-xs font-mono text-gray-400">{orphan.id.substring(0, 8)}...</div>
              <div className="text-xs font-mono text-gray-400">{orphan.team_id.substring(0, 8)}...</div>
              <div className="text-xs font-mono text-gray-400">{orphan.position_id.substring(0, 8)}...</div>
              <div className="text-xs font-mono text-red-400">{orphan.profile_id.substring(0, 8)}...</div>
              <div>
                <button
                  onClick={() => deleteOrphan(orphan.id)}
                  className="text-red-400 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INFO BOX */}
      <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500 rounded">
        <h3 className="font-bold text-yellow-400 mb-2">ℹ️ About Orphaned Assignments</h3>
        <p className="text-sm text-gray-300">
          Orphaned assignments are records in the <code className="bg-black px-1">assignments</code> table 
          that reference a <code className="bg-black px-1">profile_id</code> that no longer exists 
          in the <code className="bg-black px-1">member_profiles</code> table.
        </p>
        <p className="text-sm text-gray-300 mt-2">
          This usually happens when a member profile is deleted but its assignments are not removed.
        </p>
      </div>
    </div>
  );
}