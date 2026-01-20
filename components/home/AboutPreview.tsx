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
    <section className="gf-grid px-4 md:px-8 pb-12 md:pb-20">
      <div className="max-w-5xl mx-auto">

        {/* Card: Padding disesuaikan p-6 di HP, p-12 di Laptop */}
        <div className="bg-[#E6B52C] border-2 border-[#1C2B5A] rounded-4xl p-6 md:p-12 shadow-xl text-center">

          {/* Small label: Text lebih kecil di HP */}
          <div className="inline-block mb-6 px-4 py-1 rounded-full border-2 border-[#1C2B5A] text-[10px] md:text-sm font-black text-[#1C2B5A] font-sans tracking-widest uppercase">
            About Gamaforce
          </div>

          {/* Description: Text base di HP, lg di Laptop. Line clamp tetap 3 */}
          <p className="text-[#1C2B5A] text-base md:text-xl leading-relaxed max-w-3xl mx-auto mb-8 md:mb-10 line-clamp-4 md:line-clamp-3 font-sans font-medium">
            {about.description}
          </p>

          {/* Button: W-full di HP biar gampang diklik, auto di Laptop */}
          <a
            href="/about"
            className="font-sans inline-block w-full sm:w-auto bg-[#F8FAFC] border-2 border-[#1C2B5A] px-8 py-4 rounded-xl font-bold text-[#1C2B5A] hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all duration-300"
          >
            Learn more &rarr;
          </a>

        </div>

      </div>
    </section>
  );
}