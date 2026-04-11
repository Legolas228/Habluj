export const EUR_TO_CZK_RATE = 25;

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeCurrencyForLanguage = (language, fallbackCurrency = 'EUR') => {
  if (language === 'cz') return 'CZK';
  return String(fallbackCurrency || 'EUR').toUpperCase();
};

export const convertCurrencyAmount = (amount, fromCurrency = 'EUR', toCurrency = fromCurrency) => {
  const numericAmount = asNumber(amount);
  const from = String(fromCurrency || 'EUR').toUpperCase();
  const to = String(toCurrency || from).toUpperCase();

  if (from === to) return numericAmount;
  if (from === 'EUR' && to === 'CZK') return numericAmount * EUR_TO_CZK_RATE;
  if (from === 'CZK' && to === 'EUR') return numericAmount / EUR_TO_CZK_RATE;

  return numericAmount;
};
