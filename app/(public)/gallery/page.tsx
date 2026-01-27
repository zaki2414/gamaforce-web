"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Image as ImageIcon, Instagram, Music2 } from "lucide-react";
import Link from "next/link";
import SponsorsFooter from "@/components/home/SponsorFooter";

/* ---------- MASONRY SIZE MAPPING ---------- */
const sizeMap = {
  normal: "col-span-2 row-span-1",
  square: "col-span-1 row-span-1",
  wide: "col-span-2 md:col-span-3 row-span-1",
  tall: "col-span-1 row-span-2",
  featured: "col-span-2 row-span-2",
};

/* ---------- SKELETON ---------- */
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[240px] gap-4 md:gap-6 auto-flow-dense">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200 animate-pulse rounded-3xl ${
            i === 0 ? "col-span-2 row-span-2" : "col-span-1"
          }`}
        />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      setLoading(true);

      const { data } = await supabase
        .from("galleries")
        .select("*")
        .eq("is_published", true)
        // ⛔️ TIDAK pakai order_index
        .order("created_at", { ascending: false });

      setData(data ?? []);
      setLoading(false);
    }

    loadGallery();
  }, []);

  /* ---------- OPTIONAL: SORT VISUAL ---------- */
  const sortedData = useMemo(() => {
    const priority = {
      featured: 0,
      wide: 1,
      normal: 2,
      tall: 3,
      square: 4,
    };

    return [...data].sort(
      (a, b) => priority[a.layout_type as keyof typeof priority] - priority[b.layout_type as keyof typeof priority]
    );
  }, [data]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] gf-grid text-[#1C2B5A]">
      {/* HERO */}
      <section className="relative px-6 py-20 md:py-32 bg-[#0F1E3D] text-white overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#E6B52C]/20 blur-[120px] rounded-full" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight font-title">
            Our <span className="text-[#E6B52C]">Gallery</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-base md:text-lg font-medium font-sans">
            Momen berharga, riset intensif, dan dedikasi tim Gamaforce
            dalam memajukan teknologi dirgantara Indonesia.
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-12 relative z-10">
        {loading ? (
          <GallerySkeleton />
        ) : sortedData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[180px] md:auto-rows-[240px] gap-4 md:gap-8 auto-flow-dense">
            {sortedData.map((item) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-3xl font-sans bg-white border border-[#1C2B5A]/5 shadow-lg transition-all duration-500 ${
                  sizeMap[item.layout_type as keyof typeof sizeMap] || sizeMap.normal
                }`}
              >
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0F1E3D]/80 via-[#0F1E3D]/20 to-transparent
                  opacity-100 md:opacity-0 md:group-hover:opacity-100
                  transition-opacity duration-500 flex flex-col justify-end p-4 md:p-8
                ">
                  <h3 className="text-white text-sm md:text-xl font-black mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-white/70 text-[10px] md:text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl py-24 text-center shadow-xl border border-slate-100">
            <ImageIcon className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-[#1C2B5A]/40 font-black uppercase tracking-[0.3em]">
              Gallery is being updated
            </p>
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="mt-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto p-8 md:p-16 bg-[#1C2B5A] rounded-[2.5rem] text-[#E6B52C] shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 font-sans">
            <div>
              <h2 className="text-2xl md:text-4xl font-black mb-4 font-title">
                Experience the Journey Daily.
              </h2>
              <p className="text-[#E6B52C]/80 font-bold">
                Ikuti keseharian tim melalui kanal resmi kami.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="https://www.instagram.com/gamaforce"
                target="_blank"
                className="flex items-center gap-2 bg-[#E6B52C] text-[#1C2B5A] px-6 py-4 rounded-xl font-black hover:bg-white transition"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </Link>
              <Link
                href="https://www.tiktok.com/@gamaforce"
                target="_blank"
                className="flex items-center gap-2 bg-white text-[#1C2B5A] px-6 py-4 rounded-xl font-black hover:bg-[#E6B52C] transition"
              >
                <Music2 className="w-5 h-5" />
                TikTok
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SponsorsFooter />
    </div>
  );
}
