# Billbook — GST Invoice Generator

Next.js (App Router) + TypeScript + Tailwind CSS + Ant Design. No backend: all data lives in the browser's localStorage.

## Structure
- `app/` — pages: dashboard, invoices, invoices/create, invoices/[id], settings
- `components/ui/` — reusable form primitives (FormInput, FormSelect, FormNumber, FormDate, FormTextArea, FormSwitch, LogoUploader, SectionCard)
- `components/invoice/` — editor sections, Billed By / Billed To drawers, Preview drawer, A4 document
- `lib/invoice/` — GST, calculations, amount-in-words, pagination, validation
- `lib/pdf`, `lib/excel`, `lib/storage` — exports and localStorage service
- `lib/theme.ts` — Ant Design purple theme tokens

Data is stored per browser; clearing site data removes it. Export PDFs/Excel to keep permanent copies.
