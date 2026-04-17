/**
 * Currency Conversion Utilities
 * Converts EUR to CZK with psychological rounding
 */

// Current EUR to CZK exchange rate (approximate)
const EUR_TO_CZK_RATE = 25;

/**
 * Round to nearest ten for psychological pricing
 * @param {number} num - Number to round
 * @returns {number} Rounded number
 */
export const roundToNearestTen = (num) => Math.round(num / 10) * 10;

/**
 * Convert EUR to CZK with psychological rounding
 * @param {number} eur - Amount in EUR
 * @param {number} rate - Exchange rate (default: 25 CZK per EUR)
 * @returns {object} Object with originalCZK and roundedCZK
 */
export const convertEURtoCZK = (eur, rate = EUR_TO_CZK_RATE) => {
  const originalCZK = Math.round(eur * rate);
  const roundedCZK = roundToNearestTen(originalCZK);
  return {
    originalCZK,
    roundedCZK,
    eur
  };
};

/**
 * Format currency with symbol
 * @param {number} amount - Amount in currency
 * @param {string} currency - Currency code (EUR, CZK)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  const currencySymbols = {
    'EUR': '€',
    'CZK': 'Kč'
  };
  const symbol = currencySymbols[currency] || currency;
  return `${amount} ${symbol}`;
};
