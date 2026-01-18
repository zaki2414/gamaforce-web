"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AboutPreview() {
  const [about, setAbout] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("about_content")
      .select("*")
      .single()
      .then(({ data }) => setAbout(data));
  }, []);

  if (!about) return null;

  return (
    <section className="gf-grid px-8 pb-20">
      <div className="max-w-5xl mx-auto">

        {/* Card */}
        <div className="bg-[#E6B52C] border-2 border-[#1C2B5A] rounded-2xl p-12 shadow-xl text-center">

          {/* Small label */}
          <div className="inline-block mb-4 px-4 py-1 rounded-full border-2 border-[#1C2B5A] text-sm font-bold text-[#1C2B5A]">
            ABOUT GAMAFORCE
          </div>

          <p className="text-[#0F172A] text-lg leading-relaxed max-w-3xl mx-auto mb-10 line-clamp-3">
            {about.description}
          </p>

          <a
            href="/about"
            className="inline-block bg-[#F8FAFC] border-2 border-[#1C2B5A] px-8 py-4 rounded-xl font-bold text-[#1C2B5A] hover:-translate-y-2 hover:shadow-lg transition"
          >
            Learn more →
          </a>

        </div>

      </div>
    </section>
  );
}
