"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DEFAULT_PHOTO_CROP, type PhotoCrop } from "@/types/employee";
import { getCroppedImageDataUrl } from "@/lib/crop-image";
import styles from "./photo-adjuster.module.css";

type PhotoAdjusterProps = {
  imageSrc: string;
  initialCrop?: PhotoCrop;
  onLivePreview: (previewUrl: string | null) => void;
  onCropChange: (crop: PhotoCrop, areaPixels: Area | null) => void;
};

export function PhotoAdjuster({
  imageSrc,
  initialCrop,
  onLivePreview,
  onCropChange,
}: PhotoAdjusterProps) {
  const [crop, setCrop] = useState({
    x: initialCrop?.x ?? DEFAULT_PHOTO_CROP.x,
    y: initialCrop?.y ?? DEFAULT_PHOTO_CROP.y,
  });
  const [zoom, setZoom] = useState(initialCrop?.zoom ?? DEFAULT_PHOTO_CROP.zoom);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  const emitCrop = useCallback(
    (nextCrop: { x: number; y: number }, nextZoom: number, area: Area | null) => {
      onCropChange({ x: nextCrop.x, y: nextCrop.y, zoom: nextZoom }, area);
    },
    [onCropChange]
  );

  const onCropComplete = useCallback(
    async (_area: Area, croppedAreaPixels: Area) => {
      setAreaPixels(croppedAreaPixels);
      emitCrop(crop, zoom, croppedAreaPixels);
      try {
        const url = await getCroppedImageDataUrl(
          imageSrc,
          croppedAreaPixels,
          640
        );
        onLivePreview(url);
      } catch {
        onLivePreview(null);
      }
    },
    [crop, zoom, emitCrop, imageSrc, onLivePreview]
  );

  useEffect(() => {
    setCrop({
      x: initialCrop?.x ?? DEFAULT_PHOTO_CROP.x,
      y: initialCrop?.y ?? DEFAULT_PHOTO_CROP.y,
    });
    setZoom(initialCrop?.zoom ?? DEFAULT_PHOTO_CROP.zoom);
  }, [imageSrc, initialCrop?.x, initialCrop?.y, initialCrop?.zoom]);

  const reset = () => {
    setCrop({ x: DEFAULT_PHOTO_CROP.x, y: DEFAULT_PHOTO_CROP.y });
    setZoom(DEFAULT_PHOTO_CROP.zoom);
    emitCrop(
      { x: DEFAULT_PHOTO_CROP.x, y: DEFAULT_PHOTO_CROP.y },
      DEFAULT_PHOTO_CROP.zoom,
      areaPixels
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Adjust photo</p>
          <p className={styles.hint}>Drag to reposition · scroll or slide to zoom</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          <RefreshCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className={styles.cropFrame}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={(next) => {
            setCrop(next);
            emitCrop(next, zoom, areaPixels);
          }}
          onZoomChange={(next) => {
            setZoom(next);
            emitCrop(crop, next, areaPixels);
          }}
          onCropComplete={onCropComplete}
          objectFit="horizontal-cover"
        />
      </div>

      <div className={styles.zoomRow}>
        <Label htmlFor="photo-zoom" className={styles.zoomLabel}>
          Zoom
        </Label>
        <input
          id="photo-zoom"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => {
            const next = Number(e.target.value);
            setZoom(next);
            emitCrop(crop, next, areaPixels);
          }}
          className={styles.slider}
        />
        <span className={styles.zoomValue}>{zoom.toFixed(2)}×</span>
      </div>
    </div>
  );
}
