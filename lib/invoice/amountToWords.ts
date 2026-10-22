const ONES = [
  "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
  "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
  "SEVENTEEN", "EIGHTEEN", "NINETEEN",
];

const TENS = [
  "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
];

/** Converts a whole number (0 - 999) into words. */
function threeDigitsToWords(num: number): string {
  let str = "";
  if (num >= 100) {
    str += ONES[Math.floor(num / 100)] + " HUNDRED ";
    num %= 100;
  }
  if (num >= 20) {
    str += TENS[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) {
    str += ONES[num] + " ";
  }
  return str.trim();
}

/**
 * Converts a whole rupee amount into words using the Indian numbering
 * system (Crore / Lakh / Thousand / Hundred).
 */
export function numberToIndianWords(num: number): string {
  if (num === 0) return "ZERO";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitsToWords(crore)} CRORE`);
  if (lakh) parts.push(`${threeDigitsToWords(lakh)} LAKH`);
  if (thousand) parts.push(`${threeDigitsToWords(thousand)} THOUSAND`);
  if (hundred) parts.push(threeDigitsToWords(hundred));

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Converts a rupee-and-paise amount into a full "amount in words" string
 * matching standard Indian invoice phrasing, e.g.
 * "EIGHT LAKH SIXTY EIGHT THOUSAND TWENTY SEVEN RUPEES ONLY"
 * "EIGHT LAKH SIXTY EIGHT THOUSAND TWENTY SIX RUPEES AND EIGHTY EIGHT PAISE ONLY"
 */
export function amountToWords(amount: number, currency: string = "INR"): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  const rupees = Math.floor(abs);
  const paise = Math.round((abs - rupees) * 100);

  const currencyLabel = currency === "INR" ? "RUPEES" : currency;
  const minorLabel = currency === "INR" ? "PAISE" : "CENTS";

  let words = numberToIndianWords(rupees) + " " + currencyLabel;

  if (paise > 0) {
    words += " AND " + numberToIndianWords(paise) + " " + minorLabel;
  }

  words += " ONLY";

  return (isNegative ? "MINUS " : "") + words;
}
