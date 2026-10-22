"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { App, Button } from "antd";
import { ArrowLeftOutlined, EyeOutlined, FileExcelOutlined, FilePdfOutlined, SaveOutlined } from "@ant-design/icons";
import { Business, Customer, Invoice, SavedCustomer } from "@/types/invoice";
import { INDIAN_STATES } from "@/constants/invoice";
import { useInvoice } from "@/hooks/useInvoice";
import { useInvoiceExport } from "@/hooks/useInvoiceExport";
import { InvoiceFormValues, validateInvoiceForm } from "@/lib/invoice/validation";
import {
  commitInvoiceSequence,
  getCustomers,
  saveBusinessProfile,
  saveInvoice,
  updateInvoice as persistInvoice,
  upsertCustomer,
} from "@/lib/storage/invoiceStorage";
import BusinessSection from "./BusinessSection";
import CustomerSection from "./CustomerSection";
import InvoiceDetailsSection from "./InvoiceDetailsSection";
import ItemsSection from "./ItemsSection";
import TotalsSection from "./TotalsSection";
import NotesTermsSection from "./NotesTermsSection";
import PaymentSection from "./PaymentSection";
import SignatureSection from "./SignatureSection";
import InvoicePreviewDrawer from "./InvoicePreviewDrawer";

interface Props {
  initial: Invoice;
  mode: "create" | "edit";
  backHref: string;
  onSaved: (invoice: Invoice) => void;
}

function toFormValues(invoice: Invoice): InvoiceFormValues {
  return {
    business: invoice.business,
    customer: invoice.customer,
    details: {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      currency: invoice.currency,
      paymentTerms: invoice.paymentTerms,
      countryOfSupply: invoice.countryOfSupply,
      placeOfSupply: invoice.placeOfSupply,
    },
    items: invoice.items,
  };
}

export default function InvoiceEditor({ initial, mode, backHref, onSaved }: Props) {
  const { message } = App.useApp();
  const { invoice, updateInvoice, updateItem, addItem, duplicateItem, removeItem } = useInvoice(initial);
  const { busy, downloadPdf, exportExcel, host } = useInvoiceExport();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [clients, setClients] = useState<SavedCustomer[]>([]);

  useEffect(() => {
    setClients(getCustomers());
  }, []);

  // Once the user has tried to save/export, errors update live as they fix fields.
  const errors = useMemo(() => (attempted ? validateInvoiceForm(toFormValues(invoice)) : null), [attempted, invoice]);

  /** Validates; on failure shows a toast and scrolls to the first broken section. */
  const ensureValid = useCallback((): boolean => {
    setAttempted(true);
    const found = validateInvoiceForm(toFormValues(invoice));
    if (!found) return true;
    message.error("Please complete the highlighted sections");
    const first = found.business ? "sec-business" : found.customer ? "sec-customer" : found.details ? "sec-details" : "sec-items";
    document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }, [invoice, message]);

  function handleBusiness(patch: Partial<Business>) {
    updateInvoice({ business: { ...invoice.business, ...patch } });
  }

  function handleCustomer(patch: Partial<Customer>) {
    const clean: Partial<SavedCustomer> = { ...patch };
    delete clean.id; // never store a saved-client id inside an invoice
    const next = { ...invoice.customer, ...clean };
    // Place of supply follows the client's state unless it has been set deliberately.
    const state = INDIAN_STATES.find((s) => s.name === next.state);
    const follow = state && (clean.state !== undefined || !invoice.placeOfSupply);
    updateInvoice({
      customer: next,
      ...(follow ? { placeOfSupply: state.name, placeOfSupplyCode: state.code } : {}),
    });
  }

  function rememberClient(client: Customer) {
    upsertCustomer(client);
    setClients(getCustomers());
  }

  function handleSave() {
    if (!ensureValid()) return;
    const toSave: Invoice = { ...invoice, updatedAt: new Date().toISOString() };
    const ok = mode === "create" ? saveInvoice(toSave) : persistInvoice(toSave.id, toSave);
    if (!ok) {
      message.error("Couldn't save — browser storage is unavailable or full.");
      return;
    }
    if (mode === "create") commitInvoiceSequence(toSave.invoiceNumber);
    upsertCustomer(toSave.customer);
    saveBusinessProfile({ id: "default", ...toSave.business });
    message.success(mode === "create" ? "Invoice saved" : "Changes saved");
    onSaved(toSave);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ---- sticky toolbar ---- */}
      <div className="sticky top-0 z-20 border-b border-purple-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={backHref}>
              <Button type="text" shape="circle" icon={<ArrowLeftOutlined />} aria-label="Back" />
            </Link>
            <div className="hidden min-w-0 sm:block">
              <h1 className="m-0 truncate font-(family-name:--font-display) text-[17px] font-extrabold leading-tight text-slate-900">
                {mode === "create" ? "New invoice" : "Edit invoice"}
              </h1>
              <p className="m-0 truncate text-xs text-slate-500">{invoice.invoiceNumber || "No number yet"}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)} className="!border-purple-300 !font-semibold !text-purple-700">
              <span className="sm:hidden">Preview</span>
              <span className="hidden sm:inline">Preview Invoice</span>
            </Button>
            <Button icon={<FileExcelOutlined />} loading={busy === "excel"} onClick={() => ensureValid() && exportExcel(invoice)} aria-label="Export Excel">
              <span className="hidden lg:inline">Excel</span>
            </Button>
            <Button icon={<FilePdfOutlined />} loading={busy === "pdf"} onClick={() => ensureValid() && void downloadPdf(invoice)} aria-label="Download PDF">
              <span className="hidden lg:inline">PDF</span>
            </Button>
            <Button className="bg-purple-600" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ---- single-column form ---- */}
      <main className="mx-auto w-full  flex-1 space-y-5 px-4 py-6 sm:px-8 sm:py-8">
        <BusinessSection
          business={invoice.business}
          onChange={handleBusiness}
          onSaveProfile={(b) => saveBusinessProfile({ id: "default", ...b })}
          errors={errors?.business}
        />
        <CustomerSection customer={invoice.customer} onChange={handleCustomer} savedClients={clients} onSaveNewClient={rememberClient} errors={errors?.customer} />
        <InvoiceDetailsSection invoice={invoice} onChange={updateInvoice} errors={errors?.details} />
        <ItemsSection
          items={invoice.items}
          currency={invoice.currency}
          taxMode={invoice.taxMode}
          onAdd={addItem}
          onUpdate={updateItem}
          onDuplicate={duplicateItem}
          onRemove={removeItem}
          error={errors?.items}
          itemErrors={errors?.itemErrors}
        />
        <TotalsSection invoice={invoice} onChange={updateInvoice} />
        <NotesTermsSection invoice={invoice} onChange={updateInvoice} />
        <PaymentSection invoice={invoice} onChange={updateInvoice} />
        <SignatureSection invoice={invoice} onChange={updateInvoice} />

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button size="large" icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
            Preview Invoice
          </Button>
          <Button size="large" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            {mode === "create" ? "Save invoice" : "Save changes"}
          </Button>
        </div>
      </main>

      <InvoicePreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={invoice}
        downloading={busy === "pdf"}
        onDownloadPdf={() => ensureValid() && void downloadPdf(invoice)}
      />
      {host}
    </div>
  );
}
