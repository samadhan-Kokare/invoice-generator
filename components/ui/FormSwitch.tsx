"use client";

import { ReactNode } from "react";
import { Switch } from "antd";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
}

export default function FormSwitch({ checked, onChange, label, description, className = "" }: Props) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-700">{label}</div>
        {description && <div className="mt-0.5 text-xs text-slate-400">{description}</div>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
