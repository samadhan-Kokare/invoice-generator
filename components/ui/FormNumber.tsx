"use client";

import { ReactNode } from "react";
import { InputNumber } from "antd";
import FormField from "./FormField";

interface Props {
  label?: ReactNode;
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  addonAfter?: ReactNode;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

/** Numeric input. Always reports a real number (empty field -> 0). */
export default function FormNumber({ label, value, onChange, required, error, hint, className, addonAfter, ...rest }: Props) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <InputNumber
        {...rest}
        className="num !w-full"
        controls={false}
        value={value}
        status={error ? "error" : undefined}
        onChange={(v) => onChange(typeof v === "number" ? v : 0)}
        addonAfter={addonAfter}
      />
    </FormField>
  );
}
