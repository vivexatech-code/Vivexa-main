import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import { ID_CARD_PRINT_MM } from "@/lib/id-card-layout";

/**
 * Temporarily unlock overflow on ancestors so dialog scroll containers
 * cannot clip the live preview during capture.
 */
function unlockOverflowAncestors(from: HTMLElement) {
  const touched: Array<{
    el: HTMLElement;
    overflow: string;
    overflowX: string;
    overflowY: string;
  }> = [];

  let el: HTMLElement | null = from.parentElement;
  while (el) {
    const computed = getComputedStyle(el);
    if (
      computed.overflow !== "visible" ||
      computed.overflowX !== "visible" ||
      computed.overflowY !== "visible"
    ) {
      touched.push({
        el,
        overflow: el.style.overflow,
        overflowX: el.style.overflowX,
        overflowY: el.style.overflowY,
      });
      el.style.overflow = "visible";
      el.style.overflowX = "visible";
      el.style.overflowY = "visible";
    }
    el = el.parentElement;
  }

  return () => {
    for (const item of touched) {
      item.el.style.overflow = item.overflow;
      item.el.style.overflowX = item.overflowX;
      item.el.style.overflowY = item.overflowY;
    }
  };
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Capture the already-rendered preview node (WYSIWYG).
 * No layout recreation, no size overrides, no reflow.
 */
async function rasterizeLivePreview(
  el: HTMLElement
): Promise<HTMLCanvasElement> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await waitForPaint();

  const restoreOverflow = unlockOverflowAncestors(el);
  const pixelRatio = Math.max(3, window.devicePixelRatio || 1);

  try {
    const canvas = await toCanvas(el, {
      pixelRatio,
      cacheBust: true,
      includeQueryParams: true,
      // Exact rendered box — do not pass width/height that would rescale layout
      canvasWidth: Math.round(el.offsetWidth * pixelRatio),
      canvasHeight: Math.round(el.offsetHeight * pixelRatio),
      style: {
        // Freeze the node’s computed visual size during clone serialization
        transform: "none",
        margin: "0",
      },
      filter: (node) => {
        // Skip invisible UI chrome if any is nested
        if (!(node instanceof HTMLElement)) return true;
        return !node.dataset?.pdfIgnore;
      },
    });

    return canvas;
  } finally {
    restoreOverflow();
  }
}

export async function downloadIdCardPdf(
  frontEl: HTMLElement,
  backEl: HTMLElement,
  fileName: string
) {
  // Capture the live preview DOM — same pixels the admin sees
  const frontCanvas = await rasterizeLivePreview(frontEl);
  const backCanvas = await rasterizeLivePreview(backEl);

  // Page size follows the captured preview aspect (never force a different ratio)
  const pageW = ID_CARD_PRINT_MM.width;
  const pageH = pageW * (frontCanvas.height / frontCanvas.width);

  const pdf = new jsPDF({
    orientation: pageH >= pageW ? "portrait" : "landscape",
    unit: "mm",
    format: [pageW, pageH],
    compress: true,
  });

  pdf.addImage(
    frontCanvas.toDataURL("image/png", 1.0),
    "PNG",
    0,
    0,
    pageW,
    pageH,
    undefined,
    "NONE"
  );

  pdf.addPage(
    [pageW, pageH],
    pageH >= pageW ? "portrait" : "landscape"
  );

  // Keep back page locked to the same aspect as front
  const backH = pageW * (backCanvas.height / backCanvas.width);
  pdf.addImage(
    backCanvas.toDataURL("image/png", 1.0),
    "PNG",
    0,
    0,
    pageW,
    backH,
    undefined,
    "NONE"
  );

  pdf.save(fileName);
}
