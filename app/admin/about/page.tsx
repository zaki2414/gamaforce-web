"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Info, 
  Phone, 
  Plus, 
  ArrowLeft, 
  Save, 
  Trash2, 
  Youtube, 
  UserPlus,
  Settings2,
  CheckCircle2
} from "lucide-react";

export default function AdminAboutPage() {
  const router = useRouter();
  const [about, setAbout] = useState<any>(null);
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔐 Auth Check
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/admin/login");
    }
    checkAuth();
  }, [router]);

  async function load() {
    setInitialLoading(true);
    // Load About Content
    const { data: aboutData } = await supabase.from("about_content").select("*").single();
    // Load Contact Persons
    const { data: personData } = await supabase.from("contact_persons").select("*").order("order_index");

    setAbout(aboutData);
    setPersons(personData ?? []);
    setInitialLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // --- SAVE ABOUT ---
  async function saveAbout() {
    setLoading(true);
    const { error } = await supabase.from("about_content").update({
      title: about.title,
      description: about.description,
      youtube_url: about.youtube_url,
    }).eq("id", about.id);

    setLoading(false);
    if (error) showToast(`❌ ${error.message}`);
    else showToast("✅ Konten About berhasil diperbarui!");
  }

  // --- SAVE INDIVIDUAL CONTACT ---
  async function saveContact(c: any) {
    setLoading(true);
    const { error } = await supabase.from("contact_persons").update({
      name: c.name,
      role: c.role,
      phone: c.phone,
    }).eq("id", c.id);

    setLoading(false);
    if (error) showToast(`❌ ${error.message}`);
    else showToast(`✅ Kontak ${c.name} diperbarui!`);
  }

  // --- ADD NEW CONTACT ROW ---
  async function addContact() {
    const { data, error } = await supabase
      .from("contact_persons")
      .insert([{ name: "Kontak Baru", role: "Staff", phone: "", order_index: persons.length }])
      .select();

    if (error) showToast(`❌ ${error.message}`);
    else if (data) {
      setPersons([...persons, data[0]]);
      showToast("✅ Baris kontak ditambahkan");
    }
  }

  // --- DELETE CONTACT ---
  async function deleteContact(id: string) {
    if (!confirm("Hapus kontak ini secara permanen?")) return;
    
    const { error } = await supabase.from("contact_persons").delete().eq("id", id);
    if (error) showToast(`❌ ${error.message}`);
    else {
      setPersons(persons.filter(p => p.id !== id));
      showToast("✅ Kontak dihapus");
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#1C2B5A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2B5A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1C2B5A]">
      {/* Navbar */}
      <nav className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tight font-sans">About & Contact</h1>
          </div>
          {message && (
            <div className="flex items-center gap-2 bg-[#1C2B5A] text-white px-4 py-2 rounded-full text-xs font-bold animate-in fade-in zoom-in">
              <CheckCircle2 className="w-3 h-3 text-white-400" /> {message}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-12">
          
          {/* SECTION: ABOUT CONTENT */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#1C2B5A] text-white p-2 rounded-lg">
                <Settings2 className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black font-sans">Profil Organisasi</h2>
            </div>

            <div className="bg-[#1C2B5A]/10 border-2 border-[#1C2B5A] rounded-4xl p-8 shadow-sm font-sans">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#1C2B5A] mb-2">Judul Besar</label>
                  <input
                    value={about?.title || ""}
                    onChange={(e) => setAbout({ ...about, title: e.target.value })}
                    className="w-full p-4 bg-white border-2 border-[#1C2B5A]/60 rounded-2xl focus:border-[#1C2B5A] outline-none transition-all font-bold text-lg"
                    placeholder="Contoh: Tentang Kami"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-border-[#1C2B5A] mb-2">Deskripsi Narasi</label>
                  <textarea
                    value={about?.description || ""}
                    onChange={(e) => setAbout({ ...about, description: e.target.value })}
                    rows={6}
                    className="w-full p-4 bg-white border-2 border-[#1C2B5A]/60 rounded-2xl focus:border-[#1C2B5A] outline-none transition-all font-medium leading-relaxed"
                    placeholder="Tuliskan sejarah atau visi misi organisasi..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-border-[#1C2B5A] mb-2">Link Video YouTube</label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                    <input
                      value={about?.youtube_url || ""}
                      onChange={(e) => setAbout({ ...about, youtube_url: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 max-w-full font-sans bg-white border-2 border-[#1C2B5A]/60 rounded-2xl focus:border-[#1C2B5A] outline-none transition-all text-sm"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <button 
                  onClick={saveAbout}
                  disabled={loading}
                  className="bg-[#1C2B5A] hover:bg-[#1C2B5A]/80 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#1C2B5A]/10 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Menyimpan..." : "Simpan Perubahan Profil"}
                </button>
              </div>
            </div>
          </section>

          {/* SECTION: CONTACT PERSONS */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-[#E6B52C] text-white p-2 rounded-lg">
                  <Phone className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black font-sans">Hubungi Kami</h2>
              </div>
              <button 
                onClick={addContact}
                className="flex items-center gap-2 text-[#E6B52C] hover:text-white px-4 py-2 rounded-xl font-bold font-sans text-sm hover:bg-[#E6B52C] transition-colors border border-[#E6B52C] cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Tambah Personel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 font-sans">
              {persons.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-medium">
                  Belum ada kontak terdaftar.
                </div>
              ) : (
                persons.map((p, i) => (
                  <div key={p.id} className="group bg-white border-2 border-slate-100 p-4 rounded-2xl hover:border-[#E6B52C] transition-all shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                      <input
                        placeholder="Nama Lengkap"
                        value={p.name || ""}
                        onChange={(e) => {
                          const copy = [...persons];
                          copy[i].name = e.target.value;
                          setPersons(copy);
                        }}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-[#E6B52C] transition-all"
                      />
                      <input
                        placeholder="Jabatan (cth: GM)"
                        value={p.role || ""}
                        onChange={(e) => {
                          const copy = [...persons];
                          copy[i].role = e.target.value;
                          setPersons(copy);
                        }}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-[#E6B52C] transition-all"
                      />
                      <input
                        placeholder="WhatsApp (cth: 0812...)"
                        value={p.phone || ""}
                        onChange={(e) => {
                          const copy = [...persons];
                          copy[i].phone = e.target.value;
                          setPersons(copy);
                        }}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-[#E6B52C] transition-all"
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => saveContact(p)}
                        className="p-3 text-[#E6B52C] hover:text-white border border-[#E6B52C] hover:bg-[#E6B52C] rounded-xl  transition-all active:scale-90 cursor-pointer"
                        title="Simpan Baris Ini"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteContact(p.id)}
                        className="p-3  text-red-400 hover:text-white border border-red-400 hover:bg-red-400 rounded-xl transition-all cursor-pointer"
                        title="Hapus Kontak"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}