"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Instagram, Linkedin, Youtube, Mail, MapPin, Phone, Share2 } from "lucide-react";

/* ---------- SKELETON COMPONENTS ---------- */
function ContactInfoSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
        <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
      </div>
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="w-full h-48 bg-gray-200 rounded-3xl" />
    </div>
  );
}

function SocialSkeleton() {
  return (
    <div className="bg-gray-200 rounded-[2.5rem] p-10 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gray-300 rounded-2xl" />
        <div className="h-6 bg-gray-300 rounded-lg w-1/2" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-gray-300 rounded-2xl w-full" />
        ))}
      </div>
    </div>
  );
}

function PersonSkeleton() {
  return (
    <div className="bg-gray-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center animate-pulse">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="w-32 h-10 bg-gray-200 rounded-2xl mt-4 md:mt-0" />
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
      const { data: infoData } = await supabase
        .from("contact_info")
        .select("*")
        .single();

      const { data: personData } = await supabase
        .from("contact_persons")
        .select("*")
        .order("order_index");

      setInfo(infoData);
      setPersons(personData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] gf-grid">
      {/* HERO */}
      <div className="relative px-8 py-32 overflow-hidden bg-[#0F1E3D] text-white">
        <div className="absolute -top-40 -left-40 w-125 h-125 bg-[#E6B52C]/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-30%] right-[-10%] w-125 h-125 bg-[#1C2B5A]/60 blur-[160px] rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Contact <span className="text-[#E6B52C]">Us</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-lg">
            Connect with Gamaforce — collaboration, partnership, or mission alignment.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            {loading ? (
              <>
                <ContactInfoSkeleton />
                <SocialSkeleton />
              </>
            ) : (
              <>
                {/* Address Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-[#1C2B5A]/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                      <MapPin className="w-6 h-6 text-[#1C2B5A]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#1C2B5A]">Secretariat</h2>
                  </div>

                  <p className="text-[#1C2B5A]/70 font-medium mb-8 leading-relaxed">
                    {info?.address}
                  </p>

                  {info?.maps_embed && (
                    <div
                      className="rounded-3xl overflow-hidden border border-[#1C2B5A]/10 transition-all duration-700 shadow-inner"
                      dangerouslySetInnerHTML={{
                        __html: info.maps_embed.replace('width="600"', 'width="100%"')
                      }}
                    />
                  )}
                </div>

                {/* Social Card */}
                <div className="bg-[#E6B52C] rounded-[2.5rem] p-10 shadow-xl shadow-[#E6B52C]/20">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center shadow-sm">
                      <Share2 className="w-6 h-6 text-[#1C2B5A]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#1C2B5A]">Social Media</h2>
                  </div>

                  <div className="grid gap-4">
                    {info?.instagram && (
                      <SocialLink icon={Instagram} label="Instagram" href={info.instagram} />
                    )}
                    {info?.linkedin && (
                      <SocialLink icon={Linkedin} label="LinkedIn" href={info.linkedin} />
                    )}
                    {info?.youtube && (
                      <SocialLink icon={Youtube} label="YouTube" href={info.youtube} />
                    )}
                    {info?.email && (
                      <SocialLink icon={Mail} label={info.email} href={`mailto:${info.email}`} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-[#1C2B5A]/5 h-full">
              <h2 className="text-3xl font-black text-[#1C2B5A] mb-12 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <Phone className="w-6 h-6 text-[#E6B52C]" />
                </div>
                Contact Persons
              </h2>

              <div className="space-y-6">
                {loading ? (
                  <>
                    <PersonSkeleton />
                    <PersonSkeleton />
                    <PersonSkeleton />
                  </>
                ) : (
                  persons.map((p) => {
                    const wa = `https://wa.me/${p.phone.replace(/\D/g, "")}`;
                    return (
                      <div
                        key={p.id}
                        className="group bg-[#1C2B5A] p-6 rounded-[2.5rem] flex flex-col md:flex-row md:justify-between md:items-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/5"
                      >
                        <div className="mb-4 md:mb-0">
                          <div className="text-xl font-black text-[#E6B52C] group-hover:text-white transition-colors">
                            {p.name}
                          </div>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold mt-1">
                            {p.role || "Gamaforce Team"}
                          </div>
                        </div>

                        <a
                          href={wa}
                          target="_blank"
                          className="inline-flex items-center justify-between gap-4 px-6 py-3 bg-[#E6B52C] hover:bg-white text-[#1C2B5A] rounded-2xl font-black transition-all duration-300 shadow-md active:scale-95"
                        >
                          <span className="text-sm tracking-tight">{p.phone}</span>
                          <div className="bg-[#1C2B5A] text-white text-[10px] px-2 py-1 rounded-lg">
                            WHATSAPP
                          </div>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>

              {!loading && (
                <div className="mt-12 p-8 rounded-4xl bg-[#E6B52C]/15 border border-[#E6B52C] text-center">
                  <p className="text-[#1C2B5A] font-bold">
                    For official partnerships & proposals,<br />
                    <span className="text-slate-400 font-medium text-sm">
                      please reach out to our public relations division.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Social Link ---------- */
function SocialLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      className="flex items-center gap-4 px-6 py-4 bg-white/40 hover:bg-white/70 rounded-2xl font-bold text-[#1C2B5A] transition-all group"
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}