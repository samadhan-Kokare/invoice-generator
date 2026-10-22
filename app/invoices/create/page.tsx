"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "antd";
import { Invoice } from "@/types/invoice";
import { businessFromProfile, createEmptyInvoice } from "@/lib/invoice/factory";
import { getBusinessProfile, getSettings, peekNextInvoiceNumber } from "@/lib/storage/invoiceStorage";
import InvoiceEditor from "@/components/invoice/InvoiceEditor";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [initial, setInitial] = useState<Invoice | null>(null);

  // Built after mount: defaults come from this browser's storage, so it can't run on the server.
  useEffect(() => {
    const settings = getSettings();
    const profile = getBusinessProfile();
    const invoice = createEmptyInvoice(peekNextInvoiceNumber());
    invoice.currency = settings.defaultCurrency;
    invoice.roundOffEnabled = settings.roundOffEnabled;
    if (settings.defaultPaymentTerms) invoice.paymentTerms = settings.defaultPaymentTerms;
    if (profile) invoice.business = businessFromProfile(profile);
    setInitial(invoice);
  }, []);

  if (!initial) {
    return (
      <div className="mx-auto w-full space-y-5 px-4 py-8 sm:px-8">
        <Skeleton active paragraph={{ rows: 3 }} />
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return <InvoiceEditor initial={initial} mode="create" backHref="/dashboard" onSaved={(invoice) => router.push(`/invoices/${invoice.id}`)} />;
}
