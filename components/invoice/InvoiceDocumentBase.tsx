"use client";

import { CSSProperties, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Invoice } from "@/types/invoice";
import { buildHsnSummary } from "@/lib/invoice/calculations";
import { amountToWords } from "@/lib/invoice/amountToWords";
import { formatAmount, formatCurrency, formatDate } from "@/lib/invoice/format";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  CONTENT_WIDTH_PX,
  InvoicePage,
  LayoutMetrics,
  PAGE_FOOTER_PX,
  PAGE_PADDING_TOP,
  PAGE_PADDING_X,
  paginateInvoice,
} from "@/lib/invoice/paginate";

/* ------------------------------------------------------------------
   One professional purple theme. Plain hex values on purpose so the
   PDF capture renders identically everywhere.
------------------------------------------------------------------- */
const C = {
  brand: "#7e22ce",
  brandDark: "#581c87",
  soft: "#faf5ff",
  line: "#e9d5ff",
  rule: "#ece6f5",
  ink: "#1e1b2e",
  body: "#403d52",
  muted: "#7a7691",
};

const FONT = `"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
const DISPLAY = `"Plus Jakarta Sans Variable", "Plus Jakarta Sans", ${FONT}`;

interface Props {
  invoice: Invoice;
  /** Prefix for DOM ids: pages become `${idPrefix}-page-N` (used by the PDF capture). */
  idPrefix?: string;
}

function sameMetrics(a: LayoutMetrics, b: LayoutMetrics): boolean {
  if (a.header !== b.header || a.tableHead !== b.tableHead || a.closing !== b.closing || a.hsn !== b.hsn) return false;
  const ka = Object.keys(a.rows);
  return ka.length === Object.keys(b.rows).length && ka.every((k) => a.rows[k] === b.rows[k]);
}

export default function InvoiceDocumentBase({ invoice, idPrefix = "invoice" }: Props) {
  const measurerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<LayoutMetrics>();

  /** Reads the real rendered heights from the hidden measurer (offsetHeight ignores CSS transforms). */
  const measure = useCallback(() => {
    const root = measurerRef.current;
    if (!root) return;
    const h = (sel: string) => root.querySelector<HTMLElement>(sel)?.offsetHeight ?? 0;
    const rows: Record<string, number> = {};
    root.querySelectorAll<HTMLElement>("[data-row-id]").forEach((el) => {
      rows[el.dataset.rowId as string] = el.offsetHeight;
    });
    const next: LayoutMetrics = {
      header: h('[data-block="header"]'),
      tableHead: h('[data-block="thead"]'),
      rows,
      closing: h('[data-block="closing"]'),
      hsn: h('[data-block="hsn"]'),
    };
    setMetrics((prev) => (prev && sameMetrics(prev, next) ? prev : next));
  }, []);

  // measure before the browser paints, and again once web fonts have settled
  useLayoutEffect(() => {
    measure();
  }, [invoice, measure]);

  useEffect(() => {
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (!fonts) return;
    let alive = true;
    void fonts.ready.then(() => alive && measure());
    const onDone = () => measure();
    fonts.addEventListener?.("loadingdone", onDone);
    return () => {
      alive = false;
      fonts.removeEventListener?.("loadingdone", onDone);
    };
  }, [measure]);

  const pages = useMemo(() => paginateInvoice(invoice, metrics), [invoice, metrics]);
  const all: InvoicePage = { number: 0, items: invoice.items, startIndex: 0, isFirst: false, showClosing: false, showHsn: false };

  return (
    <>
      {pages.map((page) => (
        <Sheet key={page.number} id={`${idPrefix}-page-${page.number}`}>
          {page.isFirst ? <FirstHeader invoice={invoice} /> : <ContinuedHeader invoice={invoice} />}
          {page.items.length > 0 && <ItemsTable invoice={invoice} page={page} />}
          {page.showClosing && <Closing invoice={invoice} />}
          {page.showHsn && <HsnSummary invoice={invoice} />}
          <Footer invoice={invoice} page={page.number} total={pages.length} />
        </Sheet>
      ))}

      {/* Hidden, full-width copy of every block — measured so pagination uses real heights. */}
      <div
        ref={measurerRef}
        aria-hidden
        style={{ position: "absolute", left: -99999, top: 0, width: CONTENT_WIDTH_PX, visibility: "hidden", pointerEvents: "none", fontFamily: FONT, fontSize: 11, lineHeight: 1.45 }}
      >
        <div data-block="header" style={{ display: "flow-root" }}>
          <FirstHeader invoice={invoice} />
        </div>
        <ItemsTable invoice={invoice} page={all} />
        <div data-block="closing" style={{ display: "flow-root" }}>
          <Closing invoice={invoice} />
        </div>
        <div data-block="hsn" style={{ display: "flow-root" }}>
          <HsnSummary invoice={invoice} />
        </div>
      </div>
    </>
  );
}

/* ----------------------------- layout ----------------------------- */

function Sheet({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div
      id={id}
      className="invoice-sheet"
      style={{
        position: "relative",
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        padding: `${PAGE_PADDING_TOP}px ${PAGE_PADDING_X}px ${PAGE_FOOTER_PX}px`,
        background: "#fff",
        color: C.body,
        fontFamily: FONT,
        fontSize: 11,
        lineHeight: 1.45,
        overflow: "hidden",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      {/* brand bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: C.brand }} />
      {children}
    </div>
  );
}

function FirstHeader({ invoice }: { invoice: Invoice }) {
  const { business: b, customer: c } = invoice;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, minHeight: 96 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          {b.logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logoDataUrl} alt="" style={{ height: 56, maxWidth: 120, objectFit: "contain" }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 800, color: C.brand, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              {b.businessName || "Your Business Name"}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", color: C.muted }}>TAX INVOICE</div>
          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "auto auto", columnGap: 14, rowGap: 3, justifyContent: "end", textAlign: "right" }}>
            <Meta k="Invoice No" v={invoice.invoiceNumber || "—"} strong />
            <Meta k="Invoice Date" v={formatDate(invoice.invoiceDate) || "—"} />
            {invoice.dueDate && <Meta k="Due Date" v={formatDate(invoice.dueDate)} />}
            {invoice.paymentTerms && <Meta k="Terms" v={invoice.paymentTerms} />}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
        <PartyCard
          title="Billed By"
          name={b.businessName}
          address={[b.addressLine1, b.addressLine2, `${b.city}, ${b.state}, ${b.country} - ${b.pincode}`]}
          rows={[
            ["GSTIN", b.gstin],
            ["PAN", b.pan],
            ["Email", b.email],
            ["Phone", b.phone],
            ["Website", b.website],
          ]}
        />
        <PartyCard
          title="Billed To"
          name={c.customerName}
          address={[c.addressLine1, c.addressLine2, `${c.city}, ${c.state}, ${c.country} - ${c.pincode}`]}
          rows={[
            ["GSTIN", c.gstin],
            ["PAN", c.pan],
            ["Email", c.email],
            ["Phone", c.phone],
          ]}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 2px 18px", fontSize: 11 }}>
        <span>
          <span style={{ color: C.muted }}>Country of Supply: </span>
          <strong style={{ color: C.ink }}>{invoice.countryOfSupply || "—"}</strong>
        </span>
        <span>
          <span style={{ color: C.muted }}>Place of Supply: </span>
          <strong style={{ color: C.ink }}>
            {invoice.placeOfSupply || "—"}
            {invoice.placeOfSupplyCode ? ` (${invoice.placeOfSupplyCode})` : ""}
          </strong>
        </span>
      </div>
    </div>
  );
}

function ContinuedHeader({ invoice }: { invoice: Invoice }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", height: 34, fontSize: 11 }}>
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, color: C.brand, fontSize: 13 }}>{invoice.business.businessName}</span>
      <span style={{ color: C.muted }}>
        Invoice <strong style={{ color: C.ink }}>{invoice.invoiceNumber}</strong> · continued
      </span>
    </div>
  );
}

function Meta({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <>
      <span style={{ color: C.muted }}>{k}</span>
      <span style={{ color: C.ink, fontWeight: strong ? 800 : 600 }}>{v}</span>
    </>
  );
}

function PartyCard({
  title,
  name,
  address,
  rows,
}: {
  title: string;
  name: string;
  address: (string | undefined)[];
  rows: [string, string | undefined][];
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: C.soft, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 12.5, fontWeight: 800, color: C.brand, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 3 }}>{name || "—"}</div>
      <div style={{ color: C.body }}>
        {address.filter(Boolean).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div style={{ marginTop: 6 }}>
        {rows
          .filter(([, v]) => !!v)
          .map(([k, v]) => (
            <div key={k}>
              <span style={{ color: C.muted }}>{k}: </span>
              <span style={{ color: C.ink, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ------------------------------ items ------------------------------ */

const th: CSSProperties = { padding: "9px 8px", fontWeight: 700, fontSize: 10.5, color: "#fff", whiteSpace: "nowrap" };
const td: CSSProperties = { padding: "10px 8px", verticalAlign: "top", borderBottom: `1px solid ${C.rule}` };

function ItemsTable({ invoice, page }: { invoice: Invoice; page: InvoicePage }) {
  const igst = invoice.taxMode === "IGST";
  const cur = invoice.currency;
  return (
    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}>
      <colgroup>
        <col style={{ width: 26 }} />
        <col />
        <col style={{ width: 40 }} />
        <col style={{ width: 62 }} />
        <col style={{ width: 70 }} />
        <col style={{ width: 80 }} />
        {igst ? <col style={{ width: 74 }} /> : <><col style={{ width: 62 }} /><col style={{ width: 62 }} /></>}
        <col style={{ width: 84 }} />
      </colgroup>
      <thead data-block="thead">
        <tr style={{ background: C.brand }}>
          <th style={{ ...th, textAlign: "left", borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>#</th>
          <th style={{ ...th, textAlign: "left" }}>Item</th>
          <th style={{ ...th, textAlign: "right" }}>GST</th>
          <th style={{ ...th, textAlign: "right" }}>Qty</th>
          <th style={{ ...th, textAlign: "right" }}>Rate</th>
          <th style={{ ...th, textAlign: "right" }}>Amount</th>
          {igst ? (
            <th style={{ ...th, textAlign: "right" }}>IGST</th>
          ) : (
            <>
              <th style={{ ...th, textAlign: "right" }}>CGST</th>
              <th style={{ ...th, textAlign: "right" }}>SGST</th>
            </>
          )}
          <th style={{ ...th, textAlign: "right", borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {page.items.map((item, i) => (
          <tr key={item.id} data-row-id={item.id}>
            <td style={{ ...td, color: C.muted }}>{page.startIndex + i + 1}</td>
            <td style={td}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 11.5 }}>{item.itemName || "Untitled item"}</div>
              {item.hsnSac && <div style={{ color: C.muted, fontSize: 10 }}>HSN/SAC: {item.hsnSac}</div>}
              {item.description && <div style={{ color: C.body, fontSize: 10.5, whiteSpace: "pre-line" }}>{item.description}</div>}
            </td>
            <td style={{ ...td, textAlign: "right" }}>{item.gstRate}%</td>
            <td style={{ ...td, textAlign: "right" }}>
              {item.quantity} <span style={{ color: C.muted, fontSize: 9.5 }}>{item.unit}</span>
            </td>
            <td style={{ ...td, textAlign: "right" }}>{formatAmount(item.rate, cur)}</td>
            <td style={{ ...td, textAlign: "right" }}>
              {formatAmount(item.taxableAmount, cur)}
              {item.discountAmount > 0 && <div style={{ color: C.muted, fontSize: 9.5 }}>− {formatAmount(item.discountAmount, cur)} disc.</div>}
            </td>
            {igst ? (
              <td style={{ ...td, textAlign: "right" }}>{formatAmount(item.igst, cur)}</td>
            ) : (
              <>
                <td style={{ ...td, textAlign: "right" }}>{formatAmount(item.cgst, cur)}</td>
                <td style={{ ...td, textAlign: "right" }}>{formatAmount(item.sgst, cur)}</td>
              </>
            )}
            <td style={{ ...td, textAlign: "right", fontWeight: 700, color: C.ink }}>{formatAmount(item.total, cur)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------ closing ------------------------------ */

function Closing({ invoice }: { invoice: Invoice }) {
  const igst = invoice.taxMode === "IGST";
  const cur = invoice.currency;
  const pay = invoice.paymentDetails;
  const termLines = (invoice.terms ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.muted }}>TOTAL (IN WORDS)</div>
          <div style={{ marginTop: 5, fontWeight: 700, color: C.ink, fontSize: 11.5, lineHeight: 1.5 }}>{invoice.amountInWords}</div>
        </div>

        <div style={{ width: 270, flexShrink: 0, background: C.soft, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 16px" }}>
          <TotalRow label="Taxable Amount" value={formatCurrency(invoice.taxableAmount, cur)} />
          {invoice.totalDiscount > 0 && <TotalRow label="Discount" value={`− ${formatCurrency(invoice.totalDiscount, cur)}`} />}
          {igst ? (
            <TotalRow label="IGST" value={formatCurrency(invoice.igst, cur)} />
          ) : (
            <>
              <TotalRow label="CGST" value={formatCurrency(invoice.cgst, cur)} />
              <TotalRow label="SGST" value={formatCurrency(invoice.sgst, cur)} />
            </>
          )}
          {invoice.roundOffEnabled && <TotalRow label="Round Off" value={formatCurrency(invoice.roundOff, cur)} />}
          <div style={{ height: 1, background: C.line, margin: "8px 0 10px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, color: C.brandDark, fontSize: 12 }}>Grand Total</span>
            <span
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 17,
                color: C.brand,
                paddingBottom: 2,
                borderBottom: `4px double ${C.brand}`,
              }}
            >
              {formatCurrency(invoice.grandTotal, cur)}
            </span>
          </div>
        </div>
      </div>

      {(invoice.notes || termLines.length > 0) && (
        <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
          {invoice.notes && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <SmallTitle>Notes</SmallTitle>
              <div style={{ whiteSpace: "pre-line", fontSize: 10.5 }}>{invoice.notes}</div>
            </div>
          )}
          {termLines.length > 0 && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <SmallTitle>Terms &amp; Conditions</SmallTitle>
              <div style={{ fontSize: 10.5 }}>
                {termLines.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 6 }}>
                    <span style={{ color: C.brand, fontWeight: 700 }}>{i + 1}.</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pay?.enabled && (
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 20, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SmallTitle>Payment Details</SmallTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 18, rowGap: 2, fontSize: 10.5 }}>
              {(
                [
                  ["Account Name", pay.accountHolderName],
                  ["Bank", pay.bankName],
                  ["Account No", pay.accountNumber],
                  ["IFSC", pay.ifsc],
                  ["Branch", pay.branch],
                  ["UPI", pay.upiId],
                ] as [string, string | undefined][]
              )
                .filter(([, v]) => !!v)
                .map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: C.muted }}>{k}: </span>
                    <strong style={{ color: C.ink }}>{v}</strong>
                  </div>
                ))}
            </div>
          </div>
          {pay.upiQrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pay.upiQrDataUrl} alt="UPI QR" style={{ width: 72, height: 72, objectFit: "contain" }} />
          )}
        </div>
      )}

      {invoice.signature?.enabled && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
          <div style={{ width: 190, textAlign: "center" }}>
            <div style={{ height: 58, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {invoice.signature.signatureImageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={invoice.signature.signatureImageDataUrl} alt="" style={{ maxHeight: 54, maxWidth: 170, objectFit: "contain" }} />
              )}
            </div>
            <div style={{ borderTop: `1px solid ${C.ink}`, paddingTop: 5, fontWeight: 700, color: C.ink, fontSize: 11 }}>
              {invoice.signature.authorisedSignatoryName || "Authorised Signatory"}
            </div>
            <div style={{ color: C.muted, fontSize: 9.5 }}>Authorised Signatory</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2.5px 0", fontSize: 11 }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: C.ink, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function SmallTitle({ children }: { children: ReactNode }) {
  return <div style={{ fontFamily: DISPLAY, fontSize: 11.5, fontWeight: 800, color: C.brand, marginBottom: 5 }}>{children}</div>;
}

/* ------------------------------ HSN summary ------------------------------ */

function HsnSummary({ invoice }: { invoice: Invoice }) {
  const rows = buildHsnSummary(invoice.items);
  const igst = invoice.taxMode === "IGST";
  const cur = invoice.currency;
  const h: CSSProperties = { padding: "8px 8px", fontSize: 10, fontWeight: 700, color: C.brandDark, background: C.soft, textAlign: "right", borderBottom: `1px solid ${C.line}` };
  const d: CSSProperties = { padding: "8px 8px", textAlign: "right", borderBottom: `1px solid ${C.rule}` };
  const totalTax = invoice.cgst + invoice.sgst + invoice.igst;

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 800, color: C.brand, marginBottom: 10 }}>HSN / SAC Tax Summary</div>
      <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.line}` }}>
        <thead>
          <tr>
            <th style={{ ...h, textAlign: "left" }}>HSN/SAC</th>
            <th style={h}>Taxable Value</th>
            {igst ? (
              <>
                <th style={h}>IGST Rate</th>
                <th style={h}>IGST Amount</th>
              </>
            ) : (
              <>
                <th style={h}>CGST Rate</th>
                <th style={h}>CGST Amount</th>
                <th style={h}>SGST Rate</th>
                <th style={h}>SGST Amount</th>
              </>
            )}
            <th style={h}>Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.hsnSac}-${r.cgstRate}-${r.igstRate}`}>
              <td style={{ ...d, textAlign: "left", fontWeight: 600 }}>{r.hsnSac}</td>
              <td style={d}>{formatAmount(r.taxableValue, cur)}</td>
              {igst ? (
                <>
                  <td style={d}>{r.igstRate}%</td>
                  <td style={d}>{formatAmount(r.igstAmount, cur)}</td>
                </>
              ) : (
                <>
                  <td style={d}>{r.cgstRate}%</td>
                  <td style={d}>{formatAmount(r.cgstAmount, cur)}</td>
                  <td style={d}>{r.sgstRate}%</td>
                  <td style={d}>{formatAmount(r.sgstAmount, cur)}</td>
                </>
              )}
              <td style={{ ...d, fontWeight: 700, color: C.ink }}>{formatAmount(r.totalTax, cur)}</td>
            </tr>
          ))}
          <tr style={{ background: C.soft }}>
            <td style={{ ...d, textAlign: "left", fontWeight: 800, color: C.ink }}>Total</td>
            <td style={{ ...d, fontWeight: 800, color: C.ink }}>{formatAmount(invoice.taxableAmount, cur)}</td>
            {igst ? (
              <>
                <td style={d} />
                <td style={{ ...d, fontWeight: 800, color: C.ink }}>{formatAmount(invoice.igst, cur)}</td>
              </>
            ) : (
              <>
                <td style={d} />
                <td style={{ ...d, fontWeight: 800, color: C.ink }}>{formatAmount(invoice.cgst, cur)}</td>
                <td style={d} />
                <td style={{ ...d, fontWeight: 800, color: C.ink }}>{formatAmount(invoice.sgst, cur)}</td>
              </>
            )}
            <td style={{ ...d, fontWeight: 800, color: C.ink }}>{formatAmount(totalTax, cur)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 10.5 }}>
        <span style={{ color: C.muted }}>Total Tax (in words): </span>
        <strong style={{ color: C.ink }}>{taxInWords(invoice)}</strong>
      </div>
    </div>
  );
}

function taxInWords(invoice: Invoice): string {
  return amountToWords(Math.round((invoice.cgst + invoice.sgst + invoice.igst) * 100) / 100, invoice.currency);
}

/* ------------------------------ footer ------------------------------ */

function Footer({ invoice, page, total }: { invoice: Invoice; page: number; total: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: PAGE_PADDING_X,
        right: PAGE_PADDING_X,
        bottom: 20,
        paddingTop: 8,
        borderTop: `1px solid ${C.rule}`,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 9.5,
        color: C.muted,
      }}
    >
      <span>
        {invoice.invoiceNumber} · {invoice.customer.customerName || "—"}
      </span>
      <span>
        Page {page} of {total}
      </span>
    </div>
  );
}
