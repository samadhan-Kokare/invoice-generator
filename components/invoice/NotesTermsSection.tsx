"use client";

import { Invoice } from "@/types/invoice";
import { FormTextArea, SectionCard } from "@/components/ui";

interface Props {
  invoice: Invoice;
  onChange: (patch: Partial<Invoice>) => void;
}

export default function NotesTermsSection({ invoice, onChange }: Props) {
  return (
    <SectionCard id="sec-notes" step="06" title="Notes & Terms" subtitle="Optional — printed at the bottom of the invoice">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormTextArea label="Notes" rows={5} maxLength={800} value={invoice.notes} onChange={(notes) => onChange({ notes })} placeholder="Thank you for your business." />
        <FormTextArea
          label="Terms & conditions"
          rows={5}
          maxLength={1000}
          value={invoice.terms}
          onChange={(terms) => onChange({ terms })}
          placeholder={"Payment is due within 15 days.\nInterest at 18% p.a. on overdue amounts."}
          hint="One term per line — shown numbered on the invoice"
        />
      </div>
    </SectionCard>
  );
}
