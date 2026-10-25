"use client";

import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
          {/* <Footer invoice={invoice} page={page.number} total={pages.length} /> */}
        </Sheet>
      ))}

      {/* Hidden, full-width copy of every block — measured so pagination uses real heights. */}
      <div
        ref={measurerRef}
        aria-hidden
        className="absolute -left-[99999px] top-0 invisible pointer-events-none text-[11px] leading-[1.45]"
        style={{ width: CONTENT_WIDTH_PX, fontFamily: FONT }}
      >
        <div data-block="header" className="flow-root">
          <FirstHeader invoice={invoice} />
        </div>
        <ItemsTable invoice={invoice} page={all} />
        <div data-block="closing" className="flow-root">
          <Closing invoice={invoice} />
        </div>
        <div data-block="hsn" className="flow-root">
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
      className="invoice-sheet relative bg-white text-[#403d52] text-[11px] leading-[1.45] overflow-hidden box-border shrink-0"
      style={{
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        padding: `${PAGE_PADDING_TOP}px ${PAGE_PADDING_X}px ${PAGE_FOOTER_PX}px`,
        fontFamily: FONT,
      }}
    >
      {/* brand bar */}
      <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#7e22ce]" />
      {children}
    </div>
  );
}

function FirstHeader({ invoice }: { invoice: Invoice }) {
  const { business: b, customer: c } = invoice;
  return (
    <div>
      <div className="flex justify-between items-start gap-6 min-h-[96px]">
        <div className="flex items-center gap-[14px] min-w-0">
          {b.logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logoDataUrl} alt="" className="h-[56px] max-w-[120px] object-contain" />
          )}
          <div className="min-w-0">
            <div className="text-[22px] font-extrabold text-[#7e22ce] leading-[1.15] tracking-[-0.01em]" style={{ fontFamily: DISPLAY }}>
              {b.businessName || "Your Business Name"}
            </div>
          </div>
        </div>

       <div className="text-left shrink-0">
          <div className="text-[11px] font-extrabold tracking-[0.22em] text-[#7a7691]" style={{ fontFamily: DISPLAY }}>TAX INVOICE</div>
          <div className="mt-2 grid grid-cols-[auto_auto] gap-x-4 row-gap-[3px] justify-end text-left">
            <Meta k="Invoice No" v={invoice.invoiceNumber || "—"} strong />
            <Meta k="Invoice Date" v={formatDate(invoice.invoiceDate) || "—"} />
            {invoice.dueDate && <Meta k="Due Date" v={formatDate(invoice.dueDate)} />}
            {invoice.paymentTerms && <Meta k="Terms" v={invoice.paymentTerms} />}
          </div>
        </div>
      </div>

      <div className="flex gap-[14px] my-[22px]">
        <PartyCard
          title="Billed By"
          name={b.businessName}
          address={[
            b.addressLine1,
            b.addressLine2,
            [b.city, b.state, b.country].filter(Boolean).join(", "),
            b.pincode,
          ]}
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
          address={[
            c.addressLine1,
            c.addressLine2,
            [c.city, c.state, c.country].filter(Boolean).join(", "),
            c.pincode,
          ]}
          rows={[
            ["GSTIN", c.gstin],
            ["PAN", c.pan],
            ["Email", c.email],
            ["Phone", c.phone],
          ]}
        />
      </div>

      {/* <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 2px 18px", fontSize: 11 }}>
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
      </div> */}
    </div>
  );
}

function ContinuedHeader({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex justify-between items-baseline h-[34px] text-[11px]">
      <span className="font-extrabold text-[#7e22ce] text-[13px]" style={{ fontFamily: DISPLAY }}>{invoice.business.businessName}</span>
      <span className="text-[#7a7691]">
        Invoice <strong className="text-[#1e1b2e]">{invoice.invoiceNumber}</strong> · continued
      </span>
    </div>
  );
}

