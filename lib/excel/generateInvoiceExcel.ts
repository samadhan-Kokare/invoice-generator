import * as XLSX from "xlsx";
import { Invoice } from "@/types/invoice";
import { buildHsnSummary } from "../invoice/calculations";

export function generateInvoiceExcel(invoice: Invoice): void {
  try {
    const workbook = XLSX.utils.book_new();

    // ---- Sheet 1: Invoice Summary ----
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        "Invoice Number": invoice.invoiceNumber,
        "Invoice Date": invoice.invoiceDate,
        "Due Date": invoice.dueDate || "",
        "Business Name": invoice.business.businessName,
        "Customer Name": invoice.customer.customerName,
        Subtotal: invoice.subtotal,
        Discount: invoice.totalDiscount,
        "Taxable Amount": invoice.taxableAmount,
        CGST: invoice.cgst,
        SGST: invoice.sgst,
        IGST: invoice.igst,
        "Round Off": invoice.roundOff,
        "Grand Total": invoice.grandTotal,
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Invoice Summary");

    // ---- Sheet 2: Invoice Items ----
    const itemsSheet = XLSX.utils.json_to_sheet(
      invoice.items.map((item) => ({
        Item: item.itemName,
        Description: item.description || "",
        "HSN/SAC": item.hsnSac || "",
        Quantity: item.quantity,
        Unit: item.unit,
        Rate: item.rate,
        Discount: item.discountAmount,
        "GST Rate (%)": item.gstRate,
        "Taxable Amount": item.taxableAmount,
        CGST: item.cgst,
        SGST: item.sgst,
        IGST: item.igst,
        Total: item.total,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Invoice Items");

    // ---- Sheet 3: Tax Summary ----
    const hsnRows = buildHsnSummary(invoice.items);
    const taxSheet = XLSX.utils.json_to_sheet(
      hsnRows.map((row) => ({
        "HSN/SAC": row.hsnSac,
        "Taxable Value": row.taxableValue,
        "GST Rate (%)": row.cgstRate * 2 || row.igstRate,
        CGST: row.cgstAmount,
        SGST: row.sgstAmount,
        IGST: row.igstAmount,
        "Total Tax": row.totalTax,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, taxSheet, "Tax Summary");

    XLSX.writeFile(workbook, `${invoice.invoiceNumber || "invoice"}.xlsx`);
  } catch (err) {
    console.error("Excel generation failed:", err);
    throw new Error("We couldn't generate the Excel file. Please try again.");
  }
}
