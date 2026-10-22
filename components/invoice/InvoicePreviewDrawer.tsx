"use client";

import { Button, Drawer, Tag } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { Invoice } from "@/types/invoice";
import InvoicePreview from "./InvoicePreview";

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownloadPdf: () => void;
  downloading?: boolean;
}

/** Right-side slide-over with the live A4 invoice. Mounted only while open. */
export default function InvoicePreviewDrawer({ open, onClose, invoice, onDownloadPdf, downloading }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      size="min(800px, 100vw)"
      title={
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-display)] font-bold">Invoice preview</span>
          <Tag color="purple" variant="filled" className="!m-0 !font-semibold">
            A4
          </Tag>
        </div>
      }
      extra={
        <Button type="primary" icon={<FilePdfOutlined />} loading={downloading} onClick={onDownloadPdf}>
          Download PDF
        </Button>
      }
      styles={{ body: { padding: 16, background: "#efeaf7" } }}
    >
      <InvoicePreview invoice={invoice} />
    </Drawer>
  );
}
