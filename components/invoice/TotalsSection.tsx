"use client";

import { Invoice } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice/format";
import { FormSwitch, SectionCard } from "@/components/ui";

interface Props {
  invoice: Invoice;
  onChange: (patch: Partial<Invoice>) => void;
}

export default function TotalsSection({ invoice, onChange }: Props) {
  const cur = invoice.currency;
  const igst = invoice.taxMode === "IGST";

  return (
    <SectionCard id="sec-totals" step="05" title="Tax & Totals" subtitle="Calculated automatically as you type">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FormSwitch
            checked={invoice.roundOffEnabled}
            onChange={(roundOffEnabled) => onChange({ roundOffEnabled })}
            label="Round off total"
            description="Rounds the grand total to the nearest rupee"
          />
          <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-500">Total in words</div>
            <div className="mt-1.5 text-[13px] font-bold leading-relaxed text-slate-800">{invoice.amountInWords || "—"}</div>
          </div>
        </div>

        <div className="num rounded-xl border border-purple-100 bg-white p-4 text-sm">
          <Row label="Subtotal" value={formatCurrency(invoice.subtotal, cur)} />
          {invoice.totalDiscount > 0 && <Row label="Taxable value" value={`− ${formatCurrency(invoice.totalDiscount, cur)}`} />}
          <Row label="Taxable amount" value={formatCurrency(invoice.taxableAmount, cur)} />
          {igst ? (
            <Row label="IGST" value={formatCurrency(invoice.igst, cur)} />
          ) : (
            <>
              <Row label="CGST" value={formatCurrency(invoice.cgst, cur)} />
              <Row label="SGST" value={formatCurrency(invoice.sgst, cur)} />
            </>
          )}
          {invoice.roundOffEnabled && <Row label="Round off" value={formatCurrency(invoice.roundOff, cur)} />}

          <div className="mt-3 flex items-baseline justify-between border-t border-purple-100 pt-3">
            <span className="font-[family-name:var(--font-display)] text-sm font-extrabold text-purple-900">Grand total</span>
            <span className="border-b-4 border-double border-purple-700 pb-0.5 font-[family-name:var(--font-display)] text-xl font-extrabold text-purple-700">
              {formatCurrency(invoice.grandTotal, cur)}
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
