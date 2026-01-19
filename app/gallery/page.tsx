"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Camera, Image as ImageIcon, Instagram, Youtube, ArrowUpRight } from "lucide-react";
import Link from "next/link";

/* ---------- MASONRY SIZE MAPPING ---------- */
const sizeMap = {
  normal: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  featured: "col-span-2 row-span-2",
};

/* ---------- SKELETON COMPONENTS ---------- */
function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[240px] gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={`bg-slate-200 animate-pulse rounded-[2.5rem] ${i === 1 ? 'col-span-2 row-span-2' : ''}`} />
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
    <div className="min-h-screen bg-[#F8FAFF] gf-grid pb-24 text-[#1C2B5A]">
      {/* HERO SECTION */}
      <section className="relative px-8 py-32 overflow-hidden bg-[#0F1E3D] text-white">
        <div className="absolute -top-40 -right-40 w-125 h-125 bg-[#E6B52C]/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-30%] left-[-10%] w-125 h-125 bg-[#1C2B5A]/60 blur-[160px] rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-[#E6B52C] px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 border border-white/10">
            <Camera className="w-4 h-4" />
            Visual Journey
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Our <span className="text-[#E6B52C]">Gallery</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Momen berharga, riset intensif, dan dedikasi tim Gamaforce 
            dalam memajukan teknologi dirgantara Indonesia.
          </p>
        </div>
      </section>

      {/* MASONRY GRID SECTION */}
      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        {loading ? (
          <GallerySkeleton />
        ) : data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[240px] gap-4 md:gap-8">
            {data.map((item) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-[2.5rem] bg-white border border-[#1C2B5A]/5 shadow-xl hover:shadow-2xl hover:shadow-[#1C2B5A]/20 transition-all duration-500 ${
                  sizeMap[item.layout_type as keyof typeof sizeMap] || sizeMap.normal
                }`}
              >
                {/* Image */}
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0F1E3D]/95 via-[#0F1E3D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-10">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="h-px w-8 bg-[#E6B52C]" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6B52C]">Moment</span>
                    </div>
                    <h3 className="text-white text-xl md:text-2xl font-black leading-tight mb-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-white/60 text-sm font-medium line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hover Border Decor */}
                <div className="absolute inset-0 border-0 group-hover:border-12 border-white/5 transition-all duration-500 rounded-[2.5rem] pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] py-32 text-center shadow-xl border border-slate-100">
            <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-[#1C2B5A]/40 font-black italic uppercase tracking-[0.3em]">
              Gallery is being updated...
            </p>
          </div>
        )}
      </main>

      {/* BOTTOM CTA */}
      <section className="mt-32 px-6">
        <div className="max-w-5xl mx-auto p-12 md:p-20 bg-[#E6B52C] rounded-[3.5rem] text-[#1C2B5A] relative overflow-hidden shadow-2xl shadow-[#E6B52C]/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-[80px] -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1C2B5A]/10 rounded-full blur-[80px] -ml-40 -mb-40" />
          
          <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-none">
                Experience the <br /> Journey Daily.
              </h2>
              <p className="text-[#1C2B5A]/80 font-bold text-lg">
                Jangan lewatkan update terbaru dari workshop kami. 
                Ikuti keseharian tim melalui kanal resmi.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link href="https://www.instagram.com/gamaforce" target="_blank" className="flex items-center justify-center gap-3 bg-[#1C2B5A] text-white px-8 py-5 rounded-2xl font-black hover:bg-[#0F1E3D] transition-all shadow-lg group">
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              <Link href="https://www.youtube.com/@gadjahmadaflyingobjectrese6302" target="_blank" className="flex items-center justify-center gap-3 bg-white text-[#1C2B5A] px-8 py-5 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-lg group">
                <Youtube className="w-5 h-5" />
                <span>YouTube</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}