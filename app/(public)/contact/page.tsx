"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Instagram, Linkedin, Youtube, Mail, MapPin, Phone, Share2 } from "lucide-react";
import SponsorsFooter from "@/components/home/SponsorFooter";

/* ---------- SKELETON COMPONENTS ---------- */
// Penyesuaian: Mengurangi padding di mobile (p-6) agar tidak sempit
function ContactInfoSkeleton() {
  return (
    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-xl md:rounded-2xl" />
        <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
      </div>
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="w-full h-40 md:h-48 bg-gray-200 rounded-2xl md:rounded-3xl" />
    </div>
  );
}

function SocialSkeleton() {
  return (
    <div className="bg-gray-200 rounded-4xl md:rounded-[2.5rem] p-6 md:p-10 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-gray-300 rounded-xl" />
        <div className="h-6 bg-gray-300 rounded-lg w-1/2" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-300 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}

function PersonSkeleton() {
  return (
    <div className="bg-gray-100 p-6 rounded-4xl flex flex-col md:flex-row justify-between items-start md:items-center animate-pulse gap-4">
      <div className="space-y-2 w-full">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="w-full md:w-32 h-10 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function ContactPage() {
  const [info, setInfo] = useState<any>(null);
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: infoData } = await supabase.from("contact_info").select("*").single();
      const { data: personData } = await supabase.from("contact_persons").select("*").order("order_index");
      setInfo(infoData);
      setPersons(personData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] gf-grid">
      {/* HERO - Penyesuaian padding mobile */}
      <div className="relative px-6 py-20 md:py-32 overflow-hidden bg-[#0F1E3D] text-white">
        <div className="absolute -top-20 -left-20 md:-top-40 md:-left-40 w-64 h-64 md:w-125 md:h-125 bg-[#E6B52C]/20 blur-[80px] md:blur-[140px] rounded-full" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight font-title leading-tight">
            Contact <span className="text-[#E6B52C]">Us</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-base md:text-lg font-sans px-4">
            Connect with Gamaforce — collaboration, partnership, or mission alignment.
          </p>
        </div>
      </div>

      {/* CONTENT - Penyesuaian margin negatif & grid layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 md:-mt-16 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* LEFT COLUMN (Secretariat & Social) */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            {loading ? (
              <>
                <ContactInfoSkeleton />
                <SocialSkeleton />
              </>
            ) : (
              <>
                {/* Address Card */}
                <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-[#1C2B5A]/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F8FAFC] rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#E6B52C]" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-[#1C2B5A] font-title">Secretariat</h2>
                  </div>

                  <p className="text-[#1C2B5A]/70 font-medium mb-6 md:mb-8 leading-relaxed font-sans text-sm md:text-base">
                    {info?.address}
                  </p>

                  {info?.maps_embed && (
                    <div
                      className="rounded-2xl md:rounded-3xl overflow-hidden border border-[#1C2B5A]/10 shadow-inner aspect-4/3 md:aspect-auto"
                      dangerouslySetInnerHTML={{
                        __html: info.maps_embed.replace('width="600"', 'width="100%"').replace('height="450"', 'height="100%"')
                      }}
                    />
                  )}
                </div>

                {/* Social Card */}
                <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-8 md:p-10 shadow-xl">
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F8FAFC] rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                      <Share2 className="w-5 h-5 md:w-6 md:h-6 text-[#E6B52C]" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-[#1C2B5A] font-title">Social Media</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4 font-sans font-bold">
                    {info?.instagram && <SocialLink icon={Instagram} label="Instagram" href={info.instagram} />}
                    {info?.linkedin && <SocialLink icon={Linkedin} label="LinkedIn" href={info.linkedin} />}
                    {info?.youtube && <SocialLink icon={Youtube} label="YouTube" href={info.youtube} />}
                    {info?.email && <SocialLink icon={Mail} label="Email" href={`mailto:${info.email}`} />}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN (Contact Persons) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-[#1C2B5A]/5 h-full">
              <h2 className="text-2xl md:text-3xl font-black text-[#1C2B5A] mb-8 md:mb-12 flex items-center gap-4 font-title">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F8FAFC] rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-[#E6B52C]" />
                </div>
                Contact Persons
              </h2>

              <div className="space-y-4 md:space-y-6">
                {loading ? (
                  <>
                    <PersonSkeleton />
                    <PersonSkeleton />
                  </>
                ) : (
                  persons.map((p) => {
                    const wa = `https://wa.me/${p.phone.replace(/\D/g, "")}`;
                    return (
                      <div
                        key={p.id}
                        className="group bg-[#1C2B5A] p-5 md:p-6 rounded-2xl md:rounded-3xl flex flex-col md:flex-row md:justify-between md:items-center shadow-md hover:shadow-xl transition-all font-sans"
                      >
                        <div className="mb-4 md:mb-0 px-1">
                          <div className="text-lg md:text-xl font-black text-[#E6B52C] group-hover:text-white transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/50 font-bold mt-1">
                            {p.role || "Gamaforce Team"}
                          </div>
                        </div>

                        <a
                          href={wa}
                          target="_blank"
                          className="flex items-center justify-between gap-4 px-5 py-3 bg-[#E6B52C] hover:bg-white text-[#1C2B5A] rounded-xl md:rounded-2xl font-black transition-all shadow-md active:scale-95"
                        >
                          <span className="text-sm tracking-tight">{p.phone}</span>
                          <div className="bg-[#1C2B5A] text-white text-[9px] px-2 py-1 rounded-md">WA</div>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>

              {!loading && (
                <div className="mt-8 md:mt-12 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-[#E6B52C]/15 border border-[#E6B52C]/30 text-center font-sans">
                  <p className="text-[#1C2B5A] font-bold text-sm md:text-base">
                    For official partnerships & proposals<br />
                    <span className="text-slate-400 font-medium text-xs md:text-sm">
                      Please reach out to our public relations division.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <SponsorsFooter />
    </div>
  );
}

function SocialLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      className="flex items-center gap-4 px-5 py-3 md:px-6 md:py-4 bg-[#1C2B5A] hover:text-white rounded-xl md:rounded-2xl font-bold text-[#E6B52C] transition-all group text-sm md:text-base"
    >
      <Icon className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}