"use client";

import { useState } from "react";
import { App, Button, Drawer } from "antd";
import { Business } from "@/types/invoice";
import { INDIAN_STATES } from "@/constants/invoice";
import { deriveFromGstin } from "@/lib/invoice/gst";
import { businessSchema, schemaErrors } from "@/lib/invoice/validation";
import { FormInput, FormSelect, LogoUploader } from "@/components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
  initialValues: Business;
  onSave: (business: Business) => void;
}

export default function BusinessDrawer({ open, onClose, initialValues, onSave }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      size={560}
      title={<span className="font-[family-name:var(--font-display)] font-bold">Business details</span>}
      styles={{ body: { padding: 0 } }}
    >
      <BusinessForm initialValues={initialValues} onCancel={onClose} onSave={onSave} />
    </Drawer>
  );
}

function BusinessForm({ initialValues, onCancel, onSave }: Omit<Props, "open" | "onClose"> & { onCancel: () => void }) {
  const { message } = App.useApp();
  const [draft, setDraft] = useState<Business>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (patch: Partial<Business>) => setDraft((d) => ({ ...d, ...patch }));

  function setGstin(gstin: string) {
    const derived = deriveFromGstin(gstin);
    set({ gstin, ...(derived.pan && !draft.pan ? { pan: derived.pan } : {}), ...(derived.state && !draft.state ? { state: derived.state } : {}) });
  }

  function save() {
    const found = schemaErrors(businessSchema, draft);
    setErrors(found ?? {});
    if (found) return void message.error("Please fix the highlighted fields");
    onSave(draft);
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-5 p-6">
        <LogoUploader value={draft.logoDataUrl} onChange={(logoDataUrl) => set({ logoDataUrl })} hint="Shown on the invoice header. PNG, JPG or WebP." />

        <FormInput label="Business name" required value={draft.businessName} onChange={(businessName) => set({ businessName })} error={errors.businessName} placeholder="e.g. Shree Siddhivinayak Enterprises" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput className="sm:col-span-2" label="Address line 1" required value={draft.addressLine1} onChange={(addressLine1) => set({ addressLine1 })} error={errors.addressLine1} />
          <FormInput className="sm:col-span-2" label="Address line 2" value={draft.addressLine2} onChange={(addressLine2) => set({ addressLine2 })} />
          <FormInput label="City" required value={draft.city} onChange={(city) => set({ city })} error={errors.city} />
          <FormSelect
            label="State"
            required
            searchable
            value={draft.state}
            onChange={(state) => set({ state })}
            options={INDIAN_STATES.map((s) => ({ value: s.name, label: s.name }))}
            error={errors.state}
            placeholder="Select state"
          />
          <FormInput label="Pincode" required value={draft.pincode} onChange={(pincode) => set({ pincode })} error={errors.pincode} maxLength={6} />
          <FormInput label="Country" required value={draft.country} onChange={(country) => set({ country })} error={errors.country} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput label="GSTIN" uppercase value={draft.gstin} onChange={setGstin} error={errors.gstin} placeholder="27AAAAA0000A1Z5" maxLength={15} hint="State and PAN fill in automatically" />
          <FormInput label="PAN" uppercase value={draft.pan} onChange={(pan) => set({ pan })} error={errors.pan} placeholder="AAAAA0000A" maxLength={10} />
          <FormInput label="Email" type="email" value={draft.email} onChange={(email) => set({ email })} error={errors.email} />
          <FormInput label="Phone" type="tel" value={draft.phone} onChange={(phone) => set({ phone })} />
          <FormInput className="sm:col-span-2" label="Website" value={draft.website} onChange={(website) => set({ website })} />
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-purple-100 bg-white px-6 py-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={save}>
          Save details
        </Button>
      </div>
    </div>
  );
}
