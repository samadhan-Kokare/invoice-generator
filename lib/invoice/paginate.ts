import { Business, Customer, Invoice, InvoiceItem } from "@/types/invoice";
import { buildHsnSummary } from "./calculations";

// A4 @ 96dpi
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;
export const PAGE_PADDING_X = 36;
export const PAGE_PADDING_TOP = 34;
/** Space reserved at the bottom of every page for the footer. */
export const PAGE_FOOTER_PX = 52;
/** Width available to the invoice content inside the page padding. */
export const CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_PADDING_X * 2;

/** Height of the content area of one page. A little is held back as a safety margin. */
const SAFETY_PX = 6;
const USABLE_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_TOP - PAGE_FOOTER_PX - SAFETY_PX;
export const CONTINUED_HEADER_PX = 34;

export interface InvoicePage {
  number: number;
  items: InvoiceItem[];
  /** index of items[0] in invoice.items, for serial numbers */
  startIndex: number;
  isFirst: boolean;
  showClosing: boolean; // words + totals + notes + payment + signature
  showHsn: boolean; // HSN/SAC tax summary
}

/**
 * Real rendered heights (px), measured from the DOM by the invoice document itself.
 * When present they replace the estimates below, so pages break exactly where the
 * content really ends — no clipping, whatever the text length or font.
 */
export interface LayoutMetrics {
  header: number;
  tableHead: number;
  rows: Record<string, number>;
  closing: number;
  hsn: number;
}

/* ---------------- fallback estimates (used until the first measurement) ---------------- */

const lines = (text: string | undefined, charsPerLine: number) =>
  !text ? 0 : text.split("\n").reduce((n, l) => n + Math.max(1, Math.ceil(l.length / charsPerLine)), 0);

function partyCardHeight(p: Business | Customer, isBusiness: boolean): number {
  const addressLines =
    lines(p.addressLine1, 52) + lines(p.addressLine2, 52) + lines(`${p.city}, ${p.state}, ${p.country} - ${p.pincode}`, 52);
  const meta = [p.gstin, p.pan, p.email, p.phone, isBusiness ? (p as Business).website : ""].filter(Boolean).length;
  return 74 + addressLines * 16 + meta * 16;
}

function estimateHeader(invoice: Invoice): number {
  const cards = Math.max(partyCardHeight(invoice.business, true), partyCardHeight(invoice.customer, false));
  return 96 + 22 + cards + 14 + 16 + 18;
}

function estimateRow(item: InvoiceItem): number {
  const nameLines = lines(item.itemName || "Untitled item", 30);
  const descLines = lines(item.description, 36);
  return 22 + nameLines * 17 + (item.hsnSac ? 15 : 0) + descLines * 16;
}

function estimateClosing(invoice: Invoice): number {
  let h = 24 + 200; // words + totals card
  const notesLines = lines(invoice.notes, 46);
  const termsLines = lines(invoice.terms, 46);
  if (notesLines || termsLines) h += 46 + Math.max(notesLines, termsLines) * 16;
  if (invoice.paymentDetails?.enabled) h += 120;
  if (invoice.signature?.enabled) h += 130;
  return h;
}

function estimateHsn(invoice: Invoice): number {
  return 28 + 36 + 36 + buildHsnSummary(invoice.items).length * 34 + 34 + 30;
}

/**
 * Splits an invoice into A4 pages.
 *
 * Rules: a line item never splits across pages; the closing block (totals, terms,
 * payment, signature) stays together; the HSN summary joins the last page when there
 * is room, otherwise it gets a page of its own.
 */
export function paginateInvoice(invoice: Invoice, metrics?: LayoutMetrics): InvoicePage[] {
  const items = invoice.items;
  const rowH = (item: InvoiceItem) => metrics?.rows[item.id] ?? estimateRow(item);
  const headerH = metrics?.header || estimateHeader(invoice);
  const tableHeadH = metrics?.tableHead || 32;
  const closingH = metrics?.closing || estimateClosing(invoice);
  const hsnH = metrics?.hsn || estimateHsn(invoice);

  const pages: InvoicePage[] = [];
  let cursor = 0;
  let used = headerH + tableHeadH;
  let current: InvoicePage = { number: 1, items: [], startIndex: 0, isFirst: true, showClosing: false, showHsn: false };

  const startPage = (withTable: boolean) => {
    pages.push(current);
    current = { number: pages.length + 1, items: [], startIndex: cursor, isFirst: false, showClosing: false, showHsn: false };
    used = CONTINUED_HEADER_PX + (withTable ? tableHeadH : 0);
  };

  while (cursor < items.length) {
    const h = rowH(items[cursor]);
    if (used + h > USABLE_HEIGHT && current.items.length > 0) {
      startPage(true);
      continue;
    }
    current.items.push(items[cursor]);
    used += h;
    cursor += 1;
  }

  if (used + closingH > USABLE_HEIGHT) startPage(false);
  current.showClosing = true;
  used += closingH;

  if (used + hsnH > USABLE_HEIGHT) {
    startPage(false);
  }
  current.showHsn = true;
  pages.push(current);

  return pages.map((p, i) => ({ ...p, number: i + 1 }));
}
