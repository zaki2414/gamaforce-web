"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AchievementsPreview() {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("achievements")
      .select("*")
      .order("year", { ascending: false })
      .limit(6)
      .then(({ data }) => setAchievements(data || []));
  }, []);

  return (
    <section className="relative px-4 sm:px-8 py-20 md:py-32 bg-[#E6B52C]">
      <div className="relative max-w-6xl mx-auto">

        {/* Header: Ukuran text dinamis */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border-2 border-[#1C2B5A] text-[10px] md:text-sm font-black text-[#1C2B5A] font-sans tracking-widest uppercase">
            ACHIEVEMENTS
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1C2B5A] md:text-white font-title leading-tight">
            Our Championship Legacy
          </h2>
        </div>

        {/* Grid: 1 kolom di HP, 2 di tablet, 3 di laptop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="
                bg-[#F8FAFC]/50 backdrop-blur-sm
                border-2 border-[#F8FAFC]/60
                rounded-2xl
                p-6 md:p-8
                hover:bg-[#F8FAFC]/80
                hover:-translate-y-2
                active:scale-[0.98]
                transition-all duration-300
                flex flex-col
              "
            >
              <div className="flex justify-between items-start mb-3">
                <span className="lg:text-md sm:text-md font-black text-[#1C2B5A] rounded font-sans">
                  {a.year}
                </span>
                <span className="text-xl">🏆</span>
              </div>

              <div className="text-lg md:text-xl font-black text-[#1C2B5A] mb-3 font-sans leading-tight">
                {a.title}
              </div>

              {a.description && (
                <p className="text-[#1C2B5A]/80 font-sans text-sm md:text-base leading-relaxed line-clamp-4">
                  {a.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA: Full width di HP, auto di desktop */}
        <div className="text-center mt-12 md:mt-16">
          <a
            href="/achievements"
            className="
              inline-flex items-center justify-center gap-3
              w-full sm:w-auto
              bg-[#F8FAFC]
              border-2 border-[#1C2B5A]
              px-8 md:px-10 py-4
              rounded-xl
              font-black
              text-[#1C2B5A]
              shadow-lg
              hover:-translate-y-1 hover:shadow-2xl
              active:scale-95
              transition-all duration-300 font-sans uppercase tracking-wider text-sm
            "
          >
            View All Achievements
            <span className="text-xl">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}