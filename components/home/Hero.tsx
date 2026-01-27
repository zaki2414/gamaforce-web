"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Image as ImageIcon } from "lucide-react";

export default function Hero() {
  // Pindahkan state ke dalam komponen
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHero() {
      try {
        const { data, error } = await supabase
          .from("galleries")
          .select("photo_url")
          .eq("is_hero", true)
          .eq("is_published", true) // Pastikan hanya ambil yang sudah dipublish
          .maybeSingle(); // Pakai maybeSingle agar tidak error jika data belum ada

        if (data) setHeroUrl(data.photo_url);
      } catch (err) {
        console.error("Error fetching hero image:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHero();
  }, []);

  return (
    <section className="gf-grid min-h-[85vh] flex items-center py-12 md:py-0">
      <div className="max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        
        {/* LEFT - Text Content */}
        <div className="text-center md:text-left order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl text-[#1C2B5A] font-title">
            GAMAFORCE
          </h1>
          <p className="text-[#64748B] max-w-md mx-auto md:mx-0 font-sans mt-2 text-sm md:text-base">
            Guardians of the Sky — UGM UAV Competition Team
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4 font-sans font-bold">
            <a
              href="/subteam"
              className="bg-[#E6B52C] border-2 border-[#1C2B5A] px-6 py-3 rounded-xl text-[#1C2B5A] hover:-translate-y-1 transition text-center"
            >
              Explore Teams
            </a>
            <a
              href="/contact"
              className="bg-[#F8FAFC] border-2 border-[#1C2B5A] px-6 py-3 rounded-xl text-[#1C2B5A] hover:bg-[#1C2B5A] hover:-translate-y-1 hover:text-white transition text-center"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* RIGHT - Image Container */}
        <div className="bg-white border-2 border-[#1C2B5A] rounded-2xl p-2 md:p-4 shadow-lg order-1 md:order-2 w-full max-w-lg mx-auto md:max-w-none transition-all duration-500 hover:rotate-1">
          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
            {loading ? (
              <div className="animate-pulse bg-slate-200 w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
            ) : heroUrl ? (
              <>
                <img 
                  src={heroUrl} 
                  alt="Hero Highlight" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-tr from-[#1C2B5A]/20 to-transparent pointer-events-none" />
              </>
            ) : (
              // Fallback jika tidak ada foto yang ditandai is_hero
              <div className="bg-slate-100 w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">No Hero Image Set</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}