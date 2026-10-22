import { z } from "zod";

const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;

const optionalGstin = z
  .string()
  .optional()
  .refine((v) => !v || gstinRegex.test(v), { message: "Invalid GSTIN format (e.g. 27AYFPP9687D1ZT)" });

const optionalPan = z
  .string()
  .optional()
  .refine((v) => !v || panRegex.test(v), { message: "Invalid PAN format (e.g. AYFPP9687D)" });

const optionalEmail = z
  .string()
  .optional()
  .refine((v) => !v || z.string().email().safeParse(v).success, { message: "Invalid email address" });

export const addressSchema = z.object({
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().min(1, "Country is required"),
});

export const businessSchema = addressSchema.extend({
  businessName: z.string().min(1, "Business name is required"),
  gstin: optionalGstin,
  pan: optionalPan,
  email: optionalEmail,
  phone: z.string().optional(),
  website: z.string().optional(),
  logoDataUrl: z.string().optional(),
});

export const customerSchema = addressSchema.extend({
  customerName: z.string().min(1, "Customer name is required"),
  gstin: optionalGstin,
  pan: optionalPan,
  email: optionalEmail,
  phone: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  id: z.string(),
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  hsnSac: z.string().optional(),
  quantity: z.number({ message: "Quantity is required" }).gt(0, "Quantity must be greater than 0"),
  unit: z.string().min(1),
  rate: z.number({ message: "Rate is required" }).min(0, "Rate must be 0 or more"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "Discount must be 0 or more"),
  gstRate: z.number().min(0, "GST rate must be 0 or more"),
});

export const invoiceDetailsSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  currency: z.string().min(1),
  paymentTerms: z.string().optional(),
  countryOfSupply: z.string().min(1, "Country of supply is required"),
  placeOfSupply: z.string().min(1, "Place of supply is required"),
});

export const invoiceFormSchema = z.object({
  business: businessSchema,
  customer: customerSchema,
  details: invoiceDetailsSchema,
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export interface InvoiceFormErrors {
  business?: Partial<Record<keyof InvoiceFormValues["business"], string>>;
  customer?: Partial<Record<keyof InvoiceFormValues["customer"], string>>;
  details?: Partial<Record<keyof InvoiceFormValues["details"], string>>;
  items?: string;
  /** field errors per line item, keyed by item id */
  itemErrors?: Record<string, Partial<Record<string, string>>>;
}

/** Runs the invoice form schema and returns a friendly, section-keyed error map. */
export function validateInvoiceForm(values: InvoiceFormValues): InvoiceFormErrors | null {
  const result = invoiceFormSchema.safeParse(values);
  if (result.success) return null;

  const errors: InvoiceFormErrors = {};
  for (const issue of result.error.issues) {
    const [section, a, b] = issue.path;
    if (section === "items") {
      if (typeof a === "number" && typeof b === "string") {
        const id = values.items[a]?.id;
        if (id) errors.itemErrors = { ...errors.itemErrors, [id]: { ...errors.itemErrors?.[id], [b]: issue.message } };
      } else {
        errors.items = issue.message;
      }
      continue;
    }
    if (section === "business" || section === "customer" || section === "details") {
      errors[section] = { ...errors[section], [a as string]: issue.message };
    }
  }
  return errors;
}

/** Validates one object against a schema; returns `{ field: message }` or null when valid. */
export function schemaErrors(schema: z.ZodType, value: unknown): Record<string, string> | null {
  const result = schema.safeParse(value);
  if (result.success) return null;
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
