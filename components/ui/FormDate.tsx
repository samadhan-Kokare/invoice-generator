"use client";

import { ReactNode } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import FormField from "./FormField";

interface Props {
  label?: ReactNode;
  /** ISO date string, YYYY-MM-DD */
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  allowClear?: boolean;
  placeholder?: string;
  className?: string;
}

export default function FormDate({ label, value, onChange, required, error, hint, allowClear, placeholder, className }: Props) {
  const parsed = value ? dayjs(value) : null;
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <DatePicker
        className="!w-full"
        format="DD MMM YYYY"
        allowClear={allowClear}
        placeholder={placeholder ?? "Select date"}
        value={parsed && parsed.isValid() ? parsed : null}
        status={error ? "error" : undefined}
        onChange={(d) => onChange(d ? d.format("YYYY-MM-DD") : "")}
      />
    </FormField>
  );
}
