"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Image as ImageIcon, Instagram, Youtube, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import SponsorsFooter from "@/components/home/SponsorFooter";

/* ---------- MASONRY SIZE MAPPING ---------- */
// Optimasi: Di mobile, kita akan memaksa sebagian besar menjadi col-span-2 agar gambar terlihat jelas
const sizeMap = {
  normal: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
  wide: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
  tall: "col-span-1 row-span-2 md:col-span-1 md:row-span-2",
  featured: "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
};

/* ---------- SKELETON COMPONENTS ---------- */
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[260px] gap-3 md:gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={`bg-slate-200 animate-pulse rounded-3xl md:rounded-[2.5rem]
            ${i === 1 ? "col-span-2 row-span-2" : "col-span-2 md:col-span-1"}
          `}
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
      const { data: galleryData } = await supabase
        .from("galleries")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true });
      
      setData(galleryData ?? []);
      setLoading(false);
    }
    loadGallery();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] gf-grid text-[#1C2B5A]">
      {/* HERO SECTION */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden bg-[#0F1E3D] text-white">
        <div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-64 h-64 md:w-125 md:h-125 bg-[#E6B52C]/20 blur-[80px] md:blur-[140px] rounded-full" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-7xl font-black mb-4 md:mb-6 tracking-tight font-title leading-tight">
            Our <span className="text-[#E6B52C]">Gallery</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed font-sans px-4">
            Momen berharga, riset intensif, dan dedikasi tim Gamaforce 
            dalam memajukan teknologi dirgantara Indonesia.
          </p>
        </div>
      </section>

      {/* MASONRY GRID SECTION */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-10">
        {loading ? (
          <GallerySkeleton />
        ) : data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[180px] md:auto-rows-[240px] gap-3 md:gap-8">
            {data.map((item) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-3xl md:rounded-4xl bg-white border border-[#1C2B5A]/5 shadow-lg md:shadow-xl transition-all duration-500 ${
                  sizeMap[item.layout_type as keyof typeof sizeMap] || sizeMap.normal
                }`}
              >
                {/* Image */}
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition duration-700 ease-out md:group-hover:scale-110"
                />

                {/* Overlay Gradient - Di mobile dibuat sedikit lebih terlihat secara default atau via touch */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0F1E3D]/80 via-[#0F1E3D]/20 to-transparent
                      opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity
                      duration-500 flex flex-col justify-end p-4 md:p-10
                    "
                  >

                  <div className="translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-white text-sm md:text-2xl font-black leading-tight mb-1 md:mb-2 font-sans">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-white/70 text-[10px] md:text-sm font-medium line-clamp-1 md:line-clamp-2 font-sans">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hover Border Decor - Disembunyikan di mobile agar tidak mengganggu view */}
                <div className="absolute inset-0 border-0 md:group-hover:border-12 border-white/5 transition-all duration-500 rounded-3xl md:rounded-[2.5rem] pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-4xl md:rounded-[3rem] py-20 md:py-32 text-center shadow-xl border border-slate-100 mx-4">
            <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-[#1C2B5A]/40 font-black italic uppercase tracking-[0.2em] md:tracking-[0.3em] font-title text-sm md:text-base">
              Gallery is being updated...
            </p>
          </div>
        )}
      </main>

      {/* BOTTOM CTA */}
      <section className="mt-20 md:mt-32 px-4 md:px-6">
        <div className="max-w-5xl mx-auto p-8 md:p-20 bg-[#1C2B5A] rounded-[2.5rem] md:rounded-[3.5rem] text-[#E6B52C] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[60px] md:blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 text-center md:text-left flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-6 tracking-tight leading-tight font-title">
                Experience the <br className="hidden md:block" /> Journey Daily.
              </h2>
              <p className="text-[#E6B52C]/80 font-bold text-base md:text-lg font-sans">
                Jangan lewatkan update terbaru dari workshop kami. 
                Ikuti keseharian tim melalui kanal resmi.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto font-sans">
              <Link href="https://www.instagram.com/gamaforce" target="_blank" className="flex items-center justify-center gap-3 bg-[#E6B52C] text-[#1C2B5A] px-6 py-4 md:px-8 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-[#0F1E3D] hover:text-white transition-all shadow-lg group text-sm md:text-base">
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </Link>
              <Link href="https://www.youtube.com/@gadjahmadaflyingobjectrese6302" target="_blank" className="flex items-center justify-center gap-3 bg-white text-[#1C2B5A] px-6 py-4 md:px-8 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-slate-50 transition-all shadow-lg group text-sm md:text-base">
                <Youtube className="w-5 h-5" />
                <span>YouTube</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SponsorsFooter />
    </div>
  );
}