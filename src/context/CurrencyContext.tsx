import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteConfig } from '@/config/site.config';

export type CurrencyCode = 'NPR' | 'USD' | 'EUR' | 'GBP' | 'INR';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Rate relative to NPR (1 NPR = X of this currency)
}

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NPR: { code: 'NPR', symbol: 'Rs.', name: 'Nepali Rupee', rate: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0074 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.0068 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0058 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 0.625 },
};

const STORAGE_KEY = `${siteConfig.storeSlug}_currency`;

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInNPR: number) => string;
  currencies: typeof CURRENCIES;
  isBaseCurrency: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

function detectCurrency(): CurrencyCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in CURRENCIES) return saved as CurrencyCode;
  } catch {}

  // Auto-detect from browser locale
  try {
    const locale = navigator.language || '';
    if (locale.startsWith('en-US')) return 'USD';
    if (locale.startsWith('en-GB')) return 'GBP';
    if (locale.startsWith('hi') || locale.startsWith('en-IN')) return 'INR';
    if (/^(de|fr|es|it|nl|pt)/.test(locale)) return 'EUR';
  } catch {}

  return 'NPR';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(detectCurrency);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  };

  const formatPrice = (priceInNPR: number): string => {
    const info = CURRENCIES[currency];
    const converted = priceInNPR * info.rate;

    if (currency === 'NPR') {
      return `Rs. ${priceInNPR.toLocaleString()}`;
    }

    return `${info.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatPrice,
      currencies: CURRENCIES,
      isBaseCurrency: currency === 'NPR',
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
