"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
      <section className="relative px-8 py-20 bg-[#0F1E3D] text-white overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#E6B52C]/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/20 blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="inline-block mb-6 px-6 py-2 rounded-full border-2 border-[#E6B52C] text-sm font-bold text-[#E6B52C] tracking-wide">
            ABOUT US
          </div>

          {/* Title Skeleton */}
          {loading ? (
            <div className="h-12 md:h-16 bg-white/10 animate-pulse rounded-xl w-3/4 mb-6" />
          ) : (
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              {about?.title}
            </h1>
          )}

          {/* Tagline Skeleton */}
          {loading ? (
            <div className="h-6 bg-white/10 animate-pulse rounded-lg w-1/2" />
          ) : (
            <p className="text-white/80 max-w-3xl mx-auto text-lg">
              {about?.tagline || "Aerial innovation, driven by passion."}
            </p>
          )}
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="px-8 py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        {/* Text Area */}
        <div>
          <h2 className="text-4xl font-extrabold text-[#1C2B5A] mb-6">
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
            <p className="text-[#475569] leading-relaxed text-lg whitespace-pre-line">
              {about?.description}
            </p>
          )}
        </div>

        {/* Video Area */}
        <div className="relative">
          <div className="absolute -inset-4 bg-[#E6B52C]/30 blur-2xl rounded-3xl" />
          
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-200">
            {loading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse" />
            ) : (
              about?.youtube_url && (
                <iframe
                  src={about.youtube_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                />
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}