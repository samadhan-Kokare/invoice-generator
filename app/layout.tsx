import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Billbook — GST Invoice Generator",
  description: "Create professional GST invoices, preview them on A4 and download as PDF or Excel. Runs entirely in your browser.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#7e22ce" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
