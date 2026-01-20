"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SponsorsHero() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("sponsors")
      .select("*")
      .then(({ data }) => {
        setSponsors(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="px-8 py-24 gf-grid bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-[#1C2B5A] mb-16 font-title">
          Our Sponsors
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2B5A]"></div>
          </div>
        ) : sponsors.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No sponsors yet.</p>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
            {sponsors.map((s) => (
              <div
                key={s.id}
                className="relative"
              >
                <img
                  src={
                    supabase.storage
                      .from("sponsors")
                      .getPublicUrl(s.logo_path).data.publicUrl
                  }
                  alt={s.name}
                  className="w-32 sm:w-36 md:w-40 lg:w-44 h-auto object-contain hover:scale-110 transition-all duration-300"
                  title={s.name}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}