function Meta({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <>
      <span className="text-[#7a7691]">{k}</span>
      <span className={`text-[#1e1b2e] ${strong ? "font-extrabold" : "font-semibold"}`}>{v}</span>
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
    <div className="flex-1 min-w-0 bg-[#faf5ff] border border-[#e9d5ff] rounded-xl p-[14px_16px]">
      <div className="text-[12.5px] font-extrabold text-[#7e22ce] mb-2" style={{ fontFamily: DISPLAY }}>{title}</div>
      <div className="text-[12px] font-bold text-[#1e1b2e] mb-[3px]">{name || "—"}</div>
      <div className="text-[#403d52]">
        {address.filter(Boolean).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div className="mt-[6px]">
        {rows
          .filter(([, v]) => !!v)
          .map(([k, v]) => (
            <div key={k}>
              <span className="text-[#7a7691]">{k}: </span>
              <span className="text-[#1e1b2e] font-semibold">{v}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ------------------------------ items ------------------------------ */

const thClass = "p-[9px_8px] font-bold text-[10.5px] text-white whitespace-nowrap";
const tdClass = "p-[10px_8px] vertical-top border-b border-[#ece6f5]";

function ItemsTable({ invoice, page }: { invoice: Invoice; page: InvoicePage }) {
  const igst = invoice.taxMode === "IGST";
  const cur = invoice.currency;
  return (
    <table className="w-full border-separate border-spacing-0 table-fixed">
      <colgroup>
        <col className="w-[6%]" />
        <col className="w-[40%]" />
        <col className="w-[9%]" />
        {/* <col /> */}
        <col className="w-[11%]" />
        <col className="w-[12%]" />
        {igst ? (
          <col className="w-[12%]" />
        ) : (
          <>
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </>
        )}
        <col className="w-[14%]" />
      </colgroup>
      <thead data-block="thead">
        <tr className="bg-[#7e22ce]">
          <th className={`${thClass} text-left rounded-tl-lg rounded-bl-lg`}>Sr.No</th>
          <th className={`${thClass} text-left`}>Item</th>
          <th className={`${thClass} text-right`}>GST</th>
          {/* <th style={{ ...th, textAlign: "right" }}>Qty</th> */}
          <th className={`${thClass} text-right`}>Rate</th>
          <th className={`${thClass} text-right`}>Taxable Value</th>
          {igst ? (
            <th className={`${thClass} text-right`}>IGST</th>
          ) : (
            <>
              <th className={`${thClass} text-right`}>CGST</th>
              <th className={`${thClass} text-right`}>SGST</th>
            </>
          )}
          <th className={`${thClass} text-right rounded-tr-lg rounded-br-lg`}>Total</th>
        </tr>
      </thead>
      <tbody>
        {page.items.map((item, i) => (
          <tr key={item.id} data-row-id={item.id}>
            <td className={`${tdClass} text-[#7a7691]`}>{page.startIndex + i + 1}</td>
            <td className={tdClass}>
              <div className="font-bold text-[#1e1b2e] text-[11.5px]">{item.itemName || "Untitled item"}</div>
              {item.hsnSac && <div className="text-[#7a7691] text-[10px]">HSN/SAC: {item.hsnSac}</div>}
              {item.description && <div className="text-[#403d52] text-[10.5px] whitespace-pre-line">{item.description}</div>}
            </td>
            <td className={`${tdClass} text-right`}>{item.gstRate}%</td>
            {/* <td style={{ ...td, textAlign: "right" }}>
              {item.quantity} <span style={{ color: C.muted, fontSize: 9.5 }}>{item.unit}</span>
            </td> */}
            <td className={`${tdClass} text-right`}>{formatAmount(item.rate, cur)}</td>
            <td className={`${tdClass} text-right`}>
              {formatAmount(item.taxableAmount, cur)}
              {/* {item.discountAmount > 0 && <div style={{ color: C.muted, fontSize: 9.5 }}>− {formatAmount(item.discountAmount, cur)} disc.</div>} */}
            </td>
            {igst ? (
              <td className={`${tdClass} text-right`}>{formatAmount(item.igst, cur)}</td>
            ) : (
              <>
                <td className={`${tdClass} text-right`}>{formatAmount(item.cgst, cur)}</td>
                <td className={`${tdClass} text-right`}>{formatAmount(item.sgst, cur)}</td>
              </>
            )}
            <td className={`${tdClass} text-right font-bold text-[#1e1b2e]`}>{formatAmount(item.total, cur)}</td>
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
    <div className="mt-6">
      <div className="flex gap-[22px] items-start">
        <div className="flex-1 min-w-0 pt-1">
          <div className="text-[10px] font-bold tracking-[0.12em] text-[#7a7691]">TOTAL (IN WORDS)</div>
          <div className="mt-[5px] font-bold text-[#1e1b2e] text-[11.5px] leading-[1.5]">{invoice.amountInWords}</div>
        </div>

        <div className="w-[270px] shrink-0 bg-[#faf5ff] border border-[#e9d5ff] rounded-xl p-[12px_16px]">
          <TotalRow label="Sub Total Amount" value={formatCurrency(invoice.subtotal, cur)} />
          <TotalRow label="Taxable Value" value={formatCurrency(invoice.taxableAmount, cur)} />
          {invoice.totalDiscount > 0 && <TotalRow label="Discount" value={`− ${formatCurrency(invoice.totalDiscount, cur)}`} />}
          {igst ? (
            <TotalRow label="IGST" value={formatCurrency(invoice.igst, cur)} />
          ) : (
            <>
              <TotalRow label="CGST" value={formatCurrency(invoice.cgst, cur)} />
              <TotalRow label="SGST" value={formatCurrency(invoice.sgst, cur)} />
            </>
          )}
          {/* {invoice.roundOffEnabled && <TotalRow label="Round Off" value={formatCurrency(invoice.roundOff, cur)} />} */}
          <div className="h-[1px] bg-[#e9d5ff] my-[8px_10px]" />
          <div className="flex justify-between items-baseline">
            <span className="font-extrabold text-[#581c87] text-[12px]" style={{ fontFamily: DISPLAY }}>Total Amount</span>
            <span
              className="font-extrabold text-[17px] text-[#7e22ce] pb-[2px] border-b-[4px] border-double border-[#7e22ce]"
              style={{ fontFamily: DISPLAY }}
            >
              {formatCurrency(invoice.grandTotal, cur)}
            </span>
          </div>
        </div>
      </div>

      {(invoice.notes || termLines.length > 0) && (
        <div className="flex gap-6 mt-[20px]">
          {/* {invoice.notes && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <SmallTitle>Notes</SmallTitle>
              <div style={{ whiteSpace: "pre-line", fontSize: 10.5 }}>{invoice.notes}</div>
            </div>
          )} */}
          {termLines.length > 0 && (
            <div className="flex-1 min-w-0">
              <SmallTitle>Terms &amp; Conditions</SmallTitle>
              <div className="text-[10.5px]">
                {termLines.map((l, i) => (
                  <div key={i} className="flex gap-[6px]">
                    <span className="text-[#7e22ce] font-extrabold">{i + 1}.</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pay?.enabled && (
        <div className="flex gap-[18px] items-center mt-[20px] border border-[#e9d5ff] rounded-xl p-[12px_16px]">
          <div className="flex-1 min-w-0">
            <SmallTitle>Payment Details</SmallTitle>
            <div className="grid grid-cols-2 col-gap-[18px] row-gap-[2px] text-[10.5px]">
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
                    <span className="text-[#7a7691]">{k}: </span>
                    <strong className="text-[#1e1b2e]">{v}</strong>
                  </div>
                ))}
            </div>
          </div>
          {pay.upiQrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pay.upiQrDataUrl} alt="UPI QR" className="w-[72px] h-[72px] object-contain" />
          )}
        </div>
      )}

      {invoice.signature?.enabled && (
        <div className="flex justify-end mt-[26px]">
          <div className="w-[190px] text-center">
            <div className="h-[58px] flex items-end justify-center">
              {invoice.signature.signatureImageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={invoice.signature.signatureImageDataUrl} alt="" className="max-h-[54px] max-w-[170px] object-contain" />
              )}
            </div>
            <div className="border-t border-[#1e1b2e] pt-[5px] font-bold text-[#1e1b2e] text-[11px]">
              {invoice.signature.authorisedSignatoryName || "Authorised Signatory"}
            </div>
            <div className="text-[#7a7691] text-[9.5px]">Authorised Signatory</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-[2.5px_0] text-[11px]">
      <span className="text-[#7a7691]">{label}</span>
      <span className="text-[#1e1b2e] font-semibold">{value}</span>
    </div>
  );
}

function SmallTitle({ children }: { children: ReactNode }) {
  return <div className="text-[11.5px] font-extrabold text-[#7e22ce] mb-[5px]" style={{ fontFamily: DISPLAY }}>{children}</div>;
}

/* ------------------------------ HSN summary ------------------------------ */

function HsnSummary({ invoice }: { invoice: Invoice }) {
  const rows = buildHsnSummary(invoice.items);
  const igst = invoice.taxMode === "IGST";
  const cur = invoice.currency;
  const hClass = "p-[8px_8px] text-[10px] font-bold text-[#581c87] bg-[#faf5ff] text-right border-b border-[#e9d5ff]";
  const dClass = "p-[8px_8px] text-right border-b border-[#ece6f5]";
  const totalTax = invoice.cgst + invoice.sgst + invoice.igst;

  return (
    <div className="mt-[28px]">
      <div className="text-[13px] font-black text-[#7e22ce] mb-[10px]" style={{ fontFamily: DISPLAY }}>Tax Summary</div>
      <table className="w-full border-collapse border border-[#e9d5ff]">
        <thead>
          <tr>
            <th className={`${hClass} text-left`}>HSN/SAC</th>
            <th className={hClass}>Taxable Value</th>
            {igst ? (
              <>
                <th className={hClass}>IGST Rate</th>
                <th className={hClass}>IGST Amount</th>
              </>
            ) : (
              <>
                <th className={hClass}>CGST Rate</th>
                <th className={hClass}>CGST Amount</th>
                <th className={hClass}>SGST Rate</th>
                <th className={hClass}>SGST Amount</th>
              </>
            )}
            <th className={hClass}>Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.hsnSac}-${r.cgstRate}-${r.igstRate}`}>
              <td className={`${dClass} text-left font-semibold`}>{r.hsnSac}</td>
              <td className={dClass}>{formatAmount(r.taxableValue, cur)}</td>
              {igst ? (
                <>
                  <td className={dClass}>{r.igstRate}%</td>
                  <td className={dClass}>{formatAmount(r.igstAmount, cur)}</td>
                </>
              ) : (
                <>
                  <td className={dClass}>{r.cgstRate}%</td>
                  <td className={dClass}>{formatAmount(r.cgstAmount, cur)}</td>
                  <td className={dClass}>{r.sgstRate}%</td>
                  <td className={dClass}>{formatAmount(r.sgstAmount, cur)}</td>
                </>
              )}
              <td className={`${dClass} font-bold text-[#1e1b2e]`}>{formatAmount(r.totalTax, cur)}</td>
            </tr>
          ))}
          <tr className="bg-[#faf5ff]">
            <td className={`${dClass} text-left font-extrabold text-[#1e1b2e]`}>Total</td>
            <td className={`${dClass} font-extrabold text-[#1e1b2e]`}>{formatAmount(invoice.taxableAmount, cur)}</td>
            {igst ? (
              <>
                <td className={dClass} />
                <td className={`${dClass} font-extrabold text-[#1e1b2e]`}>{formatAmount(invoice.igst, cur)}</td>
              </>
            ) : (
              <>
                <td className={dClass} />
                <td className={`${dClass} font-extrabold text-[#1e1b2e]`}>{formatAmount(invoice.cgst, cur)}</td>
                <td className={dClass} />
                <td className={`${dClass} font-extrabold text-[#1e1b2e]`}>{formatAmount(invoice.sgst, cur)}</td>
              </>
            )}
            <td className={`${dClass} font-extrabold text-[#1e1b2e]`}>{formatAmount(totalTax, cur)}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-[10px] text-[10.5px]">
        <span className="text-[#7a7691]">Total Tax (in words): </span>
        <strong className="text-[#1e1b2e]">{taxInWords(invoice)}</strong>
      </div>
    </div>
  );
}

function taxInWords(invoice: Invoice): string {
  return amountToWords(Math.round((invoice.cgst + invoice.sgst + invoice.igst) * 100) / 100, invoice.currency);
}

/* ------------------------------ footer ------------------------------ */

// function Footer({ invoice, page, total }: { invoice: Invoice; page: number; total: number }) {
//   return (
//     <div
//       style={{
//         position: "absolute",
//         left: PAGE_PADDING_X,
//         right: PAGE_PADDING_X,
//         bottom: 20,
//         paddingTop: 8,
//         borderTop: `1px solid ${C.rule}`,
//         display: "flex",
//         justifyContent: "space-between",
//         fontSize: 9.5,
//         color: C.muted,
//       }}
//     >
//       <span>
//         {invoice.invoiceNumber} · {invoice.customer.customerName || "—"}
//       </span>
//       <span>
//         Page {page} of {total}
//       </span>
//     </div>
//   );
// }