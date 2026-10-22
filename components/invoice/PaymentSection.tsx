"use client";

import { Invoice, PaymentDetails } from "@/types/invoice";
import { FormInput, FormSwitch, LogoUploader, SectionCard } from "@/components/ui";

interface Props {
  invoice: Invoice;
  onChange: (patch: Partial<Invoice>) => void;
}

export default function PaymentSection({ invoice, onChange }: Props) {
  const pay: PaymentDetails = invoice.paymentDetails ?? { enabled: false };
  const set = (patch: Partial<PaymentDetails>) => onChange({ paymentDetails: { ...pay, ...patch } });

  return (
    <SectionCard id="sec-payment" step="07" title="Payment Details" subtitle="Bank and UPI details for your client">
      <FormSwitch checked={pay.enabled} onChange={(enabled) => set({ enabled })} label="Show payment details on invoice" />

      {pay.enabled && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormInput label="Account holder name" value={pay.accountHolderName} onChange={(accountHolderName) => set({ accountHolderName })} />
          <FormInput label="Bank name" value={pay.bankName} onChange={(bankName) => set({ bankName })} />
          <FormInput label="Account number" value={pay.accountNumber} onChange={(accountNumber) => set({ accountNumber })} />
          <FormInput label="IFSC" uppercase value={pay.ifsc} onChange={(ifsc) => set({ ifsc })} maxLength={11} />
          <FormInput label="Branch" value={pay.branch} onChange={(branch) => set({ branch })} />
          <FormInput label="UPI ID" value={pay.upiId} onChange={(upiId) => set({ upiId })} placeholder="name@bank" />
          <LogoUploader className="sm:col-span-2 lg:col-span-3" label="UPI QR code" value={pay.upiQrDataUrl} onChange={(upiQrDataUrl) => set({ upiQrDataUrl })} maxSize={400} hint="Optional — printed beside the bank details" />
        </div>
      )}
    </SectionCard>
  );
}
