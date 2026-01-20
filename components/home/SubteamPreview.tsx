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
    <section className="relative px-4 sm:px-8 py-20 md:py-32 bg-[#0F1E3D] overflow-hidden">
      
      {/* Glow Effect: Ukuran disesuaikan untuk mobile */}
      <div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-64 h-64 md:w-125 md:h-125 bg-[#E6B52C]/10 md:bg-[#E6B52C]/20 blur-[80px] md:blur-[120px] rounded-full" />

      <div className="relative max-w-6xl mx-auto">

        {/* Header: Text center selalu, ukuran font dinamis */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border-2 border-[#E6B52C] text-[10px] md:text-sm font-bold text-[#E6B52C] font-sans tracking-widest uppercase">
            OUR SUBTEAMS
          </div>
          <h2 className="text-3xl md:text-5xl text-white font-title leading-tight">
            The Squadrons of <span className="text-[#E6B52C]">Gamaforce</span>
          </h2>
        </div>

        {/* Grid: 1 kolom di HP, 2 di tablet, 3 di laptop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {teams.map((t) => (
            <a
              key={t.id}
              href={`/subteam/${t.slug}`}
              className="
                group
                bg-white/5 backdrop-blur-sm
                border border-white/10
                rounded-2xl
                p-6 md:p-10
                hover:bg-white/10
                hover:-translate-y-2
                active:scale-95
                transition-all duration-300
                flex flex-col
              "
            >
              {/* Logo & Name Area */}
              <div className="flex items-center gap-4 md:block mb-4">
                <img
                  src={
                    supabase.storage
                      .from("subteam-logo")
                      .getPublicUrl(t.logo_path).data.publicUrl
                  }
                  className="w-12 h-12 md:w-16 md:h-16 object-contain md:mb-6"
                  alt={t.name}
                />
                <div className="text-lg md:text-xl text-[#E6B52C] font-title uppercase tracking-tight">
                  {t.name}
                </div>
              </div>

              <p className="text-white/70 text-sm md:text-base leading-relaxed font-sans line-clamp-3">
                {t.tagline}
              </p>

              {/* Link: Selalu muncul di mobile, hover di desktop */}
              <div className="mt-6 md:mt-8 text-[#E6B52C] text-sm font-bold font-sans opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                Enter Squadron <span className="text-lg">→</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}