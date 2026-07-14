/**
 * Overlay layout in original SVG viewBox units.
 * Front/back SVGs MUST stay unmodified — only these overlays change.
 *
 * Design canvas: 2653 × 4507 (from Figma export viewBox)
 */
export const ID_CARD_VIEWBOX = {
  width: 2653,
  height: 4507,
} as const;

/** Preview / capture width in CSS px (height derived from viewBox aspect). */
export const ID_CARD_PREVIEW_WIDTH = 320;

export const ID_CARD_ASPECT =
  ID_CARD_VIEWBOX.width / ID_CARD_VIEWBOX.height;

/**
 * Print size preserves the exact Figma/SVG aspect ratio (2653×4507).
 * Do NOT use ISO CR80 proportions here — that squeezes the design vertically.
 */
export const ID_CARD_PRINT_MM = {
  width: 54,
  height: Number(((54 * ID_CARD_VIEWBOX.height) / ID_CARD_VIEWBOX.width).toFixed(3)),
} as const;

/** 300 DPI raster size — same aspect as preview / SVG. */
export const ID_CARD_PRINT_PX = {
  width: Math.round((ID_CARD_PRINT_MM.width / 25.4) * 300),
  height: Math.round(
    (Math.round((ID_CARD_PRINT_MM.width / 25.4) * 300) * ID_CARD_VIEWBOX.height) /
      ID_CARD_VIEWBOX.width
  ),
} as const;

export function svgUnitToPercent(
  value: number,
  axis: "x" | "y"
): string {
  const base =
    axis === "x" ? ID_CARD_VIEWBOX.width : ID_CARD_VIEWBOX.height;
  return `${(value / base) * 100}%`;
}

/** Convert a preview-pixel font size to SVG viewBox units. */
export function pxAtPreviewToSvg(px: number): number {
  return (px * ID_CARD_VIEWBOX.width) / ID_CARD_PREVIEW_WIDTH;
}

/**
 * Front overlays — covers hide baked Figma placeholder glyphs;
 * text boxes are sized taller than the font so nothing clips in PDF.
 *
 * Photo circle:       (1326.5, 2253.5)
 * Name band:          y ≈ 3111–3351
 * Blue divider:       y ≈ 3493 (static SVG)
 * Designation band:   y ≈ 3605–3713
 * "EMP ID" label:     y ≈ 4104–4194 (static SVG)
 * ID value band:      y ≈ 4274–4410
 */
export const FRONT_OVERLAYS = {
  photo: {
    cx: 1326.5,
    cy: 2253.5,
    r: 735.5,
  },
  /** White mask over outlined placeholder name in the SVG */
  nameCover: {
    x: 520,
    y: 3080,
    width: 1613,
    height: 300,
    color: "#FFFFFF",
  },
  name: {
    x: 160,
    y: 3095,
    width: 2333,
    height: 270,
    fontSize: 200,
    fontWeight: 800,
    color: "#000000",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  /** White mask over outlined placeholder designation */
  designationCover: {
    x: 700,
    y: 3570,
    width: 1253,
    height: 180,
    color: "#FFFFFF",
  },
  designation: {
    x: 200,
    y: 3585,
    width: 2253,
    /** Must be taller than fontSize to avoid clipping */
    height: 220,
    fontSize: pxAtPreviewToSvg(18.3031),
    fontWeight: 600,
    color: "#000000",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
  },
  /** Navy mask over outlined placeholder ID (leave “EMP ID” label visible) */
  employeeIdCover: {
    x: 700,
    y: 4235,
    width: 1253,
    height: 200,
    color: "#0A172A",
  },
  employeeId: {
    x: 400,
    y: 4248,
    width: 1853,
    height: 185,
    /** ~30% larger than previous 115 */
    fontSize: 150,
    fontWeight: 800,
    color: "#FFFFFF",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  },
} as const;

/**
 * Back-side QR — positioned to match design (% of SVG canvas).
 * top: 41.46% · height: 22.1227%
 */
export const BACK_OVERLAYS = {
  qr: {
    x: 851,
    y: 4507 * 0.4146,
    width: 952,
    height: 4507 * 0.221227,
  },
} as const;
