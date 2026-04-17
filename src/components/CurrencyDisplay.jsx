import React from 'react';
import { convertEURtoCZK, formatCurrency } from '../../utils/currencyConverter';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * CurrencyDisplay Component
 * Displays price in EUR and optionally in CZK
 * Used primarily for Czech market
 * 
 * @param {number} priceEUR - Price in EUR
 * @param {boolean} showCZK - Whether to show CZK conversion (default: true for CZ language)
 * @param {string} className - Additional tailwind classes
 * @returns {JSX.Element}
 */
const CurrencyDisplay = ({ 
  priceEUR, 
  showCZK = null, // If null, auto-detect based on language
  className = '',
  variant = 'inline' // 'inline', 'block', 'highlighted'
}) => {
  const { language } = useTranslation();
  
  // Auto-detect if should show CZK based on language
  const shouldShowCZK = showCZK !== null ? showCZK : (language === 'cs' || language === 'cz');
  
  const { roundedCZK } = convertEURtoCZK(priceEUR);
  
  if (variant === 'inline') {
    return (
      <span className={className}>
        {formatCurrency(priceEUR, 'EUR')}
        {shouldShowCZK && (
          <span className="text-sm text-muted-foreground ml-1">
            (cca {formatCurrency(roundedCZK, 'CZK')})
          </span>
        )}
      </span>
    );
  }
  
  if (variant === 'block') {
    return (
      <div className={className}>
        <div className="text-lg font-semibold text-foreground">
          {formatCurrency(priceEUR, 'EUR')}
        </div>
        {shouldShowCZK && (
          <div className="text-sm text-muted-foreground">
            cca {formatCurrency(roundedCZK, 'CZK')}
          </div>
        )}
      </div>
    );
  }
  
  if (variant === 'highlighted') {
    return (
      <div className={className}>
        <div className="inline-flex items-baseline gap-1">
          <span className="text-2xl lg:text-3xl font-bold text-primary">
            {formatCurrency(priceEUR, 'EUR')}
          </span>
          {shouldShowCZK && (
            <span className="text-sm text-muted-foreground">
              / {formatCurrency(roundedCZK, 'CZK')}
            </span>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

export default CurrencyDisplay;
