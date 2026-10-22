"use client";

import { ReactNode } from "react";
import { Select } from "antd";
import FormField from "./FormField";

export interface SelectOption<V extends string | number = string> {
  label: ReactNode;
  value: V;
}

interface Props<V extends string | number> {
  label?: ReactNode;
  value?: V;
  onChange: (value: V) => void;
  options: SelectOption<V>[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  searchable?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  popupMatchSelectWidth?: boolean | number;
}

export default function FormSelect<V extends string | number = string>({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  hint,
  searchable,
  disabled,
  allowClear,
  className,
  popupMatchSelectWidth,
}: Props<V>) {
  return (
    <FormField label={label} required={required} error={error} hint={hint} className={className}>
      <Select<V>
        className="w-full"
        value={value === "" ? undefined : value}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        options={options}
        status={error ? "error" : undefined}
        showSearch={searchable ? { optionFilterProp: "label" } : undefined}
        popupMatchSelectWidth={popupMatchSelectWidth}
        onChange={(v) => onChange(v)}
      />
    </FormField>
  );
}
