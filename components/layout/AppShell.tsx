"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  AppstoreOutlined,
  FileTextOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button } from "antd";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <AppstoreOutlined /> },
  { href: "/invoices", label: "Invoices", icon: <FileTextOutlined /> },
  { href: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The landing page is a standalone marketing screen.
  if (pathname === "/") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-purple-100 bg-white md:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-6 pb-6 pt-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-lg font-bold text-white shadow-[0_6px_16px_rgba(126,34,206,.35)]">
            ₹
          </span>
          <span>
            <span className="block font-[family-name:var(--font-display)] text-[17px] font-extrabold leading-none text-slate-900">
              Billbook
            </span>
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[.14em] text-purple-600">
              GST invoices
            </span>
          </span>
        </Link>

        <div className="px-4">
          <Link href="/invoices/create">
            <Button type="primary" size="large" icon={<PlusOutlined />} block>
              New Invoice
            </Button>
          </Link>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-4">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-purple-50 text-purple-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <p className="px-6 pb-6 text-xs leading-relaxed text-slate-400">
          Your data stays in this browser. Export PDFs to keep permanent copies.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-purple-100 bg-white/95 backdrop-blur md:hidden">
        {[...NAV, { href: "/invoices/create", label: "New", icon: <PlusOutlined /> }].map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                active ? "text-purple-700" : "text-slate-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
