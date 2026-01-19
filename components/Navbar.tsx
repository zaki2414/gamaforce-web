"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Executive Board", href: "/executive-board" },
  { label: "Management", href: "/management" },
  { label: "Subteams", href: "/subteam" },
  { label: "Achievements", href: "/achievements" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const logoUrl = supabase.storage
    .from("brand")
    .getPublicUrl("LogoGamaforce.png").data.publicUrl;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F1E3D]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Gamaforce"
            className="h-7 w-auto object-contain"
          />
          <span className="hidden md:block text-lg font-extrabold text-[#F8FAFC]">
            Gamaforce
          </span>
        </Link>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-sm font-bold transition relative
                  ${
                    active
                      ? "text-[#E6B52C]"
                      : "text-white/70 hover:text-[#E6B52C]"
                  }
                `}
              >
                {item.label}

                {active && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-[#E6B52C] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
