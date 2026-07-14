"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import QRCode from "qrcode";
import type { Employee } from "@/types/employee";
import {
  BACK_OVERLAYS,
  FRONT_OVERLAYS,
  ID_CARD_ASPECT,
  ID_CARD_PREVIEW_WIDTH,
  ID_CARD_VIEWBOX,
} from "@/lib/id-card-layout";
import styles from "./id-card.module.css";

type SideProps = {
  employee: Employee;
  className?: string;
  /** Fixed CSS width; height follows SVG aspect ratio. */
  width?: number;
  /** Live crop preview URL — overrides employee.profilePhoto when set */
  photoUrl?: string;
};

type TextField = {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  letterSpacing: string;
  textTransform: "uppercase" | "none" | "capitalize";
};

type BoxField = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Pixel box from SVG units — same math for preview + PDF capture
 * (avoids % + flex font-metric drift in exporters).
 */
function svgBox(field: BoxField, cardWidth: number) {
  const scale = cardWidth / ID_CARD_VIEWBOX.width;
  const cardHeight = cardWidth / ID_CARD_ASPECT;
  // scaleX === scaleY when card aspect matches the SVG viewBox
  const scaleY = cardHeight / ID_CARD_VIEWBOX.height;
  return {
    left: field.x * scale,
    top: field.y * scaleY,
    width: field.width * scale,
    height: field.height * scaleY,
    scale,
  };
}

function coverStyle(
  field: BoxField & { color: string },
  cardWidth: number
): CSSProperties {
  const box = svgBox(field, cardWidth);
  return {
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    background: field.color,
  };
}

function textOverlayStyle(field: TextField, cardWidth: number): CSSProperties {
  const box = svgBox(field, cardWidth);
  const fontSize = field.fontSize * box.scale;
  return {
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    color: field.color,
    fontSize,
    fontWeight: field.fontWeight,
    letterSpacing: field.letterSpacing,
    textTransform: field.textTransform,
    // Single-line vertical center without flex — exporters preserve this exactly
    lineHeight: `${box.height}px`,
    display: "block",
    textAlign: "center",
  };
}

export const IdCardFront = forwardRef<HTMLDivElement, SideProps>(
  function IdCardFront(
    { employee, className, width = ID_CARD_PREVIEW_WIDTH, photoUrl },
    ref
  ) {
    const photo = FRONT_OVERLAYS.photo;
    const photoLeft = photo.cx - photo.r;
    const photoTop = photo.cy - photo.r;
    const photoSize = photo.r * 2;
    const resolvedPhoto = photoUrl || employee.profilePhoto;
    const photoBox = svgBox(
      { x: photoLeft, y: photoTop, width: photoSize, height: photoSize },
      width
    );

    return (
      <div
        ref={ref}
        className={`${styles.stage} ${className ?? ""}`}
        style={{ width: `${width}px` }}
        data-id-card-side="front"
      >
        {/* Unmodified Figma SVG template */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/id-card/front.svg"
          alt=""
          className={styles.baseSvg}
          width={ID_CARD_VIEWBOX.width}
          height={ID_CARD_VIEWBOX.height}
          draggable={false}
        />

        <div
          className={`${styles.overlay} ${styles.cover}`}
          style={coverStyle(FRONT_OVERLAYS.nameCover, width)}
        />
        <div
          className={`${styles.overlay} ${styles.cover}`}
          style={coverStyle(FRONT_OVERLAYS.designationCover, width)}
        />
        <div
          className={`${styles.overlay} ${styles.cover}`}
          style={coverStyle(FRONT_OVERLAYS.employeeIdCover, width)}
        />

        <div
          className={`${styles.overlay} ${styles.photo}`}
          style={{
            left: photoBox.left,
            top: photoBox.top,
            width: photoBox.width,
            height: photoBox.height,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedPhoto}
            alt=""
            className={styles.photoImg}
            crossOrigin="anonymous"
            draggable={false}
          />
        </div>

        <div
          className={`${styles.overlay} ${styles.textField}`}
          style={textOverlayStyle(FRONT_OVERLAYS.name, width)}
          title={employee.name}
        >
          {employee.name}
        </div>

        <div
          className={`${styles.overlay} ${styles.textField}`}
          style={textOverlayStyle(FRONT_OVERLAYS.designation, width)}
          title={employee.designation}
        >
          {employee.designation}
        </div>

        <div
          className={`${styles.overlay} ${styles.textField}`}
          style={textOverlayStyle(FRONT_OVERLAYS.employeeId, width)}
        >
          {employee.employeeId}
        </div>
      </div>
    );
  }
);

export const IdCardBack = forwardRef<HTMLDivElement, SideProps>(
  function IdCardBack(
    { employee, className, width = ID_CARD_PREVIEW_WIDTH },
    ref
  ) {
    const [qrDataUrl, setQrDataUrl] = useState("");
    const qr = BACK_OVERLAYS.qr;
    const qrBox = svgBox(qr, width);

    const verificationUrl = useMemo(
      () =>
        employee.verificationUrl ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${employee.employeeId}`,
      [employee.employeeId, employee.verificationUrl]
    );

    useEffect(() => {
      let cancelled = false;

      void QRCode.toDataURL(verificationUrl, {
        margin: 0,
        width: 1024,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#FFFFFF" },
      }).then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      });

      return () => {
        cancelled = true;
      };
    }, [verificationUrl]);

    return (
      <div
        ref={ref}
        className={`${styles.stage} ${className ?? ""}`}
        style={{ width: `${width}px` }}
        data-id-card-side="back"
      >
        {/* Unmodified Figma SVG template */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/id-card/back.svg"
          alt=""
          className={styles.baseSvg}
          width={ID_CARD_VIEWBOX.width}
          height={ID_CARD_VIEWBOX.height}
          draggable={false}
        />

        <div
          className={`${styles.overlay} ${styles.qr}`}
          style={{
            left: qrBox.left,
            top: qrBox.top,
            width: qrBox.width,
            height: qrBox.height,
          }}
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt=""
              className={styles.qrImg}
              draggable={false}
            />
          ) : null}
        </div>
      </div>
    );
  }
);
