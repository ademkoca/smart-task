import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrency, setCurrency as saveCurrency, Currency } from '../db/settings';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amount: number | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'RSD',
  setCurrency: () => {},
  formatPrice: (amount) => amount != null ? `${Math.round(amount)} RSD` : '',
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('RSD');

  useEffect(() => {
    getCurrency().then(setCurrencyState);
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    saveCurrency(c);
  }

  function formatPrice(amount: number | null | undefined): string {
    if (amount == null) return '';
    if (currency === 'RSD') return `${amount.toLocaleString('sr-RS', { maximumFractionDigits: 0 })} RSD`;
    return `€${amount.toFixed(2)}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
