"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from "browser-image-compression";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  ArrowLeft,
  Trash2,
  Edit3,
  Layers,
  Hash,
  UploadCloud,
  EyeOff,
  X,
  Camera,
  CheckCircle2,
} from "lucide-react";

/* ================= TYPES ================= */

type Gallery = {
  id: string;
  title: string;
  description: string | null;
  photo_url: string;
  layout_type: "normal" | "wide" | "tall" | "featured";
  order_index: number;
  is_published: boolean;
};

/* ================= HELPERS ================= */

async function detectLayoutType(file: File): Promise<Gallery["layout_type"]> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const ratio = img.width / img.height;
      URL.revokeObjectURL(url);

      if (ratio >= 1.8) return resolve("wide");
      if (ratio <= 0.75) return resolve("tall");
      if (ratio >= 0.9 && ratio <= 1.1) return resolve("featured");
      return resolve("normal");
    };

    img.src = url;
  });
}

/* ================= PAGE ================= */

export default function AdminGalleryPage() {
  const router = useRouter();

  const [items, setItems] = useState<Gallery[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [layoutType, setLayoutType] = useState<Gallery["layout_type"]>("normal");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  /* ================= AUTH ================= */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  /* ================= LOAD ================= */

  async function loadGallery() {
    setInitialLoading(true);
    const { data } = await supabase
      .from("galleries")
      .select("*")
      .order("order_index", { ascending: true });
    setItems(data || []);
    setInitialLoading(false);
  }

  useEffect(() => {
    loadGallery();
  }, []);

  /* ================= ACTIONS ================= */

  async function uploadPhoto(file: File) {
    setUploading(true);
    setMessage("⏳ Menganalisa & mengunggah gambar...");

    try {
      const detectedLayout = await detectLayoutType(file);
      setLayoutType(detectedLayout);

      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });

      const url = await uploadToCloudinary(compressed);
      setImageUrl(url);
      setMessage(`✅ Berhasil • Layout: ${detectedLayout.toUpperCase()}`);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("❌ Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!title || !imageUrl) {
      setMessage("⚠️ Judul & gambar wajib diisi");
      return;
    }

    setLoading(true);

    const payload = {
      title,
      description: description.trim() || null,
      photo_url: imageUrl,
      layout_type: layoutType,
      order_index: orderIndex,
      is_published: isPublished,
    };

    const { error } = editingId
      ? await supabase.from("galleries").update(payload).eq("id", editingId)
      : await supabase.from("galleries").insert(payload);

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage(editingId ? "✅ Konten diperbarui" : "✅ Konten ditambahkan");
      resetForm();
      loadGallery();
      setTimeout(() => setMessage(""), 3000);
    }

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLayoutType("normal");
    setOrderIndex(0);
    setIsPublished(true);
    setMessage("");
  }

  function handleEdit(item: Gallery) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setImageUrl(item.photo_url);
    setLayoutType(item.layout_type);
    setOrderIndex(item.order_index);
    setIsPublished(item.is_published);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus foto ini?")) return;
    const { error } = await supabase.from("galleries").delete().eq("id", id);
    if (!error) loadGallery();
  }

  if (initialLoading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tight">Kelola Galeri</h1>
          </div>
          {editingId && (
            <button 
              onClick={resetForm} 
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" /> Batal Edit
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: FORM */}
          <div className="lg:col-span-5">
            <div className={`sticky top-28 p-8 rounded-3xl border-2 transition-all duration-300 ${editingId ? 'bg-teal-50 border-teal-100' : 'bg-teal-50/30 border-teal-100'}`}>
              <div className={`${editingId ? 'bg-teal-500' : 'bg-teal-600'} text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-100`}>
                <Camera className="w-6 h-6" />
              </div>
              
              <h2 className="text-2xl font-black mb-2">
                {editingId ? "Update Foto" : "Unggah Foto"}
              </h2>
              <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                Gunakan foto berkualitas tinggi. Sistem akan mendeteksi layout secara otomatis.
              </p>

              <div className="space-y-5">
                {/* Image Upload Area */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                    <UploadCloud className="w-3 h-3" /> File Gambar
                  </label>
                  {imageUrl ? (
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-teal-200 aspect-video bg-white shadow-inner">
                      <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer backdrop-blur-sm">
                        <span className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm shadow-xl">Ganti Foto</span>
                        <input 
                          type="file" 
                          hidden 
                          accept="image/*" 
                          onChange={(e) => e.target.files && uploadPhoto(e.target.files[0])} 
                        />
                      </label>
                      {uploading && (
                         <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                         </div>
                      )}
                    </div>
                  ) : (
                    <label className={`w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${uploading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'}`}>
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-slate-300 mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Gambar</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        disabled={uploading}
                        onChange={(e) => e.target.files && uploadPhoto(e.target.files[0])} 
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Judul Foto</label>
                  <input
                    placeholder="Contoh: Tes Terbang Elang Hitam"
                    className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 focus:outline-none transition-all font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                      <Layers className="w-3 h-3" /> Layout
                    </label>
                    <select
                      value={layoutType}
                      onChange={(e) => setLayoutType(e.target.value as any)}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:outline-none transition-all font-bold text-sm appearance-none"
                    >
                      <option value="normal">Normal (4:3)</option>
                      <option value="wide">Wide (16:9)</option>
                      <option value="tall">Tall (3:4)</option>
                      <option value="featured">Featured (1:1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2">
                      <Hash className="w-3 h-3" /> Urutan
                    </label>
                    <input
                      type="number"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(+e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Deskripsi Singkat</label>
                  <textarea
                    placeholder="Berikan konteks singkat..."
                    rows={2}
                    className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 focus:outline-none transition-all font-medium text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    {isPublished ? <CheckCircle2 className="w-4 h-4 text-teal-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    Status Publikasi
                  </span>
                  <button 
                    onClick={() => setIsPublished(!isPublished)}
                    className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? 'bg-teal-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <button 
                  onClick={handleSubmit}
                  disabled={loading || uploading}
                  className={`cursor-pointer w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${editingId ? 'bg-teal-500 hover:bg-teal-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingId ? "Perbarui Konten" : "Terbitkan ke Galeri"}
                    </>
                  )}
                </button>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 shadow-sm ${message.includes("✅") ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: LIST */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                Koleksi Galeri <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{items.length}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-24 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                  <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium italic">Belum ada foto yang diunggah.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col bg-white border-2 rounded-3xl transition-all duration-300 overflow-hidden ${editingId === item.id ? 'border-teal-400 ring-4 ring-teal-50 shadow-xl' : 'border-slate-50 hover:border-teal-500'}`}
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img
                        src={item.photo_url}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                        alt={item.title}
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                         <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-sm border border-slate-100 w-fit">
                           {item.layout_type}
                         </span>
                         {!item.is_published && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-sm w-fit flex items-center gap-1">
                               <EyeOff className="w-3 h-3" /> Draft
                            </span>
                         )}
                      </div>
                      <div className="absolute top-4 right-4 h-8 w-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-white/20">
                         #{item.order_index}
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="font-black text-slate-900 group-hover:text-teal-600 transition-colors leading-tight mb-2 truncate">
                        {item.title}
                      </h4>
                      
                      {item.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6 min-h-8">
                          {item.description}
                        </p>
                      )}

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-teal-100"
                          title="Edit Foto"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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