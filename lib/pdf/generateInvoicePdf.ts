import jsPDF from "jspdf";
// The "-pro" build understands modern CSS colour functions (oklch/lab) used by Tailwind v4.
import html2canvas from "html2canvas-pro";
import { Invoice } from "@/types/invoice";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export interface PdfGenerationResult {
  blob: Blob;
  filename: string;
}

/** Safe file name, e.g. "INV-2026-001 - Acme Pvt Ltd.pdf" */
export function invoiceFileName(invoice: Invoice, ext: "pdf" | "xlsx" = "pdf"): string {
  const raw = [invoice.invoiceNumber, invoice.customer.customerName].filter(Boolean).join(" - ") || "invoice";
  return `${raw.replace(/[\\/:*?"<>|]+/g, "").trim()}.${ext}`;
}

/**
 * Captures every `#{idPrefix}-page-N` element (rendered by InvoiceDocumentBase at real
 * A4 pixel size) and assembles them into a multi-page A4 PDF.
 */
export async function generateInvoicePdf(invoice: Invoice, idPrefix: string = "invoice"): Promise<PdfGenerationResult> {
  // pages are decided by the rendered document (measured heights), so count them in the DOM
  const pageCount = document.querySelectorAll(`[id^="${idPrefix}-page-"]`).length;
  if (pageCount === 0) throw new Error("The invoice is not rendered.");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  pdf.setProperties({ title: `Invoice ${invoice.invoiceNumber}`, author: invoice.business.businessName });

  for (let i = 1; i <= pageCount; i++) {
    const node = document.getElementById(`${idPrefix}-page-${i}`);
    if (!node) throw new Error(`Invoice page ${i} is not rendered.`);

    const canvas = await html2canvas(node, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    if (i > 1) pdf.addPage("a4", "portrait");
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, "FAST");
  }

  return { blob: pdf.output("blob"), filename: invoiceFileName(invoice) };
}

export async function downloadInvoicePdf(invoice: Invoice, idPrefix: string = "invoice"): Promise<void> {
  const { blob, filename } = await generateInvoicePdf(invoice, idPrefix);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
