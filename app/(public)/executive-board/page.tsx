"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SponsorsFooter from "@/components/home/SponsorFooter";

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

  // FIX: Pastikan photo_url ada dan valid sebelum transformasi
  const photoUrl = item.member_profiles?.photo_url;
  const photo = photoUrl && photoUrl.trim() !== ""
    ? photoUrl.replace(
        "/upload/",
        "/upload/c_thumb,g_face,z_0.3,w_350,h_380/"
      )
    : null;

  return (
    <div className="relative group w-full max-w-70 mx-auto">
      <div className="absolute -inset-2 bg-[#E6B52C]/40 blur-xl opacity-0 group-hover:opacity-100 transition" />
      <div className={`${colors[variant]} relative rounded-2xl p-4 shadow-xl h-full flex flex-col`}>
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
            <div className="font-bold text-center mb-1 line-clamp-2 font-sans">
              {item.member_profiles?.members?.name || "Unknown"}
            </div>
            <div className="text-sm opacity-80 text-center mb-2 line-clamp-1 font-sans">
              {item.positions?.name || "-"}
            </div>
          </div>
          <div className="text-xs opacity-70 text-center line-clamp-2 font-sans">
            {item.member_profiles?.members?.programs?.name || "-"} – {item.member_profiles?.members?.program_batch || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExecutiveBoardPage() {
  const [team, setTeam] = useState<any>(null);
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load team
  useEffect(() => {
    supabase
      .from("teams")
      .select("id, name, tagline, description, logo_path")
      .eq("type", "ph")
      .single()
      .then(({ data }) => setTeam(data));
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

  const general = data.filter(m => m.positions?.priority === 1);
  const techLead = data.filter(m => m.positions?.priority === 2);
  const techMembers = data.filter(m => m.positions?.priority >= 3 && m.positions?.priority <= 7);
  const nonTechLead = data.filter(m => m.positions?.priority === 8);
  const nonTechMembers = data.filter(m => m.positions?.priority >= 9 && m.positions?.priority <= 11);
  const PIC = data.filter(m => m.positions?.priority >= 12 && m.positions?.priority <= 17);

  return (
    <div className="min-h-screen bg-white gf-grid">
      {/* HERO - RESPONSIVE */}
      <div className="relative px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 bg-[#0F1E3D] text-white overflow-hidden">
        <div className="absolute -top-40 -left-40 w-125 h-125 sm:w-150 sm:h-150 bg-[#E6B52C]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-100 h-100 sm:w-125 sm:h-125 bg-white/10 blur-[100px] rounded-full" />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 font-title">
              {team ? team.name : <div className="h-10 sm:h-12 bg-white/10 animate-pulse rounded-lg w-3/4" />}
            </h1>
            <div className="text-[#E6B52C] font-bold mb-4 font-sans text-sm sm:text-base">
              {team ? team.tagline : <div className="h-5 bg-white/10 animate-pulse rounded w-1/2" />}
            </div>
            <div className="text-white/80 max-w-xl font-sans text-sm sm:text-base">
              {team ? team.description : (
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 animate-pulse rounded w-full" />
                  <div className="h-4 bg-white/10 animate-pulse rounded w-5/6" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center order-1 md:order-2">
            {team?.logo_path ? (
              <img
                src={supabase.storage.from("subteam-logo").getPublicUrl(team.logo_path).data.publicUrl}
                className="w-40 sm:w-48 md:w-56 lg:w-64 drop-shadow-2xl"
                alt={team.name}
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-white/10 animate-pulse rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 md:px-8 py-8 md:py-10 max-w-7xl mx-auto">
        {/* Year Tabs - RESPONSIVE */}
        <div className="mb-10 md:mb-15 overflow-hidden">
          <div className="w-full min-h-12 bg-[#E6B52C] rounded-md flex items-end px-4 sm:px-6 md:px-8 gap-6 sm:gap-8 md:gap-12 font-title overflow-x-auto scrollbar-hide">
            {years.length > 0 ? (
              years.map((y) => (
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
              ))
            ) : (
              <div className="h-8 w-20 bg-white/20 animate-pulse rounded mb-2" />
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-24">
            <div className="flex justify-center"><MemberCardSkeleton /></div>
            <div className="flex justify-center"><MemberCardSkeleton /></div>
            <div className="flex flex-wrap justify-center gap-10">
              <MemberCardSkeleton />
              <MemberCardSkeleton />
              <MemberCardSkeleton />
            </div>
          </div>
        ) : (
          <>
            {data.length === 0 && <p className="text-[#1C2B5A] text-center font-bold text-xl py-20 font-sans">No data for this year.</p>}
            
            {/* GENERAL MANAGER */}
            {general[0] && (
              <div className="flex justify-center mb-15">
                <MemberCard item={general[0]} variant="gold" />
              </div>
            )}

            {/* TECHNICAL LEAD */}
            {techLead[0] && (
              <div className="flex justify-center mb-12">
                <MemberCard item={techLead[0]} variant="blue" />
              </div>
            )}

            {/* TECHNICAL COUNCIL */}
            {techMembers.length > 0 && (
              <div className="mb-20 flex flex-wrap justify-center gap-10">
                {techMembers.map((item, i) => (
                  <div
                    key={item.id}
                    className="w-full sm:w-[calc(50%-20px)] lg:w-[calc(33.333%-27px)] flex justify-center"
                  >
                    <MemberCard
                      item={item}
                      variant={i % 3 === 0 ? "gold" : i % 3 === 1 ? "blue" : "gray"}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* NON-TECH LEAD */}
            {nonTechLead[0] && (
              <div className="flex justify-center mb-12">
                <MemberCard item={nonTechLead[0]} variant="blue" />
              </div>
            )}

            {/* NON-TECH COUNCIL */}
            {nonTechMembers.length > 0 && (
              <div className="mb-20 flex flex-wrap justify-center gap-10">
                {nonTechMembers.map((item, i) => (
                  <div
                    key={item.id}
                    className="w-full sm:w-[calc(50%-20px)] lg:w-[calc(33.333%-27px)] flex justify-center"
                  >
                    <MemberCard
                      item={item}
                      variant={i % 3 === 0 ? "gold" : i % 3 === 1 ? "blue" : "gray"}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* PIC COUNCIL */}
            {PIC.length > 0 && (
              <div className="flex flex-wrap justify-center gap-10">
                {PIC.map((item, i) => (
                  <div
                    key={item.id}
                    className="w-full sm:w-[calc(50%-20px)] lg:w-[calc(33.333%-27px)] flex justify-center"
                  >
                    <MemberCard
                      item={item}
                      variant={i % 3 === 0 ? "gold" : i % 3 === 1 ? "blue" : "gray"}
                    />
                  </div>
                ))}
              </div>
            )}
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