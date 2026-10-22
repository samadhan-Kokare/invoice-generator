"use client";

import { useState } from "react";
import { Button } from "antd";
import { BankOutlined, EditOutlined } from "@ant-design/icons";
import { Business } from "@/types/invoice";
import { SectionCard } from "@/components/ui";
import BusinessDrawer from "./BusinessDrawer";

interface Props {
  business: Business;
  onChange: (patch: Partial<Business>) => void;
  /** Persist as the default profile for future invoices. */
  onSaveProfile?: (business: Business) => void;
  errors?: Partial<Record<keyof Business, string>>;
  title?: string;
  subtitle?: string;
  /** Set to false where the card isn't part of the numbered invoice steps (e.g. Settings). */
  numbered?: boolean;
}

export default function BusinessSection({ business, onChange, onSaveProfile, errors, title = "Billed By", subtitle = "Your business details", numbered = true }: Props) {
  const [open, setOpen] = useState(false);
  const hasBusiness = Boolean(business.businessName);
  const firstError = errors && Object.values(errors).find(Boolean);
  // nothing added yet -> say so plainly instead of surfacing "Address is required"
  const errorText = firstError && (hasBusiness ? firstError : "Add your business details to continue");

  return (
    <>
      <SectionCard
        id="sec-business"
        step={numbered ? "01" : undefined}
        title={title}
        subtitle={subtitle}
        extra={
          hasBusiness && (
            <Button type="text" icon={<EditOutlined />} onClick={() => setOpen(true)} className="!font-semibold !text-purple-700">
              Edit
            </Button>
          )
        }
      >
        {hasBusiness ? (
          <div className="flex gap-4 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
            {business.logoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoDataUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-purple-100 bg-white object-contain p-1" />
            )}
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900">{business.businessName}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-slate-500">
                {[business.addressLine1, business.addressLine2, business.city, business.state, business.pincode, business.country].filter(Boolean).join(", ")}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                {business.gstin && <span className="font-semibold text-purple-700">GSTIN: {business.gstin}</span>}
                {business.pan && <span>PAN: {business.pan}</span>}
                {business.email && <span>{business.email}</span>}
                {business.phone && <span>{business.phone}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/40 px-6 py-8 text-center">
            <BankOutlined className="mb-2 text-2xl text-purple-400" />
            <p className="m-0 mb-4 text-sm text-slate-500">Add your business details once — they&apos;re remembered for every new invoice.</p>
            <Button type="primary" size="large" icon={<EditOutlined />} onClick={() => setOpen(true)}>
              Add business details
            </Button>
          </div>
        )}
        {errorText && <p className="mt-2 text-xs font-medium text-rose-600">{errorText}</p>}
      </SectionCard>

      <BusinessDrawer
        open={open}
        onClose={() => setOpen(false)}
        initialValues={business}
        onSave={(next) => {
          onChange(next);
          onSaveProfile?.(next);
          setOpen(false);
        }}
      />
    </>
  );
}
