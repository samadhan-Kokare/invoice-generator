"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { App, Button, Card, Empty, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Invoice } from "@/types/invoice";
import { deleteInvoice, getInvoices } from "@/lib/storage/invoiceStorage";
import { formatCurrency } from "@/lib/invoice/format";
import { useInvoiceExport } from "@/hooks/useInvoiceExport";
import { PageHeader } from "@/components/ui";
import InvoiceTable from "@/components/invoice/InvoiceTable";

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-purple-700 bg-purple-700 text-white" : "border-purple-100 bg-white"}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider ${accent ? "text-purple-200" : "text-slate-400"}`}>{label}</div>
      <div className={`num mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold ${accent ? "text-white" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { message } = App.useApp();
  const { busy, downloadPdf, host } = useInvoiceExport();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const stats = useMemo(() => {
    const list = invoices ?? [];
    return {
      total: list.length,
      draft: list.filter((i) => i.status === "draft").length,
      paid: list.filter((i) => i.status === "paid").length,
      pending: list.filter((i) => i.status === "pending" || i.status === "overdue").length,
      amount: list.reduce((sum, i) => sum + i.grandTotal, 0),
    };
  }, [invoices]);

  function handleDelete(id: string) {
    deleteInvoice(id);
    setInvoices(getInvoices());
    message.success("Invoice deleted");
  }

  return (
    <div className="mx-auto w-full px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader
        title="Dashboard"
        subtitle="Your invoices at a glance"
        actions={
          <Link href="/invoices/create">
            <Button className="bg-purple-700" type="primary" size="large" icon={<PlusOutlined />}>
              New invoice
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Stat label="Total invoices" value={String(stats.total)} />
        <Stat label="Draft" value={String(stats.draft)} />
        <Stat label="Paid" value={String(stats.paid)} />
        <Stat label="Pending" value={String(stats.pending)} />
        <div className="col-span-2 lg:col-span-1">
          <Stat label="Total amount" value={formatCurrency(stats.amount, "INR", 0)} accent />
        </div>
      </div>

      <Card
        variant="borderless"
        className="!mt-6 !rounded-2xl !border !border-purple-100/80"
        title={<span className="font-[family-name:var(--font-display)] font-bold">Recent invoices</span>}
        extra={<Link href="/invoices" className="text-sm font-semibold text-purple-700">View all</Link>}
        styles={{ body: { padding: 0 } }}
      >
        {invoices === null ? (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : invoices.length === 0 ? (
          <Empty className="!my-12" description="No invoices yet">
            <Link href="/invoices/create">
              <Button type="primary" icon={<PlusOutlined />}>
                Create your first invoice
              </Button>
            </Link>
          </Empty>
        ) : (
          <InvoiceTable invoices={invoices.slice(0, 8)} onDelete={handleDelete} onDownload={(inv) => void downloadPdf(inv)} downloading={busy === "pdf"} pageSize={false} />
        )}
      </Card>
      {host}
    </div>
  );
}
