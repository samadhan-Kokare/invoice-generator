// ============================================================
// CORE DATA MODELS
// These types are the single source of truth for invoice data.
// UI, calculations, PDF export and Excel export all consume
// the SAME Invoice object — never duplicate shape elsewhere.
// ============================================================

export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue";

export type DiscountType = "percentage" | "fixed";

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Business extends Address {
  businessName: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoDataUrl?: string;
}

export interface Customer extends Address {
  customerName: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceItem {
  id: string;
  itemName: string;
  description?: string;
  hsnSac?: string;
  quantity: number;
  unit: string;
  rate: number;
  discountType: DiscountType;
  discountValue: number; // percentage (0-100) or fixed amount depending on discountType
  gstRate: number; // e.g. 18 for 18%

  // ---- computed (populated by calculation engine, not hand-edited) ----
  discountAmount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface PaymentDetails {
  enabled: boolean;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
  upiQrDataUrl?: string;
}

export interface Signature {
  enabled: boolean;
  authorisedSignatoryName?: string;
  signatureImageDataUrl?: string;
}

export type TaxMode = "CGST_SGST" | "IGST" | "NONE";

export interface Invoice {
  id: string;

  invoiceNumber: string;
  invoiceDate: string; // ISO date string
  dueDate?: string; // ISO date string

  business: Business;
  customer: Customer;

  items: InvoiceItem[];

  currency: string; // e.g. "INR"

  countryOfSupply: string;
  placeOfSupply: string;
  placeOfSupplyCode?: string; // GST state code, e.g. "27"

  paymentTerms?: string;

  // ---- computed totals (populated by calculation engine) ----
  subtotal: number; // sum of (rate * qty) before discount
  totalDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOffEnabled: boolean;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;

  taxMode: TaxMode;

  notes?: string;
  terms?: string;
  paymentDetails?: PaymentDetails;
  signature?: Signature;

  status: InvoiceStatus;

  createdAt: string;
  updatedAt: string;
}

// HSN/SAC tax summary row used on page 2 of the invoice
export interface HsnSummaryRow {
  hsnSac: string;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
}

export interface BusinessProfile extends Business {
  id: string;
}

export interface SavedCustomer extends Customer {
  id: string;
}

export interface AppSettings {
  defaultCurrency: string;
  defaultPaymentTerms?: string;
  autoGenerateInvoiceNumber: boolean;
  invoiceNumberPrefix: string;
  nextInvoiceSequence: number;
  roundOffEnabled: boolean;
}
