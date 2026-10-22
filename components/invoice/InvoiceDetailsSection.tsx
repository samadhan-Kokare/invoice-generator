"use client";

import { Button, Tag } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Invoice } from "@/types/invoice";
import { CURRENCIES, INDIAN_STATES } from "@/constants/invoice";
import { InvoiceFormErrors } from "@/lib/invoice/validation";
import { peekNextInvoiceNumber } from "@/lib/storage/invoiceStorage";
import { FormDate, FormInput, FormSelect, SectionCard } from "@/components/ui";

interface Props {
  invoice: Invoice;
  onChange: (patch: Partial<Invoice>) => void;
  errors?: InvoiceFormErrors["details"];
}

const TERMS = ["Due on Receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"];

/** "Net 30" -> 30, "Due on Receipt" -> 0, anything else -> undefined */
function daysFromTerms(terms: string): number | undefined {
  if (/receipt/i.test(terms)) return 0;
  const m = terms.match(/(\d+)/);
  return m ? Number(m[1]) : undefined;
}

export default function InvoiceDetailsSection({ invoice, onChange, errors }: Props) {
  function setTerms(paymentTerms: string) {
    const days = daysFromTerms(paymentTerms);
    const base = dayjs(invoice.invoiceDate);
    onChange({
      paymentTerms,
      ...(days !== undefined && base.isValid() ? { dueDate: base.add(days, "day").format("YYYY-MM-DD") } : {}),
    });
  }

  function setPlaceOfSupply(name: string) {
    onChange({ placeOfSupply: name, placeOfSupplyCode: INDIAN_STATES.find((s) => s.name === name)?.code });
  }

  const igst = invoice.taxMode === "IGST";

  return (
    <SectionCard id="sec-details" step="03" title="Invoice Details" subtitle="Number, dates and place of supply">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-end gap-2">
          <FormInput
            className="flex-1"
            label="Invoice number"
            required
            value={invoice.invoiceNumber}
            onChange={(invoiceNumber) => onChange({ invoiceNumber })}
            error={errors?.invoiceNumber}
          />
          <Button icon={<ThunderboltOutlined />} title="Auto-generate invoice number" onClick={() => onChange({ invoiceNumber: peekNextInvoiceNumber() })} />
        </div>
        <FormDate label="Invoice date" required value={invoice.invoiceDate} onChange={(invoiceDate) => onChange({ invoiceDate })} error={errors?.invoiceDate} />
        <FormSelect label="Payment terms" value={invoice.paymentTerms} onChange={setTerms} options={TERMS.map((t) => ({ value: t, label: t }))} placeholder="Select terms" />
        <FormDate label="Due date" allowClear value={invoice.dueDate} onChange={(dueDate) => onChange({ dueDate: dueDate || undefined })} />

        <FormSelect
          label="Currency"
          value={invoice.currency}
          onChange={(currency) => onChange({ currency })}
          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.symbol}  ${c.code}` }))}
        />
        <FormInput label="Country of supply" required value={invoice.countryOfSupply} onChange={(countryOfSupply) => onChange({ countryOfSupply })} error={errors?.countryOfSupply} />
        <FormSelect
          className="sm:col-span-2"
          label="Place of supply"
          required
          searchable
          value={invoice.placeOfSupply}
          onChange={setPlaceOfSupply}
          options={INDIAN_STATES.map((s) => ({ value: s.name, label: `${s.name} (${s.code})` }))}
          placeholder="Select state"
          error={errors?.placeOfSupply}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Tax applied:</span>
        <Tag color={igst ? "gold" : "purple"} variant="filled" className="!m-0 !font-semibold">
          {igst ? "IGST — inter-state supply" : "CGST + SGST — intra-state supply"}
        </Tag>
        <span className="text-slate-400">Decided automatically from your state and the place of supply.</span>
      </div>
    </SectionCard>
  );
}
