import { CURRENCIES } from "@/constants/invoice";

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

/** Formats a number using the Indian digit-grouping system (e.g. 8,68,027.00) */
export function formatIndianNumber(value: number, decimals: number = 2): string {
  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals);
  // never print "-0.00"
  const isNegative = value < 0 && Number(fixed) !== 0;
  const [intPart, decPart] = fixed.split(".");

  let lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedInt =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  const result = decimals > 0 ? `${formattedInt}.${decPart}` : formattedInt;
  return (isNegative ? "-" : "") + result;
}

export function formatCurrency(value: number, currencyCode: string = "INR", decimals: number = 2): string {
  const symbol = getCurrencySymbol(currencyCode);
  // sign goes in front of the symbol: -₹0.24, not ₹-0.24
  const sign = value < 0 && Number(Math.abs(value).toFixed(decimals)) !== 0 ? "-" : "";
  return `${sign}${symbol}${formatAmount(Math.abs(value), currencyCode, decimals)}`;
}

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Amount without a currency symbol, for dense table cells. */
export function formatAmount(value: number, currencyCode: string = "INR", decimals: number = 2): string {
  if (currencyCode === "INR") return formatIndianNumber(value, decimals);
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
