"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SponsorsFooter from "@/components/home/SponsorFooter";

/* ---------- Helpers ---------- */
function groupByTeam(data: any[]) {
  const result: Record<string, any[]> = {};
  for (const item of data) {
    let teamName = item.teams?.name;
    
    if (item.positions?.name === "Head of Creative Media" || item.positions?.name === "Creative Media") {
      teamName = "Creative Media";
    } else if (item.positions?.name === "Head of Internal Manager" || item.positions?.name === "Internal Manager") {
      teamName = "Internal Manager";
    } else if (item.positions?.name === "Head of External Manager" || item.positions?.name === "External Manager") {
      teamName = "External Manager";
    }
    
    if (!result[teamName]) result[teamName] = [];
    result[teamName].push(item);
  }
  return result;
}

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
  variant = "blue",
}: {
  item: any;
  variant?: "gold" | "blue" | "gray";
}) {
  const colors = {
    gold: "bg-[#E6B52C] text-[#1C2B5A]",
    blue: "bg-[#1C2B5A] text-white",
    gray: "bg-[#cfd6e6] text-[#1C2B5A]",
  };

  const photoUrl = item.member_profiles?.photo_url;
  const photo = photoUrl && photoUrl.trim() !== ""
    ? photoUrl.replace(
        "/upload/",
        "/upload/c_thumb,g_face,z_0.3,w_350,h_380/"
      )
    : null;

  return (
    <div className="relative group w-full max-w-70 mx-auto">
      <div className="absolute -inset-2 bg-[#E6B52C]/40 blur-xl opacity-0 group-hover:opacity-100 transition duration-300" />
      <div className={`${colors[variant]} relative rounded-2xl p-4 shadow-xl h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1`}>
        <div className="w-full aspect-4/5 rounded-xl overflow-hidden bg-black/20 mb-4">
          {photo ? (
            <img
              src={photo}
              className="w-full h-full object-cover"
              alt={item.member_profiles?.members?.name || "Member"} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== photoUrl) {
                  target.src = photoUrl;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs opacity-50 font-sans">
              NO PHOTO
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-center mb-1 line-clamp-2 font-sans text-sm sm:text-base">
              {item.member_profiles?.members?.name || "Unknown"}
            </div>
            <div className="text-xs sm:text-sm opacity-80 text-center mb-2 line-clamp-1 font-sans">
              {item.positions?.name || "-"}
            </div>
          </div>
          <div className="text-[10px] sm:text-xs opacity-70 text-center line-clamp-2 font-sans">
            {item.member_profiles?.members?.programs?.name || "-"} – {item.member_profiles?.members?.program_batch || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function ManagementPage() {
  const [group, setGroup] = useState<any>(null);
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("teams")
      .select("id, name, tagline, description, logo_path")
      .eq("type", "group")
      .single()
      .then(({ data }) => setGroup(data));
  }, []);

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

  useEffect(() => {
    if (!year || !group) return;
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

      const { data: managementAssignments } = await supabase
        .from("assignments")
        .select(`
          id,
          team_id,
          position_id,
          profile_id,
          
          teams!assignments_team_id_fkey (
            id,
            name,
            type
          ),
          
          positions!assignments_position_id_fkey (
            id,
            name,
            priority
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
        .eq("group_id", group.id);

      const { data: subteamManagers } = await supabase
        .from("assignments")
        .select(`
          id,
          team_id,
          position_id,
          profile_id,
          
          teams!assignments_team_id_fkey (
            id,
            name,
            type
          ),
          
          positions!assignments_position_id_fkey (
            id,
            name,
            priority
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
        .in("position_id", [
          "80e03d88-ab61-4be1-844e-c2fed0167305", // Internal Manager
          "65a5f8af-992f-4b91-a132-5b0478c773e9", // Creative Media
          "4e1cd542-40db-4358-a144-7720135d3973", // External Manager
        ]);

      const { data: phHeads } = await supabase
        .from("assignments")
        .select(`
          id,
          team_id,
          position_id,
          profile_id,
          
          teams!assignments_team_id_fkey (
            id,
            name,
            type
          ),
          
          positions!assignments_position_id_fkey (
            id,
            name,
            priority
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
        .in("position_id", [
          "6d0ab4ee-95fb-4a72-99fe-9f0937070851", // Head of Creative Media
          "21b79f16-8666-4e53-a7d0-5885eb13093c", // Head of Internal Manager
          "2459ddcc-5d4a-4dc7-8a7c-092c69d44f1e", // Head of External Manager
        ]);

      const allAssignments = [
        ...(managementAssignments || []),
        ...(subteamManagers || []),
        ...(phHeads || []),
      ];

      if (!allAssignments.length) {
        setData([]);
        setLoading(false);
        return;
      }

      const filtered = allAssignments
        .filter((a: any) => a.member_profiles?.batch_id === batch.id)
        .map((a: any) => ({
          ...a,
          teams: Array.isArray(a.teams) ? a.teams[0] : a.teams,
          positions: Array.isArray(a.positions) ? a.positions[0] : a.positions,
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
  }, [year, group]);

  const teamOrder = ["Creative Media", "Internal Manager", "External Manager"];
  const grouped = Object.entries(groupByTeam(data))
    .sort(([a], [b]) => {
      const ai = teamOrder.indexOf(a);
      const bi = teamOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map(([team, members]) => {
      const sorted = members.sort((a: any, b: any) => {
        const isPHa = a.positions?.name?.startsWith("Head of") ? 0 : 1;
        const isPHb = b.positions?.name?.startsWith("Head of") ? 0 : 1;
        return isPHa - isPHb;
      });
      
      const leader = sorted.filter((m: any) => 
        m.positions?.name?.startsWith("Head of") || m.positions?.priority === 1
      );
      const staff = sorted.filter((m: any) => 
        !m.positions?.name?.startsWith("Head of") && m.positions?.priority !== 1
      );
      
      return { team, leader, staff };
    });

  return (
    <div className="bg-white min-h-screen gf-grid">
      {/* HERO */}
      <div className="relative px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 bg-[#0F1E3D] text-white overflow-hidden">
        <div className="absolute -top-40 -left-40 w-125 h-125 sm:w-150 sm:h-150 bg-[#E6B52C]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-100 h-100 sm:w-125 sm:h-125 bg-white/10 blur-[100px] rounded-full" />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 font-title">
              {group ? group.name : <div className="h-10 sm:h-12 bg-white/10 animate-pulse rounded-lg w-3/4" />}
            </h1>
            <div className="text-[#E6B52C] font-bold mb-4 font-sans text-sm sm:text-base">
              {group ? group.tagline : <div className="h-5 bg-white/10 animate-pulse rounded w-1/2" />}
            </div>
            <div className="text-white/80 max-w-xl font-sans text-sm sm:text-base">
              {group ? group.description : (
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 animate-pulse rounded w-full" />
                  <div className="h-4 bg-white/10 animate-pulse rounded w-5/6" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center order-2 md:order-1">
            {group?.logo_path ? (
              <img 
                src={supabase.storage.from("subteam-logo").getPublicUrl(group.logo_path.trim()).data.publicUrl} 
                className="w-40 sm:w-48 md:w-56 lg:w-64 drop-shadow-2xl" 
                alt={group.name}
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-white/10 animate-pulse rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 md:px-8 py-8 md:py-10 max-w-7xl mx-auto">
        {/* Year Tabs - Responsive Horizontal Scroll */}
        <div className="mb-12 md:mb-16 overflow-hidden">
          <div className="w-full min-h-12 bg-[#E6B52C] rounded-md flex items-end px-4 sm:px-6 md:px-8 gap-6 sm:gap-8 md:gap-12 font-title overflow-x-auto scrollbar-hide">
            {years.length > 0 ? years.map((y) => (
              <button 
                key={y} 
                onClick={() => setYear(y)} 
                className={`pb-2 text-base sm:text-lg whitespace-nowrap transition duration-300 cursor-pointer ${
                  year === y 
                  ? "text-[#1C2B5A] border-b-4 border-[#1C2B5A]" 
                  : "text-white hover:text-[#886600]"
                }`}
              >
                {y}
              </button>
            )) : <div className="h-8 w-20 bg-white/20 animate-pulse rounded mb-2" />}
          </div>
        </div>

        {loading ? (
          <div className="space-y-24 md:space-y-32">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 sm:h-10 bg-gray-200 rounded-md w-40 sm:w-48 mb-8 md:mb-12 mx-auto" />
                <div className="flex justify-center mb-12 md:mb-16"><MemberCardSkeleton /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 justify-items-center">
                  <MemberCardSkeleton />
                  <MemberCardSkeleton />
                  <MemberCardSkeleton />
                  <MemberCardSkeleton />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {data.length === 0 && (
              <p className="text-[#1C2B5A] text-center font-bold text-lg sm:text-xl py-20 md:py-24 font-sans">
                No data for this year.
              </p>
            )}
            {grouped.map(({ team, leader, staff }) => (
              <section key={team} className="mb-12 md:mb-16 last:mb-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-center font-extrabold text-[#1C2B5A] mb-8 md:mb-12 font-title">
                  {team}
                </h2>
                
                {/* Leaders - Always Center */}
                {leader.length > 0 && (
                  <div className="mb-16 md:mb-24 flex justify-center">
                    {leader.map((item) => (
                      <MemberCard key={item.id} item={item} variant="gold" />
                    ))}
                  </div>
                )}
                
                {/* Staff Members - Responsive Grid: 1 → 2 → 4 columns */}
                {staff.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-10">
                    {staff.map((item, i) => (
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
              </section>
            ))}
          </>
        )}
      </div>
      <SponsorsFooter />

      <style jsx global>{`
        /* Hide scrollbar for year tabs */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}