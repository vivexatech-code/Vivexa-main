import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { verifyUploadToken } from "@/lib/verify-upload-auth";

export const runtime = "nodejs";

const FOLDERS = {
  employees: "vivexa/employees",
  projects: "vivexa/projects",
  services: "vivexa/services",
  blogs: "vivexa/blogs",
} as const;

type FolderKey = keyof typeof FOLDERS;

function resolveFolder(value: FormDataEntryValue | null): FolderKey {
  if (
    value === "projects" ||
    value === "services" ||
    value === "employees" ||
    value === "blogs"
  ) {
    return value;
  }
  return "employees";
}

export async function POST(request: Request) {
  try {
    const authorized = await verifyUploadToken(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folderKey = resolveFolder(formData.get("folder"));
    const folder = FOLDERS[folderKey];

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 5MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    const hasSignedCredentials =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    const transformation =
      folderKey === "employees"
        ? [
            { width: 800, height: 800, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ]
        : [
            { width: 1600, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ];

    if (hasSignedCredentials) {
      const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: "image",
        transformation,
      });
      return NextResponse.json({ url: result.secure_url });
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          error:
            "Cloudinary is not configured. Set CLOUDINARY_* API keys or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
        },
        { status: 500 },
      );
    }

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", base64);
    cloudinaryForm.append("upload_preset", uploadPreset);
    cloudinaryForm.append("folder", folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      },
    );

    const payload = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(payload.error?.message || "Cloudinary upload failed");
    }

    return NextResponse.json({ url: payload.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
