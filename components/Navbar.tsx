"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (pathname.startsWith("/admin")) return null;

  const logoUrl = supabase.storage
    .from("brand")
    .getPublicUrl("LogoGamaforce.png").data.publicUrl;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0F1E3D]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 z-50">
            <img
              src={logoUrl}
              alt="Gamaforce"
              className="h-6 sm:h-7 w-auto object-contain"
            />
            <span className="text-sm sm:text-md font-title text-[#F8FAFC] pt-1">
              Gamaforce
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-sans">
            {navItems.map((item) => {
              const active = item.href === "/" 
                ? pathname === "/" 
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    text-sm font-sans font-bold transition relative
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden z-50 p-2 text-white/70 hover:text-[#E6B52C] transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`
          fixed top-16 right-0 bottom-0 w-full sm:w-80 bg-[#0F1E3D] z-40 lg:hidden
          transform transition-transform duration-300 ease-in-out font-sans
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          border-l border-white/10
        `}
      >
        <div className="flex flex-col p-6 space-y-2">
          {navItems.map((item) => {
            const active = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-3 rounded-lg text-base font-bold transition-all
                  ${
                    active
                      ? "bg-[#E6B52C]/10 text-[#E6B52C] border-l-4 border-[#E6B52C]"
                      : "text-white/70 hover:bg-white/5 hover:text-[#E6B52C]"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <p className="text-white/40 text-xs text-center font-medium">
            Universitas Gadjah Mada's<br />Unmanned Aerial Vehicle Team
          </p>
        </div>
      </div>
    </>
  );
}