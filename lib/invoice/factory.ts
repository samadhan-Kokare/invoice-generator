import { v4 as uuidv4 } from "uuid";
import { Business, BusinessProfile, Customer, Invoice, InvoiceItem } from "@/types/invoice";
import { DEFAULT_SETTINGS } from "@/constants/invoice";

export function createEmptyBusiness(): Business {
  return {
    businessName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    gstin: "",
    pan: "",
    email: "",
    phone: "",
    website: "",
  };
}

export function createEmptyCustomer(): Customer {
  return {
    customerName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    gstin: "",
    pan: "",
    email: "",
    phone: "",
  };
}

export function createEmptyItem(): InvoiceItem {
  return {
    id: uuidv4(),
    itemName: "",
    description: "",
    hsnSac: "",
    quantity: 1,
    unit: "PCS",
    rate: 0,
    discountType: "percentage",
    discountValue: 0,
    gstRate: 18,
    discountAmount: 0,
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: 0,
  };
}

export function createEmptyInvoice(invoiceNumber: string): Invoice {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    invoiceNumber,
    invoiceDate: now.slice(0, 10),
    dueDate: undefined,
    business: createEmptyBusiness(),
    customer: createEmptyCustomer(),
    items: [createEmptyItem()],
    currency: DEFAULT_SETTINGS.defaultCurrency,
    countryOfSupply: "India",
    placeOfSupply: "",
    placeOfSupplyCode: undefined,
    paymentTerms: "Due on Receipt",
    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    roundOffEnabled: DEFAULT_SETTINGS.roundOffEnabled,
    roundOff: 0,
    grandTotal: 0,
    amountInWords: "",
    taxMode: "CGST_SGST",
    notes: "",
    terms: "",
    paymentDetails: { enabled: false },
    signature: { enabled: true, authorisedSignatoryName: "" },
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

/** Strips storage-only fields from a saved profile so it can be embedded in an invoice. */
export function businessFromProfile(profile: BusinessProfile): Business {
  return {
    businessName: profile.businessName,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    state: profile.state,
    pincode: profile.pincode,
    country: profile.country,
    gstin: profile.gstin,
    pan: profile.pan,
    email: profile.email,
    phone: profile.phone,
    website: profile.website,
    logoDataUrl: profile.logoDataUrl,
  };
}
