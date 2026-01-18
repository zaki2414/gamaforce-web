"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AchievementsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .order("year", { ascending: false });

      setData(data || []);
      setLoading(false);
    }

    load();
  }, []);

  const grouped = data.reduce((acc: any, a: any) => {
    if (!acc[a.year]) acc[a.year] = [];
    acc[a.year].push(a);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1C2B5A] selection:bg-[#E6B52C]/30">
      
      {/* HERO */}
      <div className="relative px-10 py-32 overflow-hidden bg-[#e1e9ed]">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#E6B52C]/40 blur-[160px] rounded-full" />
        <div className="absolute -bottom-70 right-0 w-[600px] h-[600px] bg-[#1C2B5A]/20 blur-[160px] rounded-full" />

        <div className="relative max-w-6xl mx-auto">
          <h1 className="text-7xl font-black mb-6 tracking-tight">
            Achievements
          </h1>

          <p className="text-[#1C2B5A]/70 max-w-xl text-lg">
            A legacy carved in competitions, engineering, and relentless ambition.
          </p>
        </div>
      </div>

      {/* CONTENT (Listing Grid Diubah Jadi Lebih Bagus) */}
      <div className="max-w-6xl mx-auto px-10 pb-32">
        
        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="w-10 h-10 border-4 border-[#E6B52C]/20 border-t-[#B08A12] rounded-full animate-spin" />
            <p className="mt-4 text-[#B08A12] font-medium animate-pulse">Loading trophies…</p>
          </div>
        )}

        {!loading &&
          years.map((year) => (
            <section key={year} className="mt-24 first:mt-16">
              
              {/* Modern Year Header */}
              <div className="flex items-end gap-4 mb-12">
                <h2 className="text-6xl font-black text-[#1C2B5A] leading-none">
                  {year}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-[#E6B52C] via-[#E6B52C]/20 to-transparent mb-2" />
                <span className="text-[#B08A12] font-bold tracking-widest text-sm mb-1 uppercase">
                  Season
                </span>
              </div>

              {/* Enhanced Trophy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {grouped[year].map((a: any) => (
                  <div
                    key={a.id}
                    className="group relative bg-white border border-slate-200/60 rounded-[2rem] p-10 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(28,43,90,0.1)] hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Decorative Background Icon */}
                    <div className="absolute -right-6 -bottom-6 text-slate-50 group-hover:text-[#E6B52C]/5 transition-colors duration-500">
                      <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2H6c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 13.9V17H8v2h8v-2h-3v-3.1a5.01 5.01 0 0 0 2.61-3.96C18.08 7.63 20 5.55 20 3V2h-2zm-9 5c-1.65 0-3-1.35-3-3V3h3v4zm9-4v1c0 1.65-1.35 3-3 3V3h3z"/>
                      </svg>
                    </div>

                    <div className="relative z-10">
                      {/* Trophy Label */}
                      <div className="flex items-center gap-2 mb-6 text-[#B08A12] font-bold text-xs tracking-widest uppercase">
                        <span className="w-8 h-[2px] bg-[#E6B52C]" />
                        Winner Achievement
                      </div>

                      <h3 className="text-3xl font-extrabold mb-4 text-[#1C2B5A] group-hover:text-[#B08A12] transition-colors duration-300 leading-tight">
                        {a.title}
                      </h3>

                      {a.description && (
                        <p className="text-[#1C2B5A]/60 text-base leading-relaxed font-medium">
                          {a.description}
                        </p>
                      )}
                    </div>

                    {/* Left Border Accent */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#E6B52C] group-hover:h-1/2 transition-all duration-500 rounded-r-full" />

                    {/* Trophy Badge (Modern Version) */}
                    <div className="absolute top-8 right-8 w-12 h-12 bg-slate-50 group-hover:bg-[#E6B52C]/10 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 border border-slate-100 group-hover:border-[#E6B52C]/20 shadow-sm">
                      🏆
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}