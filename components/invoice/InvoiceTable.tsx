"use client";

import { useRouter } from "next/navigation";
import { Button, Popconfirm, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Invoice } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/invoice/format";
import { StatusTag } from "@/components/ui";

interface Props {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  onDownload: (invoice: Invoice) => void;
  downloading?: boolean;
  pageSize?: number | false;
}

export default function InvoiceTable({ invoices, onDelete, onDownload, downloading, pageSize = 10 }: Props) {
  const router = useRouter();

  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice",
      dataIndex: "invoiceNumber",
      render: (_, inv) => (
        <div>
          <div className="whitespace-nowrap font-bold text-slate-900">{inv.invoiceNumber}</div>
          <div className="text-xs text-slate-400">{formatDate(inv.invoiceDate)}</div>
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: ["customer", "customerName"],
      ellipsis: true,
      render: (name: string) => <span className="font-medium text-slate-700">{name || "—"}</span>,
    },
    { title: "Due date", dataIndex: "dueDate", responsive: ["md"], render: (d?: string) => <span className="text-slate-500">{d ? formatDate(d) : "—"}</span> },
    {
      title: "Amount",
      dataIndex: "grandTotal",
      align: "right",
      render: (_, inv) => <span className="num whitespace-nowrap font-bold text-slate-900">{formatCurrency(inv.grandTotal, inv.currency)}</span>,
    },
    { title: "Status", dataIndex: "status", render: (_, inv) => <StatusTag status={inv.status} /> },
    {
      title: "",
      key: "actions",
      align: "right",
      width: 150,
      render: (_, inv) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} onClick={() => router.push(`/invoices/${inv.id}`)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => router.push(`/invoices/${inv.id}?edit=1`)} />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button type="text" icon={<FilePdfOutlined />} disabled={downloading} onClick={() => onDownload(inv)} />
          </Tooltip>
          <Popconfirm title="Delete this invoice?" description="This can't be undone." okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => onDelete(inv.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} aria-label="Delete" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table<Invoice>
      rowKey="id"
      columns={columns}
      dataSource={invoices}
      pagination={pageSize ? { pageSize, hideOnSinglePage: true, showSizeChanger: false } : false}
      scroll={{ x: 640 }}
      onRow={(inv) => ({ onClick: () => router.push(`/invoices/${inv.id}`), className: "cursor-pointer" })}
    />
  );
}
