"use client";

import { ReactNode } from "react";

export interface FormFieldProps {
  label?: ReactNode;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Shared label / hint / error shell used by every Form* primitive.
 * Change typography or spacing of ALL form fields from this one file.
 */
export default function FormField({ label, required, error, hint, className = "", children }: FormFieldProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label className="mb-1.5 flex items-center gap-1 text-[12.5px] font-semibold tracking-[.01em] text-slate-600">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
