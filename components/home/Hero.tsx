"use client";

export default function Hero() {
  return (
    <section className="gf-grid min-h-[85vh] flex items-center">
      <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div>
          <h1 className="text-6xl font-extrabold text-[#1C2B5A] leading-tight">
            GAMAFORCE
          </h1>
          <p className="mt-4 text-[#64748B] max-w-md">
            Guardians of the Sky — UGM UAV Competition Team
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="/subteam"
              className="bg-[#E6B52C] border-2 border-[#1C2B5A] px-6 py-3 rounded-xl font-bold text-[#1C2B5A] hover:-translate-y-2 transition"
            >
              Explore Teams
            </a>
            <a
              href="/contact"
              className="bg-[#F8FAFC] border-2 border-[#1C2B5A] px-6 py-3 rounded-xl text-[#1C2B5A] hover:bg-[#1C2B5A] hover:-translate-y-2 hover:text-white transition"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border-2 border-[#1C2B5A] rounded-xl p-4 shadow-lg">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            Hero Video / Image
          </div>
        </div>

      </div>
    </section>
  );
}
