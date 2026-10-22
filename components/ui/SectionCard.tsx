"use client";

import { ReactNode } from "react";
import { Card } from "antd";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  /** Small step marker shown before the title, e.g. "01". */
  step?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

/** The one card style used by every section of the editor. */
export default function SectionCard({ title, subtitle, extra, step, children, className = "", id }: Props) {
  return (
    <Card
      id={id}
      variant="borderless"
      className={`!rounded-2xl !border !border-purple-100/80 !bg-white shadow-[0_1px_2px_rgba(30,27,46,.04)] ${className}`}
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-purple-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {step && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 font-[family-name:var(--font-display)] text-[11px] font-extrabold tracking-wider text-purple-700">
              {step}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="m-0 truncate font-[family-name:var(--font-display)] text-[15px] font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="m-0 mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {extra && <div className="shrink-0">{extra}</div>}
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </Card>
  );
}
