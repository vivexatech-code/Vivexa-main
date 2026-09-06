"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IdCardBack, IdCardFront } from "@/components/id-card/id-card-sides";
import { PhotoAdjuster } from "@/components/id-card/photo-adjuster";
import { downloadIdCardPdf } from "@/lib/id-card-pdf";
import { ID_CARD_PREVIEW_WIDTH } from "@/lib/id-card-layout";
import { getCroppedImageBlob } from "@/lib/crop-image";
import { updateEmployeePhotoCrop } from "@/lib/firebase/employees";
import { uploadImageFile } from "@/lib/authenticated-upload";
import type { Employee, PhotoCrop } from "@/types/employee";
import { DEFAULT_PHOTO_CROP } from "@/types/employee";

type IdCardDialogProps = {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeUpdated?: (employee: Employee) => void;
};

export function IdCardDialog({
  employee,
  open,
  onOpenChange,
  onEmployeeUpdated,
}: IdCardDialogProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [livePhotoUrl, setLivePhotoUrl] = useState<string | null>(null);
  const [cropState, setCropState] = useState<PhotoCrop>(DEFAULT_PHOTO_CROP);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [localEmployee, setLocalEmployee] = useState<Employee | null>(employee);

  useEffect(() => {
    if (open && employee) {
      setLocalEmployee(employee);
      setCropState(employee.photoCrop ?? DEFAULT_PHOTO_CROP);
      setLivePhotoUrl(null);
      setAreaPixels(null);
    }
  }, [open, employee]);

  // Revoke object URLs to avoid leaks
  useEffect(() => {
    return () => {
      if (livePhotoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(livePhotoUrl);
      }
    };
  }, [livePhotoUrl]);

  const sourceImage = useMemo(() => {
    if (!localEmployee) return "";
    return localEmployee.profilePhotoOriginal || localEmployee.profilePhoto;
  }, [localEmployee]);

  const previewPhoto = livePhotoUrl || localEmployee?.profilePhoto;

  const handleLivePreview = useCallback((url: string | null) => {
    setLivePhotoUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  const handleCropChange = useCallback(
    (crop: PhotoCrop, area: Area | null) => {
      setCropState(crop);
      setAreaPixels(area);
    },
    []
  );

  const handleSaveCrop = async () => {
    if (!localEmployee || !sourceImage || !areaPixels) {
      toast.error("Adjust the photo before saving");
      return;
    }

    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(sourceImage, areaPixels, 1024);
      const file = new File([blob], `${localEmployee.employeeId}-crop.jpg`, {
        type: "image/jpeg",
      });
      const url = await uploadImageFile(file, "employees");

      const original =
        localEmployee.profilePhotoOriginal || localEmployee.profilePhoto;

      await updateEmployeePhotoCrop(localEmployee.employeeId, {
        profilePhoto: url,
        profilePhotoOriginal: original,
        photoCrop: cropState,
      });

      const updated: Employee = {
        ...localEmployee,
        profilePhoto: url,
        profilePhotoOriginal: original,
        photoCrop: cropState,
        updatedAt: new Date().toISOString(),
      };

      setLocalEmployee(updated);
      handleLivePreview(null);
      onEmployeeUpdated?.(updated);
      toast.success("Photo crop saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save crop");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!localEmployee || !frontRef.current || !backRef.current) return;
    setDownloading(true);
    try {
      await downloadIdCardPdf(
        frontRef.current,
        backRef.current,
        `Vivexa-ID-${localEmployee.employeeId}.pdf`
      );
      toast.success("Print-ready ID card PDF downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate PDF"
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ID Card Preview</DialogTitle>
          <DialogDescription>
            Crop and position the photo with a live card preview, then download
            the print-ready PDF.
            {localEmployee ? ` — ${localEmployee.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        {localEmployee ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
                <div className="space-y-2">
                  <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Front · Live preview
                  </p>
                  <div className="shadow-lift">
                    <IdCardFront
                      ref={frontRef}
                      employee={localEmployee}
                      width={ID_CARD_PREVIEW_WIDTH}
                      photoUrl={previewPhoto}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Back
                  </p>
                  <div className="shadow-lift">
                    <IdCardBack
                      ref={backRef}
                      employee={localEmployee}
                      width={ID_CARD_PREVIEW_WIDTH}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <PhotoAdjuster
                  imageSrc={sourceImage}
                  initialCrop={localEmployee.photoCrop}
                  onLivePreview={handleLivePreview}
                  onCropChange={handleCropChange}
                />
                <Button
                  type="button"
                  variant="soft"
                  className="w-full"
                  onClick={handleSaveCrop}
                  disabled={saving || !areaPixels}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save photo crop
                </Button>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
