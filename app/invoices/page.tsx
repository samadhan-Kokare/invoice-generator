"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { App, Button, Card, Empty, Input, Segmented, Skeleton } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { deleteInvoice, getInvoices } from "@/lib/storage/invoiceStorage";
import { useInvoiceExport } from "@/hooks/useInvoiceExport";
import { PageHeader } from "@/components/ui";
import InvoiceTable from "@/components/invoice/InvoiceTable";

type Filter = "all" | InvoiceStatus;

export default function InvoicesPage() {
  const { message } = App.useApp();
  const { busy, downloadPdf, host } = useInvoiceExport();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (invoices ?? []).filter(
      (i) =>
        (filter === "all" || i.status === filter) &&
        (!q || i.invoiceNumber.toLowerCase().includes(q) || i.customer.customerName.toLowerCase().includes(q))
    );
  }, [invoices, query, filter]);

  function handleDelete(id: string) {
    deleteInvoice(id);
    setInvoices(getInvoices());
    message.success("Invoice deleted");
  }

  return (
    <div className="mx-auto w-full px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader
        title="Invoices"
        subtitle="Everything saved in this browser"
        actions={
          <Link href="/invoices/create">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              New invoice
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          allowClear
          size="large"
          className="!w-full sm:!w-80"
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Search by number or customer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "draft", label: "Draft" },
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "overdue", label: "Overdue" },
          ]}
        />
      </div>

      <Card variant="borderless" className="!rounded-2xl !border !border-purple-100/80" styles={{ body: { padding: 0 } }}>
        {invoices === null ? (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : visible.length === 0 ? (
          <Empty className="!my-12" description={invoices.length === 0 ? "No invoices yet" : "No invoices match your filters"}>
            {invoices.length === 0 && (
              <Link href="/invoices/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  Create invoice
                </Button>
              </Link>
            )}
          </Empty>
        ) : (
          <InvoiceTable invoices={visible} onDelete={handleDelete} onDownload={(inv) => void downloadPdf(inv)} downloading={busy === "pdf"} />
        )}
      </Card>
      {host}
    </div>
  );
}
