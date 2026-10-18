import { getClientAuth } from "@/lib/firebase/client";

export type UploadFolder =
  | "employees"
  | "projects"
  | "services"
  | "blogs"
  | "countries"
  | "logos";

export async function uploadImageFile(file: File, folder: UploadFolder) {
  const user = getClientAuth().currentUser;
  const token = user ? await user.getIdToken() : null;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "Upload failed");
  }

  return payload.url;
}
