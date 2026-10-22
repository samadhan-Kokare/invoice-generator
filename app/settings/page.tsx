"use client";

import { useEffect, useState } from "react";
import { App, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { AppSettings, Business } from "@/types/invoice";
import { CURRENCIES, DEFAULT_SETTINGS } from "@/constants/invoice";
import { businessFromProfile, createEmptyBusiness } from "@/lib/invoice/factory";
import { getBusinessProfile, getSettings, saveBusinessProfile, saveSettings } from "@/lib/storage/invoiceStorage";
import { FormInput, FormNumber, FormSelect, FormSwitch, PageHeader, SectionCard } from "@/components/ui";
import BusinessSection from "@/components/invoice/BusinessSection";

export default function SettingsPage() {
  const { message } = App.useApp();
  const [business, setBusiness] = useState<Business>(createEmptyBusiness());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const profile = getBusinessProfile();
    if (profile) setBusiness(businessFromProfile(profile));
    setSettings(getSettings());
  }, []);

  const set = (patch: Partial<AppSettings>) => setSettings((s) => ({ ...s, ...patch }));

  function saveBusiness(next: Business) {
    setBusiness(next);
    saveBusinessProfile({ id: "default", ...next });
    message.success("Business profile saved");
  }

  function saveDefaults() {
    if (saveSettings(settings)) message.success("Defaults saved");
    else message.error("Couldn't save — browser storage is unavailable.");
  }

  return (
    <div className="mx-auto w-full px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader title="Settings" subtitle="Defaults used every time you create an invoice" />

      <div className="space-y-5">
        <BusinessSection
          numbered={false}
          title="Business profile"
          subtitle="Pre-filled as “Billed By” on every new invoice"
          business={business}
          onChange={() => undefined}
          onSaveProfile={saveBusiness}
        />

        <SectionCard
          title="Invoice defaults"
          subtitle="Applied to new invoices"
          extra={
            <Button type="primary" icon={<SaveOutlined />} onClick={saveDefaults}>
              Save
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelect
              label="Currency"
              value={settings.defaultCurrency}
              onChange={(defaultCurrency) => set({ defaultCurrency })}
              options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
            />
            <FormInput label="Default payment terms" value={settings.defaultPaymentTerms} onChange={(defaultPaymentTerms) => set({ defaultPaymentTerms })} placeholder="Due on Receipt" />
            <FormInput label="Invoice number prefix" value={settings.invoiceNumberPrefix} onChange={(invoiceNumberPrefix) => set({ invoiceNumberPrefix })} hint="e.g. INV-2026-" />
            <FormNumber label="Next invoice number" min={1} precision={0} value={settings.nextInvoiceSequence} onChange={(nextInvoiceSequence) => set({ nextInvoiceSequence: Math.max(1, nextInvoiceSequence) })} />
          </div>
          <FormSwitch className="mt-5" checked={settings.roundOffEnabled} onChange={(roundOffEnabled) => set({ roundOffEnabled })} label="Round off totals by default" />
        </SectionCard>

        <p className="px-1 text-xs leading-relaxed text-slate-400">
          Everything is stored in this browser only — nothing is sent to a server. Clearing site data removes it, so keep PDF copies of important invoices.
        </p>
      </div>
    </div>
  );
}
