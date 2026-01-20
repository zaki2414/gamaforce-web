"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  Building2,
  X 
} from "lucide-react";

type Sponsor = {
  id: string;
  name: string;
  logo_path: string;
};

export default function AdminSponsorsPage() {
  const router = useRouter();
  const [data, setData] = useState<Sponsor[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    const { data } = await supabase.from("sponsors").select("*").order("name");
    setData(data ?? []);
    setInitialLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Handle preview gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  async function upload() {
    if (!name || !file) {
      setMessage("⚠️ Nama sponsor dan logo wajib diisi");
      return;
    }

    setLoading(true);
    const path = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("sponsors")
      .upload(path, file);

    if (uploadError) {
      setMessage(`❌ Upload Gagal: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("sponsors").insert({
      name,
      logo_path: path,
    });

    if (dbError) {
      setMessage(`❌ DB Error: ${dbError.message}`);
    } else {
      setMessage("✅ Sponsor berhasil ditambahkan");
      setName("");
      setFile(null);
      setPreviewUrl(null);
      await load();
    }
    setLoading(false);
  }

  async function remove(item: Sponsor) {
    if (!confirm(`Hapus sponsor ${item.name}?`)) return;

    await supabase.storage.from("sponsors").remove([item.logo_path]);
    await supabase.from("sponsors").delete().eq("id", item.id);
    await load();
    setMessage("✅ Sponsor berhasil dihapus");
  }

  if (initialLoading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black tracking-tight">Kelola Sponsor</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Kolom Kiri: Form Upload */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-slate-50 p-8 rounded-3xl border-2 border-slate-100">
              <div className="bg-pink-100 text-pink-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mb-2">Tambah Partner</h2>
              <p className="text-slate-500 mb-8 font-medium text-sm">Upload logo sponsor atau partner resmi.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Nama Instansi</label>
                  <input
                    placeholder="Nama Perusahaan/Brand"
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-pink-500 outline-none transition-all font-bold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Logo Logo</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-white hover:border-pink-300 transition-colors">
                    {previewUrl ? (
                      <div className="relative group">
                        <img src={previewUrl} className="h-32 w-full object-contain rounded-lg" alt="Preview" />
                        <button 
                          onClick={() => {setFile(null); setPreviewUrl(null);}}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center py-6 cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-xs font-bold text-slate-400">Pilih File Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                </div>

                <button 
                  onClick={upload}
                  disabled={loading}
                  className="w-full bg-pink-900 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  {loading ? "Proses Upload..." : "Upload Sponsor"}
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-[11px] font-black text-center uppercase tracking-wider ${message.includes("✅") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Gallery Sponsor */}
          <div className="lg:col-span-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              Partner Terdaftar <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{data.length}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {data.length === 0 ? (
                <div className="col-span-full py-24 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center text-slate-300">
                  <Building2 className="w-12 h-12 mb-4" />
                  <p className="font-bold italic">Belum ada logo terupload.</p>
                </div>
              ) : (
                data.map((s) => (
                  <div key={s.id} className="group relative bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-pink-600 hover:shadow-xl transition-all duration-300">
                    <div className="h-28 flex items-center justify-center mb-4">
                      <img
                        src={supabase.storage.from("sponsors").getPublicUrl(s.logo_path).data.publicUrl}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                        alt={s.name}
                      />
                    </div>
                    <div className="text-center border-t border-slate-50 pt-4">
                      <p className="text-sm font-black text-slate-700 truncate mb-2">{s.name}</p>
                      <button
                        onClick={() => remove(s)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}