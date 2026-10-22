# Billbook — GST Invoice Generator (frontend only)

Next.js (App Router) + TypeScript + Tailwind CSS + Ant Design. No backend: all data lives in the browser's localStorage.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo.
3. Framework preset: Next.js (auto-detected). No environment variables needed. Click Deploy.

## Structure
- `app/` — pages: dashboard, invoices, invoices/create, invoices/[id], settings
- `components/ui/` — reusable form primitives (FormInput, FormSelect, FormNumber, FormDate, FormTextArea, FormSwitch, LogoUploader, SectionCard)
- `components/invoice/` — editor sections, Billed By / Billed To drawers, Preview drawer, A4 document
- `lib/invoice/` — GST, calculations, amount-in-words, pagination, validation
- `lib/pdf`, `lib/excel`, `lib/storage` — exports and localStorage service
- `lib/theme.ts` — Ant Design purple theme tokens

Data is stored per browser; clearing site data removes it. Export PDFs/Excel to keep permanent copies.
