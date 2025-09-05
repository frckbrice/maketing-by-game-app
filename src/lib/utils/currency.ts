/**
 * Client-safe currency formatting utilities
 */

/**
 * Format currency amount for display on client-side
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  // Handle invalid inputs
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }

  // Special handling for XAF (Central African Franc)
  if (currency === 'XAF') {
    return `${amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} FCFA`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      NGN: '₦',
      KES: 'KSh',
      GHS: '₵',
      ZAR: 'R',
      INR: '₹',
      BRL: 'R$',
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Parse currency string to number
 */
export function parseCurrencyAmount(currencyString: string): number {
  // Remove all non-numeric characters except decimal points
  const cleanString = currencyString.replace(/[^\d.]/g, '');
  const amount = parseFloat(cleanString);
  return isNaN(amount) ? 0 : amount;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    XAF: 'FCFA',
    NGN: '₦',
    KES: 'KSh',
    GHS: '₵',
    ZAR: 'R',
    INR: '₹',
    BRL: 'R$',
  };

  return symbols[currency] || currency;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string): string {
  return formatCurrency(amount, currency);
}
