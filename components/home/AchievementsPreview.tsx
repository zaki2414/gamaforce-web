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
    <section className="relative px-8 py-32 bg-[#E6B52C]">
      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border-2 border-[#1C2B5A] text-sm font-bold text-[#1C2B5A]">
            ACHIEVEMENTS
          </div>

          <h2 className="text-5xl font-extrabold text-white">
            Our Championship Legacy
          </h2>
        </div>

        {/* Achievements */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="
                bg-[#F8FAFC]/50 backdrop-blur
                border-2 border-[#F8FAFC]/60
                rounded-2xl
                p-8
                hover:bg-[#F8FAFC]/60
                hover:-translate-y-2
                transition
              "
            >
              <div className="text-sm font-bold text-[#1C2B5A] mb-2">
                {a.year}
              </div>

              <div className="text-xl font-extrabold text-[#1C2B5A] mb-3">
                {a.title}
              </div>

              {a.description && (
                <p className="text-[#1C2B5A]/80">
                  {a.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="/achievements"
            className="
              inline-flex items-center gap-3
              bg-[#F8FAFC]/80
              border-2 border-[#1C2B5A]
              px-10 py-4
              rounded-xl
              font-bold
              text-[#1C2B5A]
              shadow-lg
              hover:-translate-y-2 hover:shadow-2xl
              transition
            "
          >
            View All Achievements
            <span className="text-2xl">🏆</span>
          </a>
        </div>

      </div>
    </section>
  );
}
