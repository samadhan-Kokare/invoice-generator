import { HsnSummaryRow, Invoice, InvoiceItem, TaxMode } from "@/types/invoice";
import { calculateCGST, calculateIGST, calculateSGST, determineTaxMode, round2 } from "./gst";
import { amountToWords } from "./amountToWords";
import { stateCodeFor } from "@/constants/invoice";

/**
 * Calculates discount amount, taxable amount, CGST/SGST/IGST and total
 * for a single invoice line item. Mutates nothing — returns a new item.
 */
export function calculateItemTax(
  item: Omit<
    InvoiceItem,
    "discountAmount" | "taxableAmount" | "cgst" | "sgst" | "igst" | "total"
  >,
  taxMode: TaxMode
): InvoiceItem {
  const gross = round2(item.quantity * item.rate);

  const discountAmount =
    item.discountType === "percentage"
      ? round2((gross * (item.discountValue || 0)) / 100)
      : round2(item.discountValue || 0);

  const taxableAmount = round2(Math.max(gross - discountAmount, 0));

  const cgst = calculateCGST(taxableAmount, item.gstRate, taxMode);
  const sgst = calculateSGST(taxableAmount, item.gstRate, taxMode);
  const igst = calculateIGST(taxableAmount, item.gstRate, taxMode);

  const total = round2(taxableAmount + cgst + sgst + igst);

  return {
    ...item,
    discountAmount,
    taxableAmount,
    cgst,
    sgst,
    igst,
    total,
  };
}

/** Rounds the grand total to the nearest rupee and returns the round-off delta. */
export function calculateRoundOff(grandTotalBeforeRounding: number, enabled: boolean) {
  if (!enabled) {
    return { roundOff: 0, roundedTotal: round2(grandTotalBeforeRounding) };
  }
  const rounded = Math.round(grandTotalBeforeRounding);
  const roundOff = round2(rounded - grandTotalBeforeRounding);
  return { roundOff, roundedTotal: rounded };
}

export interface InvoiceTotals {
  items: InvoiceItem[];
  taxMode: TaxMode;
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
}

/**
 * Single entry point for computing ALL invoice totals from raw item input.
 * Used by the live preview, PDF generator and Excel exporter alike so
 * numbers can never drift out of sync between them.
 */
export function calculateInvoiceTotals(
  rawItems: Array<
    Omit<InvoiceItem, "discountAmount" | "taxableAmount" | "cgst" | "sgst" | "igst" | "total">
  >,
  businessStateCode: string | undefined,
  placeOfSupplyCode: string | undefined,
  roundOffEnabled: boolean,
  currency: string
): InvoiceTotals {
  const taxMode = determineTaxMode(businessStateCode, placeOfSupplyCode);

  const items = rawItems.map((item) => calculateItemTax(item, taxMode));

  const subtotal = round2(items.reduce((sum, i) => sum + i.quantity * i.rate, 0));
  const totalDiscount = round2(items.reduce((sum, i) => sum + i.discountAmount, 0));
  const taxableAmount = round2(items.reduce((sum, i) => sum + i.taxableAmount, 0));
  const cgst = round2(items.reduce((sum, i) => sum + i.cgst, 0));
  const sgst = round2(items.reduce((sum, i) => sum + i.sgst, 0));
  const igst = round2(items.reduce((sum, i) => sum + i.igst, 0));

  const grandTotalBeforeRounding = round2(taxableAmount + cgst + sgst + igst);
  const { roundOff, roundedTotal } = calculateRoundOff(grandTotalBeforeRounding, roundOffEnabled);

  const amountInWords = amountToWords(roundedTotal, currency);

  return {
    items,
    taxMode,
    subtotal,
    totalDiscount,
    taxableAmount,
    cgst,
    sgst,
    igst,
    roundOff,
    grandTotal: roundedTotal,
    amountInWords,
  };
}

/** Convenience wrapper that also computes the grand total (alias kept for API-naming clarity). */
export function calculateGrandTotal(taxableAmount: number, cgst: number, sgst: number, igst: number): number {
  return round2(taxableAmount + cgst + sgst + igst);
}

/** Builds the HSN/SAC-wise tax summary table shown on page 2 of the invoice. */
export function buildHsnSummary(items: InvoiceItem[]): HsnSummaryRow[] {
  const map = new Map<string, HsnSummaryRow>();

  for (const item of items) {
    const key = `${item.hsnSac || "N/A"}|${item.gstRate}`;
    const existing = map.get(key);

    const cgstRate = item.gstRate / 2;
    const sgstRate = item.gstRate / 2;
    const igstRate = item.igst > 0 ? item.gstRate : 0;

    if (existing) {
      existing.taxableValue = round2(existing.taxableValue + item.taxableAmount);
      existing.cgstAmount = round2(existing.cgstAmount + item.cgst);
      existing.sgstAmount = round2(existing.sgstAmount + item.sgst);
      existing.igstAmount = round2(existing.igstAmount + item.igst);
      existing.totalTax = round2(existing.cgstAmount + existing.sgstAmount + existing.igstAmount);
    } else {
      map.set(key, {
        hsnSac: item.hsnSac || "N/A",
        taxableValue: item.taxableAmount,
        cgstRate,
        cgstAmount: item.cgst,
        sgstRate,
        sgstAmount: item.sgst,
        igstRate,
        igstAmount: item.igst,
        totalTax: round2(item.cgst + item.sgst + item.igst),
      });
    }
  }

  return Array.from(map.values());
}

/** Recomputes every derived field on a full Invoice object from its raw items + settings. */
export function recalculateInvoice(invoice: Invoice): Invoice {
  const totals = calculateInvoiceTotals(
    invoice.items,
    stateCodeFor(invoice.business.state),
    invoice.placeOfSupplyCode,
    invoice.roundOffEnabled,
    invoice.currency
  );

  return {
    ...invoice,
    items: totals.items,
    taxMode: totals.taxMode,
    subtotal: totals.subtotal,
    totalDiscount: totals.totalDiscount,
    taxableAmount: totals.taxableAmount,
    cgst: totals.cgst,
    sgst: totals.sgst,
    igst: totals.igst,
    roundOff: totals.roundOff,
    grandTotal: totals.grandTotal,
    amountInWords: totals.amountInWords,
  };
}
