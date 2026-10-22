"use client";

import { useCallback, useMemo, useState } from "react";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { recalculateInvoice } from "@/lib/invoice/calculations";
import { createEmptyItem } from "@/lib/invoice/factory";

/**
 * Owns a single Invoice's editable state and guarantees that every
 * update flows back through the calculation engine, so the live
 * preview, PDF and Excel export are always reading the same totals.
 */
export function useInvoice(initial: Invoice) {
  const [rawInvoice, setRawInvoice] = useState<Invoice>(initial);

  const invoice = useMemo(() => recalculateInvoice(rawInvoice), [rawInvoice]);

  const updateInvoice = useCallback((patch: Partial<Invoice>) => {
    setRawInvoice((prev) => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<InvoiceItem>) => {
    setRawInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addItem = useCallback(() => {
    setRawInvoice((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()], updatedAt: new Date().toISOString() }));
  }, []);

  const duplicateItem = useCallback((id: string) => {
    setRawInvoice((prev) => {
      const index = prev.items.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      const clone: InvoiceItem = { ...prev.items[index], id: crypto.randomUUID() };
      const items = [...prev.items];
      items.splice(index + 1, 0, clone);
      return { ...prev, items, updatedAt: new Date().toISOString() };
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setRawInvoice((prev) => {
      if (prev.items.length <= 1) return prev; // always keep at least one row
      return { ...prev, items: prev.items.filter((item) => item.id !== id), updatedAt: new Date().toISOString() };
    });
  }, []);

  return { invoice, setInvoice: setRawInvoice, updateInvoice, updateItem, addItem, duplicateItem, removeItem };
}
