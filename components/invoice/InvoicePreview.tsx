"use client";

import { useEffect, useRef, useState } from "react";
import { Invoice } from "@/types/invoice";
import { A4_WIDTH_PX } from "@/lib/invoice/paginate";
import { useA4Scale } from "@/hooks/useA4Scale";
import InvoiceDocumentBase from "./InvoiceDocumentBase";

const GAP = 24;

/**
 * On-screen paper preview: real A4 pixel size, scaled to fit its container.
 * (PDF export uses its own full-size copy — see useInvoiceExport.)
 */
export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const { containerRef, scale } = useA4Scale(A4_WIDTH_PX);
  const paperRef = useRef<HTMLDivElement>(null);
  const [paperHeight, setPaperHeight] = useState(0);

  // The number of pages is decided by measured content, so read the height off the DOM.
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const read = () => setPaperHeight(el.offsetHeight);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div className="mx-auto overflow-hidden" style={{ width: A4_WIDTH_PX * scale, height: paperHeight * scale }}>
        <div
          ref={paperRef}
          className="[&_.invoice-sheet]:shadow-[0_1px_2px_rgba(30,27,46,.06),0_12px_40px_rgba(30,27,46,.14)]"
          style={{ position: "relative", width: A4_WIDTH_PX, transform: `scale(${scale})`, transformOrigin: "top left", display: "flex", flexDirection: "column", gap: GAP }}
        >
          <InvoiceDocumentBase invoice={invoice} idPrefix="preview" />
        </div>
      </div>
    </div>
  );
}
