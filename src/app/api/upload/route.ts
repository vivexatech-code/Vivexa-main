import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const hasSignedCredentials =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasSignedCredentials) {
      const result = await cloudinary.uploader.upload(base64, {
        folder: "vivexa/employees",
        resource_type: "image",
        transformation: [
          { width: 800, height: 800, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      return NextResponse.json({ url: result.secure_url });
    }

    // Unsigned upload via upload preset (matches NEXT_PUBLIC_CLOUDINARY_* setup)
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
        { status: 500 }
      );
    }

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", base64);
    cloudinaryForm.append("upload_preset", uploadPreset);
    cloudinaryForm.append("folder", "vivexa/employees");

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
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
      { status: 500 }
    );
  }
}
