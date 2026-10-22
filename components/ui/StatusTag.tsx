import { Tag } from "antd";
import { InvoiceStatus } from "@/types/invoice";

const MAP: Record<InvoiceStatus, { color: string; label: string }> = {
  draft: { color: "default", label: "Draft" },
  pending: { color: "gold", label: "Pending" },
  paid: { color: "green", label: "Paid" },
  overdue: { color: "red", label: "Overdue" },
};

export const STATUS_OPTIONS = (Object.keys(MAP) as InvoiceStatus[]).map((s) => ({ value: s, label: MAP[s].label }));

export default function StatusTag({ status }: { status: InvoiceStatus }) {
  const { color, label } = MAP[status];
  return (
    <Tag color={color} variant="filled" className="!m-0 !rounded-full !px-2.5 !font-semibold">
      {label}
    </Tag>
  );
}
