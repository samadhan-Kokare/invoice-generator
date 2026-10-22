"use client";

import Link from "next/link";
import { ArrowRightOutlined, CheckCircleFilled } from "@ant-design/icons";

const POINTS = [
  "CGST / SGST / IGST worked out for you from the place of supply",
  "Print-ready A4 PDF and Excel export in one click",
  "No sign-up. Your data never leaves this browser",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-purple-100/70 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-lg font-bold text-white shadow-[0_6px_16px_rgba(126,34,206,.35)]">₹</span>
          <span className="font-(family-name:--font-display) text-lg font-extrabold text-slate-900">Invoce generator</span>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-purple-700 hover:text-purple-900">
          Open app
        </Link>
      </header>

      <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-20">
        {/* <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-purple-600">GST invoice generator</p> */}
        <h1 className="max-w-3xl font-(family-name:--font-display) text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
          Invoices that look as professional as your business.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-500">
          Fill in the details, preview the A4 page, download the PDF. Built for Indian GST billing.
        </p>

        <ul className="mt-8 space-y-3">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px] text-slate-700">
              <CheckCircleFilled className="mt-1 text-purple-600" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(126,34,206,.3)] transition hover:bg-purple-800"
          >
            Create an invoice <ArrowRightOutlined />
          </Link>
          <Link href="/dashboard" className="inline-flex items-center rounded-xl border border-purple-200 px-7 py-3.5 text-[15px] font-bold text-purple-800 transition hover:bg-purple-50">
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
