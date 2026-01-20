"use client";

export default function Hero() {
  return (
    <section className="gf-grid min-h-[85vh] flex items-center py-12 md:py-0">
      <div className="max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">

        {/* LEFT - Text Content */}
        {/* Tambah 'text-center md:text-left' agar di HP rata tengah, di laptop rata kiri */}
        <div className="text-center md:text-left order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl text-[#1C2B5A] font-title">
            GAMAFORCE
          </h1>
          <p className="text-[#64748B] max-w-md mx-auto md:mx-0 font-sans mt-2 text-sm md:text-base">
            Guardians of the Sky — UGM UAV Competition Team
          </p>

          {/* Button Group - Center di HP, Left di Laptop */}
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

        {/* RIGHT - Image/Video */}
        {/* Di HP tampil di atas (order-1), di Laptop tampil di kanan (order-2) */}
        <div className="bg-white border-2 border-[#1C2B5A] rounded-2xl p-2 md:p-4 shadow-lg order-1 md:order-2 w-full max-w-lg mx-auto md:max-w-none">
          <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-bold uppercase tracking-widest font-sans">
            Hero Video / Image
          </div>
        </div>

      </div>
    </section>
  );
}