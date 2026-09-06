"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadImageFile } from "@/lib/authenticated-upload";

type PhotoUploadProps = {
  value: string;
  onChange: (url: string) => void;
  name?: string;
};

export function PhotoUpload({ value, onChange, name }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageFile(file, "employees");
      onChange(url);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 rounded-2xl">
          <AvatarImage src={value} alt={name || "Profile"} className="rounded-2xl" />
          <AvatarFallback className="rounded-2xl text-lg">
            {name
              ? name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : <Camera className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Profile Photo</p>
        <p className="text-xs text-muted-foreground">
          JPG or PNG, up to 5MB. Uploaded securely to Cloudinary.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(uploading && "opacity-70")}
        >
          <Upload className="h-4 w-4" />
          {value ? "Change photo" : "Upload photo"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
