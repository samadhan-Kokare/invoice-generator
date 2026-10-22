"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { App, Button, Empty, Popconfirm, Select, Skeleton } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { deleteInvoice, getInvoiceById, updateInvoice } from "@/lib/storage/invoiceStorage";
import { useInvoiceExport } from "@/hooks/useInvoiceExport";
import InvoiceEditor from "@/components/invoice/InvoiceEditor";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { STATUS_OPTIONS } from "@/components/ui";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const editing = useSearchParams().get("edit") === "1";
  const { message } = App.useApp();
  const { busy, downloadPdf, exportExcel, host } = useInvoiceExport();

  // undefined = still loading, null = not found
  const [stored, setStored] = useState<Invoice | null | undefined>(undefined);

  useEffect(() => {
    setStored(getInvoiceById(id) ?? null);
  }, [id]);

  if (stored === undefined) {
    return (
      <div className="mx-auto w-full px-4 py-8">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (stored === null) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <Empty description="This invoice doesn't exist in this browser.">
          <Link href="/invoices">
            <Button type="primary">Back to invoices</Button>
          </Link>
        </Empty>
      </div>
    );
  }

  if (editing) {
    return (
      <InvoiceEditor
        key={stored.updatedAt}
        initial={stored}
        mode="edit"
        backHref={pathname}
        onSaved={(invoice) => {
          setStored(invoice);
          router.replace(pathname);
        }}
      />
    );
  }

  function changeStatus(status: InvoiceStatus) {
    if (!stored) return;
    const next = { ...stored, status };
    if (updateInvoice(next.id, next)) {
      setStored(next);
      message.success(`Marked as ${status}`);
    }
  }

  function handleDelete() {
    if (!stored) return;
    deleteInvoice(stored.id);
    message.success("Invoice deleted");
    router.push("/invoices");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-20 border-b border-purple-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/invoices">
              <Button type="text" shape="circle" icon={<ArrowLeftOutlined />} aria-label="Back to invoices" />
            </Link>
            <div className="min-w-0">
              <h1 className="m-0 truncate font-[family-name:var(--font-display)] text-[17px] font-extrabold leading-tight text-slate-900">{stored.invoiceNumber}</h1>
              <p className="m-0 truncate text-xs text-slate-500">{stored.customer.customerName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select<InvoiceStatus> value={stored.status} onChange={changeStatus} options={STATUS_OPTIONS} className="!w-[120px]" aria-label="Invoice status" />
            <Link href={`${pathname}?edit=1`}>
              <Button icon={<EditOutlined />}>
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>
            <Button icon={<FileExcelOutlined />} loading={busy === "excel"} onClick={() => exportExcel(stored)}>
              <span className="hidden md:inline">Excel</span>
            </Button>
            <Button type="primary" icon={<FilePdfOutlined />} loading={busy === "pdf"} onClick={() => void downloadPdf(stored)}>
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
            <Popconfirm title="Delete this invoice?" description="This can't be undone." okText="Delete" okButtonProps={{ danger: true }} onConfirm={handleDelete}>
              <Button danger icon={<DeleteOutlined />} aria-label="Delete invoice" />
            </Popconfirm>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[900px] flex-1 px-3 py-6 sm:px-6 sm:py-8">
        <InvoicePreview invoice={stored} />
      </main>
      {host}
    </div>
  );
}
