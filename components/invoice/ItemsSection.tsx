"use client";

import { Button, InputNumber, Popconfirm, Select, Space } from "antd";
import { CopyOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { InvoiceItem, TaxMode } from "@/types/invoice";
import { GST_RATES, UNITS } from "@/constants/invoice";
import { formatCurrency } from "@/lib/invoice/format";
import { FormField, FormInput, FormNumber, FormSelect, FormTextArea, SectionCard } from "@/components/ui";

interface Props {
  items: InvoiceItem[];
  currency: string;
  taxMode: TaxMode;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<InvoiceItem>) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  error?: string;
  itemErrors?: Record<string, Partial<Record<string, string>>>;
}

export default function ItemsSection({ items, currency, taxMode, onAdd, onUpdate, onDuplicate, onRemove, error, itemErrors }: Props) {
  return (
    <SectionCard
      id="sec-items"
      step="04"
      title="Items & Services"
      subtitle="What you're billing for"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Add item
        </Button>
      }
    >
      {error && <p className="mb-3 text-xs font-medium text-rose-600">{error}</p>}

      <div className="space-y-4">
        {items.map((item, index) => {
          const errs = itemErrors?.[item.id] ?? {};
          return (
            <div key={item.id} className="rounded-xl border border-purple-100 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-700">
                  Item {index + 1}
                </span>
                <Space size={2}>
                  <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => onDuplicate(item.id)}>
                    <span className="hidden sm:inline">Duplicate</span>
                  </Button>
                  <Popconfirm title="Remove this item?" okText="Remove" okButtonProps={{ danger: true }} disabled={items.length <= 1} onConfirm={() => onRemove(item.id)}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} disabled={items.length <= 1}>
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </Popconfirm>
                </Space>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <FormInput className="md:col-span-6" label="Item / service" required value={item.itemName} onChange={(itemName) => onUpdate(item.id, { itemName })} error={errs.itemName} placeholder="e.g. Manpower supply services" />
                <FormInput className="md:col-span-3" label="HSN / SAC" value={item.hsnSac} onChange={(hsnSac) => onUpdate(item.id, { hsnSac })} placeholder="998513" />
                <FormSelect
                  className="md:col-span-3"
                  label="GST rate"
                  value={item.gstRate}
                  onChange={(gstRate) => onUpdate(item.id, { gstRate })}
                  options={GST_RATES.map((r) => ({ value: r, label: `${r}%` }))}
                />
                <FormTextArea className="md:col-span-12" label="Description" rows={2} maxLength={600} value={item.description} onChange={(description) => onUpdate(item.id, { description })} placeholder="Optional — shown under the item name" />

                <FormNumber className="md:col-span-2" label="Quantity" required min={0} value={item.quantity} onChange={(quantity) => onUpdate(item.id, { quantity })} error={errs.quantity} />
                <FormSelect className="md:col-span-2" label="Unit" value={item.unit} onChange={(unit) => onUpdate(item.id, { unit })} options={UNITS.map((u) => ({ value: u, label: u }))} />
                <FormNumber className="md:col-span-3" label="Rate" required min={0} prefix={currencyPrefix(currency)} value={item.rate} onChange={(rate) => onUpdate(item.id, { rate })} error={errs.rate} />

                <FormField className="md:col-span-3" label="Discount" error={errs.discountValue}>
                  <Space.Compact className="w-full">
                    <InputNumber
                      className="num !w-full"
                      controls={false}
                      min={0}
                      max={item.discountType === "percentage" ? 100 : undefined}
                      value={item.discountValue}
                      status={errs.discountValue ? "error" : undefined}
                      onChange={(v) => onUpdate(item.id, { discountValue: typeof v === "number" ? v : 0 })}
                    />
                    <Select
                      className="!w-[72px]"
                      value={item.discountType}
                      onChange={(discountType) => onUpdate(item.id, { discountType })}
                      options={[
                        { value: "percentage", label: "%" },
                        { value: "fixed", label: currencyPrefix(currency) },
                      ]}
                    />
                  </Space.Compact>
                </FormField>

                <div className="flex flex-col justify-end md:col-span-2">
                  <div className="mb-1.5 text-[12.5px] font-semibold text-slate-600">Line total</div>
                  <div className="num flex h-10 items-center justify-end rounded-[10px] bg-purple-50 px-3 text-[15px] font-extrabold text-purple-800">
                    {formatCurrency(item.total, currency)}
                  </div>
                </div>
              </div>

              <div className="num mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-dashed border-purple-100 pt-3 text-xs text-slate-500">
                <span>Taxable {formatCurrency(item.taxableAmount, currency)}</span>
                {taxMode === "IGST" ? (
                  <span>IGST {formatCurrency(item.igst, currency)}</span>
                ) : (
                  <>
                    <span>CGST {formatCurrency(item.cgst, currency)}</span>
                    <span>SGST {formatCurrency(item.sgst, currency)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button type="dashed" block size="large" icon={<PlusOutlined />} onClick={onAdd} className="!mt-4 !border-purple-200 !text-purple-700">
        Add another item
      </Button>
    </SectionCard>
  );
}

function currencyPrefix(code: string) {
  return { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED" }[code] ?? code;
}
