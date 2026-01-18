export async function uploadToCloudinary(file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "gamaforce_members");

  // 🔥 force unique file
  form.append("public_id", `member_${Date.now()}`);
  form.append("folder", "gamaforce/members");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dugxga1vc/image/upload",
    {
      method: "POST",
      body: form,
    }
  );

  const data = await res.json();

  if (!data.secure_url) throw new Error("Upload failed");

  return data.secure_url as string;
}
