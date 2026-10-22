"use client";

import { useState } from "react";
import { Button, Select } from "antd";
import { EditOutlined, UserAddOutlined } from "@ant-design/icons";
import { Customer } from "@/types/invoice";
import { FormField, SectionCard } from "@/components/ui";
import AddClientDrawer from "./AddClientDrawer";

interface Props {
  customer: Customer;
  onChange: (patch: Partial<Customer>) => void;
  savedClients?: Customer[];
  /** Called when a client is added or edited, so it can be remembered. */
  onSaveNewClient?: (client: Customer) => void;
  errors?: Partial<Record<keyof Customer, string>>;
}

export default function CustomerSection({ customer, onChange, savedClients = [], onSaveNewClient, errors }: Props) {
  const [drawer, setDrawer] = useState<"new" | "edit" | null>(null);
  const hasCustomer = Boolean(customer.customerName);
  const firstError = errors && Object.values(errors).find(Boolean);
  const errorText = firstError && (hasCustomer ? firstError : "Select or add a client to continue");

  return (
    <>
      <SectionCard
        id="sec-customer"
        step="02"
        title="Billed To"
        subtitle="Client's details"
        extra={
          <div className="flex items-center gap-1">
            {hasCustomer && (
              <Button type="text" icon={<EditOutlined />} onClick={() => setDrawer("edit")} className="!font-semibold !text-purple-700">
                Edit
              </Button>
            )}
            {(hasCustomer || savedClients.length > 0) && (
              <Button type="text" icon={<UserAddOutlined />} onClick={() => setDrawer("new")} className="!font-semibold !text-purple-700">
                <span className="hidden sm:inline">New client</span>
              </Button>
            )}
          </div>
        }
      >
        {savedClients.length > 0 && (
          <FormField label="Select client" className="mb-4">
            <Select
              size="large"
              className="w-full"
              showSearch={{ optionFilterProp: "label" }}
              placeholder="Choose a saved client"
              value={savedClients.some((c) => c.customerName === customer.customerName) ? customer.customerName : undefined}
              onChange={(name) => {
                const client = savedClients.find((c) => c.customerName === name);
                if (client) onChange(client);
              }}
              options={savedClients.map((c) => ({ label: c.customerName, value: c.customerName }))}
            />
          </FormField>
        )}

        {hasCustomer ? (
          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
            <div className="text-sm font-bold text-slate-900">{customer.customerName}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-slate-500">
              {[customer.addressLine1, customer.addressLine2, customer.city, customer.state, customer.pincode, customer.country].filter(Boolean).join(", ")}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
              {customer.gstin && <span className="font-semibold text-purple-700">GSTIN: {customer.gstin}</span>}
              {customer.pan && <span>PAN: {customer.pan}</span>}
              {customer.email && <span>{customer.email}</span>}
              {customer.phone && <span>{customer.phone}</span>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/40 px-6 py-8 text-center">
            <p className="m-0 mb-4 text-sm text-slate-500">
              {savedClients.length > 0 ? "Pick a client above, or add a new one." : "Who is this invoice for?"}
            </p>
            <Button type="primary" size="large" icon={<UserAddOutlined />} onClick={() => setDrawer("new")}>
              Add new client
            </Button>
          </div>
        )}
        {errorText && <p className="mt-2 text-xs font-medium text-rose-600">{errorText}</p>}
      </SectionCard>

      <AddClientDrawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        initialValues={drawer === "edit" ? customer : undefined}
        onSave={(client) => {
          onChange(client);
          onSaveNewClient?.(client);
          setDrawer(null);
        }}
      />
    </>
  );
}
