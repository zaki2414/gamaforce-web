"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SponsorsFooter from "@/components/home/SponsorFooter";

export default function AboutPage() {
  const [about, setAbout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("about_content")
        .select("*")
        .single();
      
      setAbout(data);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="bg-white text-[#0F172A] min-h-screen gf-grid">
      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-8 py-16 md:py-20 bg-[#0F1E3D] text-white overflow-hidden">
        <div className="absolute -top-20 -left-20 md:-top-40 md:-left-40 w-64 h-64 md:w-125 md:h-125 bg-[#E6B52C]/20 blur-[80px] md:blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-48 h-48 md:w-100 md:h-100 bg-white/20 blur-[80px] md:blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="inline-block mb-6 px-6 py-2 rounded-full border-2 border-[#E6B52C] font-sans text-xs md:text-sm font-bold text-[#E6B52C] tracking-wide">
            ABOUT US
          </div>

          {loading ? (
            <div className="h-10 md:h-16 bg-white/10 animate-pulse rounded-xl w-3/4 mb-6" />
          ) : (
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-title leading-tight mb-2">
              {about?.title}
            </h1>
          )}

          {loading ? (
            <div className="h-6 bg-white/10 animate-pulse rounded-lg w-1/2" />
          ) : (
            <p className="text-white/80 max-w-3xl mx-auto text-base md:text-lg font-sans">
              {about?.tagline || "Aerial innovation, driven by passion."}
            </p>
          )}
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="px-6 md:px-8 py-16 md:py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
        <div className="order-1 md:order-0">
          <h2 className="text-3xl md:text-4xl font-sans font-extrabold text-[#1C2B5A] mb-6">
            Who We Are
          </h2>

          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-4/6" />
            </div>
          ) : (
            <p className="text-[#475569] leading-relaxed text-base md:text-lg whitespace-pre-line font-sans">
              {about?.description}
            </p>
          )}
        </div>

        <div className="relative order-2 md:order-0">
          <div className="absolute -inset-2 md:-inset-4 bg-[#E6B52C]/30 blur-xl md:blur-2xl rounded-3xl" />
          
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 md:border-4 border-white bg-gray-200">
            {loading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse" />
            ) : (
              about?.youtube_url && (
                <iframe
                  src={about.youtube_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  title="About Us Video"
                />
              )
            )}
          </div>
        </div>
      </section>
    <SponsorsFooter />
    </div>
  );
}