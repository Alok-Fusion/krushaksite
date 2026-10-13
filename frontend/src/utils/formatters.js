/**
 * Localized formatting helpers using the ECMAScript Internationalization API (Intl).
 * Maps Krushak language codes (en, hi, mr) to Indian locales (en-IN, hi-IN, mr-IN).
 */

const LOCALE_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

export const getLocale = (lang) => {
  const code = (lang || "en").split("-")[0].toLowerCase();
  return LOCALE_MAP[code] || "en-IN";
};

/**
 * Format currency in Indian Rupees (₹) according to local conventions.
 */
export const formatCurrency = (amount, lang = "en") => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "₹0";
  }
  const locale = getLocale(lang);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch (err) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }
};

/**
 * Format general numbers with Indian digit grouping (e.g. 1,00,000).
 */
export const formatNumber = (value, lang = "en", options = {}) => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "0";
  }
  const locale = getLocale(lang);
  try {
    return new Intl.NumberFormat(locale, options).format(Number(value));
  } catch (err) {
    return String(value);
  }
};

/**
 * Format dates according to locale (e.g. 14 ऑक्टोबर 2026, 14 अक्तूबर 2026).
 */
export const formatDate = (dateInput, lang = "en", options = {}) => {
  if (!dateInput) return "";
  const dateObj = typeof dateInput === "string" || typeof dateInput === "number"
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(dateObj.getTime())) return String(dateInput);

  const locale = getLocale(lang);
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (err) {
    return dateObj.toLocaleDateString();
  }
};
