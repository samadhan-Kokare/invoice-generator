import { AppSettings, BusinessProfile, Customer, Invoice, SavedCustomer } from "@/types/invoice";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/constants/invoice";

// ============================================================
// Thin wrapper around window.localStorage.
// Swap this file's internals for REST/Server Action calls later
// without touching any UI or calculation code — every function
// keeps the same signature and return shape.
// ============================================================

function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to read "${key}" from localStorage`, err);
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) {
    console.error("LocalStorage is unavailable in this browser/context.");
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to write "${key}" to localStorage`, err);
    return false;
  }
}

// ---------------- Invoices ----------------

export function getInvoices(): Invoice[] {
  return readJson<Invoice[]>(STORAGE_KEYS.INVOICES, []);
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getInvoices().find((inv) => inv.id === id);
}

export function saveInvoice(invoice: Invoice): boolean {
  const invoices = getInvoices();
  invoices.unshift(invoice);
  return writeJson(STORAGE_KEYS.INVOICES, invoices);
}

export function updateInvoice(id: string, updated: Invoice): boolean {
  const invoices = getInvoices();
  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) return saveInvoice(updated);
  invoices[index] = { ...updated, updatedAt: new Date().toISOString() };
  return writeJson(STORAGE_KEYS.INVOICES, invoices);
}

export function deleteInvoice(id: string): boolean {
  const invoices = getInvoices().filter((inv) => inv.id !== id);
  return writeJson(STORAGE_KEYS.INVOICES, invoices);
}

// ---------------- Business profile ----------------

export function saveBusinessProfile(profile: BusinessProfile): boolean {
  return writeJson(STORAGE_KEYS.BUSINESS_PROFILE, profile);
}

export function getBusinessProfile(): BusinessProfile | undefined {
  return readJson<BusinessProfile | undefined>(STORAGE_KEYS.BUSINESS_PROFILE, undefined);
}

// ---------------- Customers ----------------

export function getCustomers(): SavedCustomer[] {
  return readJson<SavedCustomer[]>(STORAGE_KEYS.CUSTOMERS, []);
}

export function saveCustomer(customer: SavedCustomer): boolean {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.unshift(customer);
  }
  return writeJson(STORAGE_KEYS.CUSTOMERS, customers);
}

export function deleteCustomer(id: string): boolean {
  const customers = getCustomers().filter((c) => c.id !== id);
  return writeJson(STORAGE_KEYS.CUSTOMERS, customers);
}

// ---------------- Settings ----------------

export function getSettings(): AppSettings {
  return readJson<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): boolean {
  return writeJson(STORAGE_KEYS.SETTINGS, settings);
}

/** Next invoice number WITHOUT consuming it (safe to call on every page open). */
export function peekNextInvoiceNumber(): string {
  const settings = getSettings();
  return `${settings.invoiceNumberPrefix}${String(settings.nextInvoiceSequence).padStart(3, "0")}`;
}

/** Call once an invoice is actually saved so the next one gets a fresh number. */
export function commitInvoiceSequence(savedNumber: string): void {
  const settings = getSettings();
  if (savedNumber === peekNextInvoiceNumber()) {
    saveSettings({ ...settings, nextInvoiceSequence: settings.nextInvoiceSequence + 1 });
  }
}

/** Upserts a client by GSTIN (when present) or name, so repeated invoices don't duplicate it. */
export function upsertCustomer(customer: Customer): SavedCustomer {
  const existing = getCustomers().find(
    (c) =>
      (customer.gstin && c.gstin === customer.gstin) ||
      c.customerName.trim().toLowerCase() === customer.customerName.trim().toLowerCase()
  );
  const saved: SavedCustomer = { ...customer, id: existing?.id ?? crypto.randomUUID() };
  saveCustomer(saved);
  return saved;
}
