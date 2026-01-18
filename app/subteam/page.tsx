"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------- Skeleton Card ---------- */
function SubteamCardSkeleton() {
  return (
    <div className="relative rounded-2xl p-8 bg-gray-100 animate-pulse h-full flex flex-col items-center justify-between border border-gray-200">
      <div className="mt-6 mb-12 w-48 h-40 bg-gray-200 rounded-xl shadow-inner" />
      <div className="w-full space-y-3 flex flex-col items-center">
        <div className="h-7 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="mt-8 h-4 bg-gray-200 rounded w-1/3 opacity-50" />
    </div>
  );
}

/* ---------- Subteam Card Real ---------- */
function SubteamCard({
  team,
  variant = "gold",
}: {
  team: any;
  variant?: "gold" | "blue" | "gray";
}) {
  const colors = {
    gold: "bg-[#E6B52C] text-[#1C2B5A]",
    blue: "bg-[#1C2B5A] text-white",
    gray: "bg-[#afb8cc] text-[#1C2B5A]",
  };

  const logoUrl = team.logo_path 
    ? supabase.storage.from("subteam-logo").getPublicUrl(team.logo_path).data.publicUrl 
    : null;

  return (
    <a href={`/subteam/${team.slug}`} className="relative group block h-full">
      <div className="absolute -inset-2 bg-[#E6B52C]/40 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

      <div className={`${colors[variant]} relative rounded-2xl p-8 shadow-xl hover:-translate-y-2 transition duration-300 h-full flex flex-col items-center justify-between`}>
        
        {logoUrl && (
          <div className="mt-6 mb-12 flex items-center justify-center h-40">
            <img
              src={logoUrl}
              className="w-48 object-contain drop-shadow-2xl group-hover:scale-110 transition duration-500"
              alt={team.name}
            />
          </div>
        )}

        <div className="text-center">
          <h3 className="text-2xl font-extrabold mb-2 uppercase tracking-tight">
            {team.name}
          </h3>
          {team.tagline && (
            <p className="text-sm font-medium opacity-80 leading-snug">
              {team.tagline}
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition duration-300">
          Enter Squadron <span>→</span>
        </div>
      </div>
    </a>
  );
}

export default function SubteamOverviewPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("teams")
        .select("id, name, slug, tagline, logo_path")
        .eq("type", "subteam")
        .order("name");

      setTeams(data ?? []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-white gf-grid">
      {/* HERO SECTION */}
      <div className="relative px-8 py-24 bg-[#E6B52C] text-white overflow-hidden">
        <div className="absolute -top-60 -left-60 w-125 h-125 bg-white/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -right-10 w-80 h-80 bg-white/60 blur-[100px] rounded-full" />

        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Our <span className="text-[#1C2B5A]">Subteams</span>
          </h1>
          <p className="text-[#1C2B5A] max-w-2xl mx-auto text-lg leading-relaxed">
            Gamaforce is divided into several specialized engineering units. 
            Each squadron focuses on different flight platforms and technological challenges.
          </p>
        </div>
      </div>

      {/* GRID Section */}
      <div className="px-8 py-24 max-w-7xl mx-auto">
        <div className="flex justify-center">
          <div 
            className={`grid gap-10 w-full ${
              loading || teams.length > 2
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : teams.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            } ${!loading && teams.length % 3 === 1 && teams.length > 3 ? 'lg:[&>*:last-child]:col-start-2' : ''}`}
          >
            {loading ? (
              [...Array(6)].map((_, i) => (
                <SubteamCardSkeleton key={i} />
              ))
            ) : (
              teams.map((team, i) => (
                <SubteamCard
                  key={team.id}
                  team={team}
                  variant={
                    i === teams.length - 1 && teams.length % 3 === 1
                      ? "gold"
                      : i % 3 === 0
                      ? "gray"
                      : i % 3 === 1
                      ? "gold"
                      : "blue"
                  }
                />
              ))
            )}
          </div>
        </div>

        {!loading && teams.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium">No subteams found.</p>
          </div>
        )}
      </div>
    </div>
  );
}