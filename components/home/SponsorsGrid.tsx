"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SponsorsGrid() {
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("sponsors").select("*").then(({ data }) => {
      setSponsors(data || []);
    });
  }, []);

  return (
    <section className="px-8 py-24 gf-grid">
      <h2 className="text-4xl font-bold text-center text-[#1C2B5A] mb-12">
        Our Sponsors
      </h2>

      <div className="flex flex-wrap justify-center gap-10">
        {sponsors.map((s) => (
          <img
            key={s.id}
            src={
              supabase.storage
                .from("sponsors")
                .getPublicUrl(s.logo_path).data.publicUrl
            }
            alt={s.name}
            className="w-40 object-contain opacity-100 hover:scale-125 transition"
          />
        ))}
      </div>
    </section>
  );
}
