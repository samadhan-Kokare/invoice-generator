import { AppSettings } from "@/types/invoice";

export const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee (INR)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (AED)" },
];

export const GST_RATES = [0, 3, 5, 12, 18, 28];

export const UNITS = [
  "PCS", "NOS", "KG", "GM", "LTR", "MTR", "BOX", "SET", "HRS", "DAYS", "MONTH", "SERVICE",
];

export const INDIAN_STATES: { name: string; code: string }[] = [
  { name: "Andhra Pradesh", code: "37" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" },
  { name: "Bihar", code: "10" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Goa", code: "30" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jharkhand", code: "20" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" },
  { name: "Meghalaya", code: "17" },
  { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" },
  { name: "Odisha", code: "21" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Sikkim", code: "11" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Tripura", code: "16" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" },
  { name: "West Bengal", code: "19" },
  { name: "Delhi", code: "07" },
  { name: "Jammu and Kashmir", code: "01" },
  { name: "Ladakh", code: "38" },
  { name: "Chandigarh", code: "04" },
  { name: "Puducherry", code: "34" },
  { name: "Andaman and Nicobar Islands", code: "35" },
  { name: "Lakshadweep", code: "31" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
];

/** GST state-code lookup by (case-insensitive) state name. */
export function stateCodeFor(stateName: string | undefined): string | undefined {
  if (!stateName) return undefined;
  const wanted = stateName.trim().toLowerCase();
  return INDIAN_STATES.find((s) => s.name.toLowerCase() === wanted)?.code;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: "INR",
  autoGenerateInvoiceNumber: true,
  invoiceNumberPrefix: `INV-${new Date().getFullYear()}-`,
  nextInvoiceSequence: 1,
  roundOffEnabled: true,
};

export const STORAGE_KEYS = {
  INVOICES: "invoice_app_invoices",
  BUSINESS_PROFILE: "invoice_app_business_profile",
  CUSTOMERS: "invoice_app_customers",
  SETTINGS: "invoice_app_settings",
};
