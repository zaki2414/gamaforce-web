"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function DataDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runDiagnostics() {
    setLoading(true);

    // 1. Count member_profiles
    const { count: profileCount } = await supabase
      .from("member_profiles")
      .select("*", { count: "exact", head: true });

    // 2. Get all member_profiles with relations
    const { data: profiles } = await supabase
      .from("member_profiles")
      .select(`
        id,
        member_id,
        batch_id,
        year_order,
        photo_url,
        members ( id, name ),
        batches ( id, year )
      `)
      .order("created_at", { ascending: false });

    // 3. Count assignments
    const { count: assignmentCount } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true });

    // 4. Get all assignments with relations
    const { data: assignments } = await supabase
      .from("assignments")
      .select(`
        id,
        team_id,
        position_id,
        profile_id,
        teams ( name ),
        positions ( name ),
        member_profiles (
          id,
          year_order,
          members ( name ),
          batches ( year )
        )
      `);

    // 5. Get unique profile_ids from assignments
    const profileIdsInAssignments = new Set(
      (assignments || []).map((a: any) => a.profile_id)
    );

    // 6. Get profile_ids from member_profiles
    const profileIdsInProfiles = new Set(
      (profiles || []).map((p: any) => p.id)
    );

    // 7. Check mismatches
    const assignmentProfileIds = Array.from(profileIdsInAssignments);
    const actualProfileIds = Array.from(profileIdsInProfiles);

    const inAssignmentsNotInProfiles = assignmentProfileIds.filter(
      id => !profileIdsInProfiles.has(id)
    );

    const inProfilesNotInAssignments = actualProfileIds.filter(
      id => !profileIdsInAssignments.has(id)
    );

    // 8. Analyze the profiles data structure
    const profileAnalysis = (profiles || []).map((p: any) => ({
      id: p.id,
      member_id: p.member_id,
      batch_id: p.batch_id,
      year_order: p.year_order,
      hasPhoto: !!p.photo_url,
      memberIsArray: Array.isArray(p.members),
      batchIsArray: Array.isArray(p.batches),
      memberValue: p.members,
      batchValue: p.batches,
    }));

    // 9. Count members
    const { count: memberCount } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    // 10. Get all members
    const { data: members } = await supabase
      .from("members")
      .select("id, name");

    setDiagnostics({
      counts: {
        profiles: profileCount,
        assignments: assignmentCount,
        members: memberCount,
      },
      profileData: {
        raw: profiles,
        analysis: profileAnalysis,
      },
      assignmentData: {
        raw: assignments,
        uniqueProfileIds: assignmentProfileIds,
      },
      memberData: members,
      mismatches: {
        inAssignmentsNotInProfiles,
        inProfilesNotInAssignments,
        hasMismatch: inAssignmentsNotInProfiles.length > 0 || inProfilesNotInAssignments.length > 0,
      },
      summary: {
        totalProfiles: profileCount,
        totalAssignments: assignmentCount,
        uniqueProfilesInAssignments: profileIdsInAssignments.size,
        orphanedAssignments: inAssignmentsNotInProfiles.length,
      },
    });

    setLoading(false);
  }

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (loading || !diagnostics) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-black text-white min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-xl">🔍 Running diagnostics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-black text-white min-h-screen">
      <Link href="/admin" className="text-yellow-400 hover:underline mb-6 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">🔬 Database Diagnostics</h1>

      <button
        onClick={runDiagnostics}
        className="mb-8 bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-700"
      >
        🔄 Re-run Diagnostics
      </button>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-900/20 border border-blue-500 rounded p-4">
          <div className="text-blue-400 text-sm mb-1">Total Member Profiles</div>
          <div className="text-3xl font-bold">{diagnostics.counts.profiles}</div>
        </div>
        <div className="bg-green-900/20 border border-green-500 rounded p-4">
          <div className="text-green-400 text-sm mb-1">Total Assignments</div>
          <div className="text-3xl font-bold">{diagnostics.counts.assignments}</div>
        </div>
        <div className="bg-purple-900/20 border border-purple-500 rounded p-4">
          <div className="text-purple-400 text-sm mb-1">Total Members</div>
          <div className="text-3xl font-bold">{diagnostics.counts.members}</div>
        </div>
      </div>

      {/* MISMATCH ALERT */}
      {diagnostics.mismatches.hasMismatch ? (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded">
          <h2 className="font-bold text-red-400 text-xl mb-3">⚠️ DATA MISMATCH DETECTED</h2>
          
          {diagnostics.mismatches.inAssignmentsNotInProfiles.length > 0 && (
            <div className="mb-3">
              <div className="font-bold text-red-300 mb-1">
                Profile IDs in Assignments but NOT in member_profiles (Orphaned):
              </div>
              <div className="text-sm font-mono bg-black/50 p-2 rounded">
                {diagnostics.mismatches.inAssignmentsNotInProfiles.map((id: string) => (
                  <div key={id}>{id}</div>
                ))}
              </div>
            </div>
          )}

          {diagnostics.mismatches.inProfilesNotInAssignments.length > 0 && (
            <div>
              <div className="font-bold text-yellow-300 mb-1">
                Profile IDs in member_profiles but NOT in Assignments:
              </div>
              <div className="text-sm font-mono bg-black/50 p-2 rounded">
                {diagnostics.mismatches.inProfilesNotInAssignments.map((id: string) => (
                  <div key={id}>{id}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 p-4 bg-green-900/20 border border-green-500 rounded">
          <div className="font-bold text-green-400">✅ No Orphaned Data Detected</div>
          <div className="text-sm text-gray-300 mt-1">
            All assignments reference valid member profiles.
          </div>
        </div>
      )}

      {/* PROFILE DATA ANALYSIS */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📊 Member Profiles ({diagnostics.profileData.raw?.length || 0})</h2>
        
        <div className="border border-white/20 rounded overflow-hidden">
          <div className="bg-white/10 p-3 font-bold text-sm grid grid-cols-7 gap-2">
            <div>ID</div>
            <div>Member</div>
            <div>Batch</div>
            <div>Year</div>
            <div>Photo</div>
            <div>Member Array?</div>
            <div>Batch Array?</div>
          </div>

          {/* PERBAIKAN: Menggunakan diagnostics.profileData.analysis */}
          {diagnostics.profileData?.analysis?.map((p: any) => (
            <div key={p.id} className="p-3 border-t border-white/10 grid grid-cols-7 gap-2 text-sm items-center">
              <div className="font-mono text-xs text-gray-400">{p.id.substring(0, 8)}...</div>
              <div>{p.memberValue?.name || p.memberValue?.[0]?.name || "NULL"}</div>
              <div>{p.batchValue?.year || p.batchValue?.[0]?.year || "NULL"}</div>
              <div>{p.year_order}</div>
              <div>{p.hasPhoto ? "✅" : "❌"}</div>
              <div className={p.memberIsArray ? "text-yellow-400" : "text-green-400"}>
                {p.memberIsArray ? "⚠️ YES" : "✅ NO"}
              </div>
              <div className={p.batchIsArray ? "text-yellow-400" : "text-green-400"}>
                {p.batchIsArray ? "⚠️ YES" : "✅ NO"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASSIGNMENTS DATA */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📋 Assignments ({diagnostics.assignmentData.raw?.length || 0})</h2>
        
        <div className="border border-white/20 rounded overflow-hidden">
          <div className="bg-white/10 p-3 font-bold text-sm grid grid-cols-5 gap-2">
            <div>Assignment ID</div>
            <div>Team</div>
            <div>Position</div>
            <div>Member Name</div>
            <div>Profile ID</div>
          </div>

          {diagnostics.assignmentData.raw?.map((a: any) => (
            <div key={a.id} className="p-3 border-t border-white/10 grid grid-cols-5 gap-2 text-sm items-center">
              <div className="font-mono text-xs text-gray-400">{a.id.substring(0, 8)}...</div>
              <div>{a.teams?.name || a.teams?.[0]?.name || "NULL"}</div>
              <div>{a.positions?.name || a.positions?.[0]?.name || "NULL"}</div>
              <div>
                {a.member_profiles?.members?.name || 
                 a.member_profiles?.members?.[0]?.name ||
                 a.member_profiles?.[0]?.members?.name ||
                 a.member_profiles?.[0]?.members?.[0]?.name ||
                 "NULL"}
              </div>
              <div className="font-mono text-xs text-gray-400">{a.profile_id.substring(0, 8)}...</div>
            </div>
          ))}
        </div>
      </div>

      {/* RAW DATA DUMPS */}
      <div className="space-y-6">
        <details className="border border-white/20 rounded">
          <summary className="p-4 bg-white/5 cursor-pointer font-bold">
            🔍 Raw member_profiles Data
          </summary>
          <pre className="p-4 text-xs overflow-auto bg-black">
            {JSON.stringify(diagnostics.profileData.raw, null, 2)}
          </pre>
        </details>

        <details className="border border-white/20 rounded">
          <summary className="p-4 bg-white/5 cursor-pointer font-bold">
            🔍 Raw assignments Data
          </summary>
          <pre className="p-4 text-xs overflow-auto bg-black">
            {JSON.stringify(diagnostics.assignmentData.raw, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}