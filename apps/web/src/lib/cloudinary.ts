// Unsigned upload straight from the browser to Cloudinary — no API secret
// needed on our side, so this can't leak anything even though it runs client-side.
// Requires an unsigned upload preset configured in the Cloudinary dashboard.
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is niet geconfigureerd (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/UPLOAD_PRESET ontbreken).");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Upload naar Cloudinary mislukt.");
  }

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}
