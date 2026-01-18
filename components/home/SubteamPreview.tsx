"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SubteamPreview() {
  const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
    const fetchTeams = async () => {
        const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("type", "subteam")
        .order("id", { ascending: true });

        if (error) console.error(error);
        if (data) setTeams(data);
    };

    fetchTeams();
    }, []);


  return (
    <section className="relative px-8 py-32 bg-[#0F1E3D] overflow-hidden">

      {/* glow */}
      <div className="absolute -top-40 -right-40 w-125 h-125 bg-[#E6B52C]/20 blur-[120px] rounded-full" />

      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border-2 border-[#E6B52C] text-sm font-bold text-[#E6B52C]">
            OUR SUBTEAMS
          </div>
          <h2 className="text-5xl font-extrabold text-white">
            The Squadrons of Gamaforce
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {teams.map((t) => (
            <a
              key={t.id}
              href={`/subteam/${t.slug}`}
              className="
                group
                bg-white/10 backdrop-blur
                border border-white/20
                rounded-2xl
                p-10
                hover:bg-white/20
                hover:-translate-y-2
                transition
              "
            >
              <div className="text-2xl font-extrabold text-[#E6B52C] mb-4">
                {t.name}
              </div>
              <img
                src={
                  supabase.storage
                    .from("subteam-logo")
                    .getPublicUrl(t.logo_path).data.publicUrl
                }
                className="w-16 h-16 object-contain mb-4"
              />

              <p className="text-white/70 leading-relaxed">
                {t.tagline}
              </p>

              <div className="mt-8 text-[#E6B52C] font-bold opacity-0 group-hover:opacity-100 transition">
                Enter Squadron →
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
