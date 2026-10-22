import { TaxMode } from "@/types/invoice";
import { INDIAN_STATES } from "@/constants/invoice";

/**
 * Determines whether CGST+SGST or IGST applies, based on the GST state
 * code of the seller (business) vs buyer (customer).
 *
 * Same state  -> CGST + SGST (split equally)
 * Different state -> IGST (full rate)
 */
export function determineTaxMode(
  businessStateCode?: string,
  placeOfSupplyCode?: string
): TaxMode {
  if (!businessStateCode || !placeOfSupplyCode) return "CGST_SGST";
  return businessStateCode === placeOfSupplyCode ? "CGST_SGST" : "IGST";
}

/** CGST = half the GST rate applied to taxable amount, only when mode is CGST_SGST */
export function calculateCGST(taxableAmount: number, gstRate: number, mode: TaxMode): number {
  if (mode !== "CGST_SGST") return 0;
  return round2((taxableAmount * (gstRate / 2)) / 100);
}

/** SGST = half the GST rate applied to taxable amount, only when mode is CGST_SGST */
export function calculateSGST(taxableAmount: number, gstRate: number, mode: TaxMode): number {
  if (mode !== "CGST_SGST") return 0;
  return round2((taxableAmount * (gstRate / 2)) / 100);
}

/** IGST = full GST rate applied to taxable amount, only when mode is IGST */
export function calculateIGST(taxableAmount: number, gstRate: number, mode: TaxMode): number {
  if (mode !== "IGST") return 0;
  return round2((taxableAmount * gstRate) / 100);
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Looks up a state by name (case-insensitive). */
export function findState(name?: string) {
  if (!name) return undefined;
  return INDIAN_STATES.find((s) => s.name.toLowerCase() === name.trim().toLowerCase());
}

/**
 * A GSTIN embeds the state code (digits 1-2) and the holder's PAN (digits 3-12).
 * Returns whatever can be derived so forms can pre-fill state and PAN.
 */
export function deriveFromGstin(gstin?: string): { state?: string; pan?: string } {
  if (!gstin || gstin.length < 12) return {};
  const state = INDIAN_STATES.find((s) => s.code === gstin.slice(0, 2))?.name;
  const pan = /^[A-Z]{5}\d{4}[A-Z]$/.test(gstin.slice(2, 12)) ? gstin.slice(2, 12) : undefined;
  return { state, pan };
}
