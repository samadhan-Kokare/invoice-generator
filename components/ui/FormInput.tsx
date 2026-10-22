"use client";

import { ReactNode } from "react";
import { Input } from "antd";
import FormField from "./FormField";

interface Props {
  label?: ReactNode;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  disabled?: boolean;
  type?: "text" | "email" | "tel" | "url";
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Force upper-case while typing (GSTIN, PAN, IFSC). */
  uppercase?: boolean;
  maxLength?: number;
  className?: string;
}

export default function FormInput({ label, value, onChange, uppercase, required, error, hint, className, ...rest }: Props) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <Input
        {...rest}
        value={value ?? ""}
        status={error ? "error" : undefined}
        onChange={(e) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
        autoComplete="off"
      />
    </FormField>
  );
}
