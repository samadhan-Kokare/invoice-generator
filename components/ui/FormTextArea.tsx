"use client";

import { ReactNode } from "react";
import { Input } from "antd";
import FormField from "./FormField";

interface Props {
  label?: ReactNode;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  maxLength?: number;
  className?: string;
}

export default function FormTextArea({ label, value, onChange, rows = 3, required, error, hint, className, ...rest }: Props) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <Input.TextArea
        {...rest}
        rows={rows}
        value={value ?? ""}
        status={error ? "error" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormField>
  );
}
