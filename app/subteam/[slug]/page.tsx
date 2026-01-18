///subteam/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ---------- Skeleton Card ---------- */
function MemberCardSkeleton() {
  return (
    <div className="w-full max-w-70">
      <div className="bg-gray-200 animate-pulse rounded-2xl p-4 shadow-xl h-full">
        <div className="w-full aspect-4/5 rounded-xl bg-gray-300 mb-4" />
        <div className="h-5 bg-gray-300 rounded w-3/4 mx-auto mb-2" />
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2" />
        <div className="h-3 bg-gray-300 rounded w-2/3 mx-auto" />
      </div>
    </div>
  );
}

/* ---------- Member Card Real ---------- */
function MemberCard({
  item,
  variant = "gold",
}: {
  item: any;
  variant?: "gold" | "blue" | "gray";
}) {
  const colors = {
    gold: "bg-[#E6B52C] text-[#1C2B5A]",
    blue: "bg-[#1C2B5A] text-white",
    gray: "bg-[#cfd6e6] text-[#1C2B5A]",
  };

  const photo =
    item.member_profiles?.photo_url &&
    item.member_profiles.photo_url.replace(
      "/upload/",
      "/upload/c_thumb,g_face,z_0.3,w_350,h_380/"
    );

  return (
    <div className="relative group w-full max-w-70 mx-auto">
      <div className="absolute -inset-2 bg-[#E6B52C]/40 blur-xl opacity-0 group-hover:opacity-100 transition" />
      <div className={`${colors[variant]} relative rounded-2xl p-4 shadow-xl h-full flex flex-col`}>
        {/* Photo dengan aspect ratio konsisten */}
        <div className="w-full aspect-4/5 rounded-xl overflow-hidden bg-black/20 mb-4">
          {photo && (
            <img 
              src={photo}
              className="w-full h-full object-cover" 
              alt={item.member_profiles.members.name} 
            />
          )}
        </div>
        
        {/* Content dengan height yang flexible */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-center mb-1 line-clamp-2">
              {item.member_profiles?.members?.name || "Unknown"}
            </div>
            <div className="text-sm opacity-80 text-center mb-1 line-clamp-1">
              {item.positions?.name || "-"}
            </div>
          </div>
          <div className="text-xs opacity-70 text-center line-clamp-2">
            {item.member_profiles?.members?.programs?.name || "-"} – {item.member_profiles?.members?.program_batch || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubteamDetailPage() {
  const { slug } = useParams();
  const [team, setTeam] = useState<any>(null);
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Load Team ---------- */
  useEffect(() => {
    supabase
      .from("teams")
      .select("id, name, tagline, description, logo_path")
      .eq("slug", slug)
      .single()
      .then(({ data }) => setTeam(data));
  }, [slug]);

  /* ---------- Load Years ---------- */
  useEffect(() => {
    supabase
      .from("batches")
      .select("year")
      .order("year", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []).map((b) => b.year);
        setYears(list);
        if (list.length > 0) setYear(list[0]);
      });
  }, []);

  /* ---------- Load Assignments with Units ---------- */
  useEffect(() => {
    if (!year || !team) return;
    async function load() {
      setLoading(true);
      
      const { data: batch } = await supabase
        .from("batches")
        .select("id")
        .eq("year", year)
        .single();
      
      if (!batch) {
        setData([]);
        setLoading(false);
        return;
      }

      const { data: assignments } = await supabase
        .from("assignments")
        .select(`
          id,
          team_id,
          position_id,
          profile_id,
          unit_id,
          
          positions!assignments_position_id_fkey (
            id,
            name,
            priority
          ),
          
          team_units!assignments_unit_id_fkey (
            id,
            name,
            order_index
          ),
          
          member_profiles!assignments_profile_id_fkey (
            id,
            year_order,
            batch_id,
            photo_url,
            members!member_profiles_member_id_fkey (
              id,
              name,
              program_batch,
              programs!members_program_id_fkey (
                name
              )
            )
          )
        `)
        .eq("team_id", team.id)
        .order("id");

      if (!assignments) {
        setData([]);
        setLoading(false);
        return;
      }

      const filtered = assignments
        .filter((a: any) => a.member_profiles?.batch_id === batch.id)
        .map((a: any) => ({
          ...a,
          positions: Array.isArray(a.positions) ? a.positions[0] : a.positions,
          team_units: Array.isArray(a.team_units) ? a.team_units[0] : a.team_units,
          member_profiles: {
            ...a.member_profiles,
            members: Array.isArray(a.member_profiles?.members) 
              ? a.member_profiles.members[0] 
              : a.member_profiles?.members,
          }
        }))
        .sort((a: any, b: any) => {
          const priorityA = a.positions?.priority || 999;
          const priorityB = b.positions?.priority || 999;
          return priorityA - priorityB;
        });

      setData(filtered);
      setLoading(false);
    }
    load();
  }, [year, team]);

  /* ---------- Derived Data ---------- */
  const hasUnits = data.some((m) => m.unit_id);

  let leader: any[] = [];
  let membersList: any[] = [];
  let unitsMap: Record<string, any[]> = {};

  if (hasUnits) {
    const NON_UNIT_POSITION_IDS = [
      "26f7beca-7014-4db7-a2f8-9597b8d23ed7", // Team Leader
      "00e981f7-cebe-41fc-9a5a-c889b8d4df89", // Pilot
      "65a5f8af-992f-4b91-a132-5b0478c773e9", // Creative Media
    ];

    const mainTeamMembers = data.filter((m) => 
      !m.unit_id && NON_UNIT_POSITION_IDS.includes(m.position_id)
    );
    
    const unitMembers = data.filter((m) => m.unit_id);

    leader = mainTeamMembers.filter((m) => m.positions?.priority === 1);
    membersList = mainTeamMembers.filter((m) => m.positions?.priority !== 1);

    unitMembers.forEach((m) => {
      const key = m.unit_id || "no-unit";
      if (!unitsMap[key]) unitsMap[key] = [];
      unitsMap[key].push(m);
    });
  } else {
    leader = data.filter((m) => m.positions?.priority === 1);
    membersList = data.filter((m) => m.positions?.priority !== 1);
  }

  return (
    <div className="min-h-screen bg-white gf-grid">
      {/* HERO */}
      <div className="relative px-8 py-15 bg-[#E6B52C] text-[#1C2B5A] overflow-hidden">
        <div className="absolute -top-40 -left-40 w-125 h-125 bg-white/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-white/30 blur-[100px] rounded-full" />

        <div className="relative max-w-6xl mx-auto">
          <Link 
            href="/subteam" 
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-[#1C2B5A] text-white rounded-full text-sm font-bold shadow-lg hover:bg-[#1C2B5A]/80 transition duration-300 group"
          >
            <span className="group-hover:-translate-x-1 transition duration-300">←</span> 
            Back to Subteams
          </Link>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-extrabold mb-4 leading-tight">
                {team ? team.name : <div className="h-12 bg-black/10 animate-pulse rounded-lg w-3/4" />}
              </h1>
              <div className="text-[#1C2B5A] font-bold mb-4 opacity-90 text-lg">
                {team ? team.tagline : <div className="h-5 bg-black/10 animate-pulse rounded w-1/2" />}
              </div>
              <div className="text-[#1C2B5A]/80 max-w-xl font-medium leading-relaxed">
                {team ? team.description : (
                  <div className="space-y-2">
                    <div className="h-4 bg-black/10 animate-pulse rounded w-full" />
                    <div className="h-4 bg-black/10 animate-pulse rounded w-5/6" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              {team?.logo_path ? (
                <img
                  src={supabase.storage.from("subteam-logo").getPublicUrl(team.logo_path).data.publicUrl}
                  className="w-75 drop-shadow-2xl brightness-95 contrast-110"
                  alt={team.name}
                />
              ) : (
                <div className="w-64 h-64 bg-black/10 animate-pulse rounded-full" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-8 py-10 max-w-7xl mx-auto">
        {/* Year Tabs */}
        <div className="mb-10">
          <div className="w-full h-12 bg-[#1C2B5A] rounded-md flex items-end px-8 gap-12 shadow-xl">
            {years.length > 0 ? (
              years.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`pb-2 text-lg font-bold transition duration-300 ${
                    year === y
                      ? "text-[#E6B52C] border-b-4 border-[#E6B52C] cursor-pointer"
                      : "text-white/60 hover:text-white cursor-pointer"
                  }`}
                >
                  {y}
                </button>
              ))
            ) : (
              <div className="h-8 w-20 bg-white/20 animate-pulse rounded mb-2" />
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-24">
            <div className="flex justify-center"><MemberCardSkeleton /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 place-items-center">
              {[...Array(4)].map((_, i) => <MemberCardSkeleton key={i} />)}
            </div>
          </div>
        ) : (
          <>
            {data.length === 0 && <p className="text-[#1C2B5A] text-center font-bold text-xl py-20">No data for this year.</p>}
            
            {/* TEAM LEADER */}
            {leader.length > 0 && (
              <div className="mb-15 flex justify-center">
                <MemberCard item={leader[0]} variant="gold" />
              </div>
            )}

            {/* MEMBERS (non-leader, non-unit) */}
            {membersList.length > 0 && (
              // HAPUS logic ternary. Selalu gunakan justify-center.
              <div className="mb-24 flex flex-wrap justify-center gap-10">
                {membersList.map((item, i) => (
                  // KALKULASI:
                  // sm (2 col): 50% dikurangi setengah gap (20px)
                  // lg (4 col): 25% dikurangi 3/4 gap (30px) agar pas 4 biji
                  <div
                    key={item.id}
                    className="w-full sm:w-[calc(50%-20px)] lg:w-[calc(25%-30px)] flex justify-center"
                  >
                    <MemberCard
                      item={item}
                      variant={i % 3 === 0 ? "gold" : i % 3 === 1 ? "blue" : "gray"}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* UNITS SECTION */}
            {hasUnits && Object.keys(unitsMap).length > 0 && (
              <>
                {Object.values(unitsMap)
                  .sort((a: any[], b: any[]) => {
                    const orderA = a[0]?.team_units?.order_index ?? 999;
                    const orderB = b[0]?.team_units?.order_index ?? 999;
                    return orderA - orderB;
                  })
                  .map((unitMembersList: any[]) => {
                    const unitLeader = unitMembersList.filter(
                      (m) => m.positions?.priority === 1
                    );
                    const unitStaff = unitMembersList.filter(
                      (m) => m.positions?.priority !== 1
                    );

                    return (
                      <div
                        key={unitMembersList[0]?.unit_id || "no-unit"}
                        className="mb-24"
                      >
                        <h2 className="text-3xl font-extrabold mb-10 text-center text-[#1C2B5A]">
                          {unitMembersList[0]?.team_units?.name || "No Unit"}
                        </h2>

                        {unitLeader.length > 0 && (
                          <div className="mb-12 flex justify-center">
                            <MemberCard item={unitLeader[0]} variant="gold" />
                          </div>
                        )}

                        {unitStaff.length > 0 && (
                          // UPDATE DISINI: Selalu justify-center tanpa syarat
                          <div className="flex flex-wrap justify-center gap-10">
                            {unitStaff.map((item, i) => (
                              // Width Calculation tetap dipertahankan
                              <div
                                key={item.id}
                                className="w-full sm:w-[calc(50%-20px)] lg:w-[calc(25%-30px)] flex justify-center"
                              >
                                <MemberCard
                                  item={item}
                                  variant={
                                    i % 3 === 0
                                      ? "gold"
                                      : i % 3 === 1
                                      ? "blue"
                                      : "gray"
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}