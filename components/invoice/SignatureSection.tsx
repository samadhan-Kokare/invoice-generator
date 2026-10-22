"use client";

import { Invoice, Signature } from "@/types/invoice";
import { FormInput, FormSwitch, LogoUploader, SectionCard } from "@/components/ui";

interface Props {
  invoice: Invoice;
  onChange: (patch: Partial<Invoice>) => void;
}

export default function SignatureSection({ invoice, onChange }: Props) {
  const sig: Signature = invoice.signature ?? { enabled: true };
  const set = (patch: Partial<Signature>) => onChange({ signature: { ...sig, ...patch } });

  return (
    <SectionCard id="sec-signature" step="08" title="Signature" subtitle="Authorised signatory">
      <FormSwitch checked={sig.enabled} onChange={(enabled) => set({ enabled })} label="Show signature block on invoice" />

      {sig.enabled && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput label="Authorised signatory name" value={sig.authorisedSignatoryName} onChange={(authorisedSignatoryName) => set({ authorisedSignatoryName })} placeholder="e.g. Rahul Patil" />
          <LogoUploader label="Signature image" wide value={sig.signatureImageDataUrl} onChange={(signatureImageDataUrl) => set({ signatureImageDataUrl })} maxSize={500} hint="Transparent PNG works best" />
        </div>
      )}
    </SectionCard>
  );
}
