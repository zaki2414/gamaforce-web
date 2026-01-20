"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trophy, Medal, Award, Star } from "lucide-react";
import SponsorsFooter from "@/components/home/SponsorFooter";

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
    <div className="min-h-screen bg-white text-[#1C2B5A] selection:bg-[#E6B52C]/30 gf-grid">
      
      {/* HEADER SECTION */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] md:w-[40%] h-[40%] bg-slate-50 rounded-full blur-[80px] md:blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1C2B5A] text-[#E6B52C] px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8 font-sans">
            <Star className="w-3 h-3 fill-[#E6B52C]" />
            Hall of Fame
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter mb-6 text-[#1C2B5A] font-title leading-tight">
            Our <span className="text-[#E6B52C] text-transparent-outline"> <br /> Victories.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium text-base md:text-lg leading-relaxed font-sans">
            Dedikasi tanpa henti dalam riset dan kompetisi robotika terbang, 
            mengukir prestasi dari tingkat nasional hingga internasional.
          </p>
        </div>
      </section>

      {/* TIMELINE CONTENT */}
      <main className="max-w-5xl mx-auto px-6 pb-16 md:pb-24">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-2 border-slate-100 border-t-[#E6B52C] rounded-full animate-spin" />
          </div>
        ) : (
          years.map((year) => (
            <div key={year} className="relative mb-16 md:mb-24 last:mb-0">
              {/* Year Label */}
              <div className="z-10 mb-8 md:mb-12">
                <div className="py-2">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4 font-title">
                    {year}
                    <span className="h-1 w-8 md:w-12 bg-[#E6B52C] rounded-full" />
                  </h2>
                </div>
              </div>

              {/* Achievement Cards */}
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {grouped[year].map((item: any, idx: number) => (
                  <div 
                    key={item.id}
                    className="group relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 p-6 md:p-8 rounded-3xl md:rounded-4xl bg-[#F8FAFC] border-2 md:border-3 border-[#E6B52C] md:hover:shadow-[#E6B52C]-y md:hover:scale-[1.02] transition-all duration-500"
                  >
                    {/* Icon Column */}
                    <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-50 flex items-center justify-center md:group-hover:scale-110 transition-transform duration-500">
                      {idx === 0 ? (
                        <Trophy className="w-7 h-7 md:w-8 md:h-8 text-[#E6B52C]" />
                      ) : (
                        <Medal className="w-7 h-7 md:w-8 md:h-8 text-slate-400 md:group-hover:text-[#E6B52C] transition-colors" />
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-black tracking-tight font-title mb-1 md:mb-0">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base max-w-3xl font-sans">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
      <SponsorsFooter />
    </div>
  );
}