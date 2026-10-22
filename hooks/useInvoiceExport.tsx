"use client";

import { useCallback, useState } from "react";
import { App } from "antd";
import { Invoice } from "@/types/invoice";
import { downloadInvoicePdf } from "@/lib/pdf/generateInvoicePdf";
import { generateInvoiceExcel } from "@/lib/excel/generateInvoiceExcel";
import InvoiceDocumentBase from "@/components/invoice/InvoiceDocumentBase";

const CAPTURE_ID = "pdf-capture";

/**
 * PDF + Excel export for ANY invoice, from ANY screen.
 *
 * The PDF is captured from a full-size, off-screen copy of the document that is
 * mounted only while exporting — so editing stays fast and the output never
 * depends on how big the on-screen preview happens to be.
 *
 * Render `host` once anywhere in the page.
 */
export function useInvoiceExport() {
  const { message } = App.useApp();
  const [target, setTarget] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState<"pdf" | "excel" | null>(null);

  const downloadPdf = useCallback(
    async (invoice: Invoice) => {
      setBusy("pdf");
      setTarget(invoice);
      try {
        // let React paint the off-screen pages and the web fonts settle
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        await document.fonts?.ready;
        // the document re-measures once fonts settle; give that render time to commit
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        await downloadInvoicePdf(invoice, CAPTURE_ID);
        message.success("PDF downloaded");
      } catch (err) {
        console.error("PDF generation failed", err);
        message.error("We couldn't generate the PDF. Please try again.");
      } finally {
        setTarget(null);
        setBusy(null);
      }
    },
    [message]
  );

  const exportExcel = useCallback(
    (invoice: Invoice) => {
      setBusy("excel");
      try {
        generateInvoiceExcel(invoice);
        message.success("Excel downloaded");
      } catch (err) {
        message.error((err as Error).message);
      } finally {
        setBusy(null);
      }
    },
    [message]
  );

  const host = target ? (
    <div aria-hidden style={{ position: "fixed", top: 0, left: -20000, pointerEvents: "none" }}>
      <InvoiceDocumentBase invoice={target} idPrefix={CAPTURE_ID} />
    </div>
  ) : null;

  return { busy, downloadPdf, exportExcel, host };
}
