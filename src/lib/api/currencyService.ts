interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyApiResponse {
  base: string;
  date: string;
  rates: ExchangeRates;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private cache: Map<string, { rates: ExchangeRates; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly API_URL = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/`;
  private readonly FALLBACK_API_URL =
    'http://data.fixer.io/api/latest?access_key=';

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  async getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    const cacheKey = baseCurrency;
    const cached = this.cache.get(cacheKey);

    // Check cache first
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rates;
    }

    try {
      // Try primary API
      const rates = await this.fetchFromPrimaryApi(baseCurrency);
      this.cache.set(cacheKey, { rates, timestamp: Date.now() });
      return rates;
    } catch (error) {
      console.error('Primary currency API failed:', error);

      try {
        // Try fallback API
        const rates = await this.fetchFromFallbackApi(baseCurrency);
        this.cache.set(cacheKey, { rates, timestamp: Date.now() });
        return rates;
      } catch (fallbackError) {
        console.error('Fallback currency API failed:', fallbackError);

        // Return cached data if available, otherwise mock data
        if (cached) {
          console.warn('Using stale currency data');
          return cached.rates;
        }

        console.warn('Using mock currency exchange rates');
        return this.getMockExchangeRates(baseCurrency);
      }
    }
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const rate = rates[toCurrency];

      if (!rate) {
        console.error(`Exchange rate not found for ${toCurrency}`);
        return amount; // Return original amount if rate not found
      }

      return amount * rate;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return amount; // Return original amount on error
    }
  }

  private async fetchFromPrimaryApi(
    baseCurrency: string
  ): Promise<ExchangeRates> {
    const response = await fetch(`${this.API_URL}${baseCurrency}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CurrencyApiResponse = await response.json();
    return data.rates;
  }

  private async fetchFromFallbackApi(
    baseCurrency: string
  ): Promise<ExchangeRates> {
    // Note: need to get a free API key from fixer.io
    const apiKey = process.env.FIXER_API_KEY;

    if (!apiKey) {
      throw new Error('Fixer for currency API key not configured');
    }

    const response = await fetch(
      `${this.FALLBACK_API_URL}${apiKey}&base=${baseCurrency}&symbols=USD,XAF,EUR`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CurrencyApiResponse = await response.json();
    return data.rates;
  }

  private getMockExchangeRates(baseCurrency: string): ExchangeRates {
    // Mock exchange rates for development/fallback
    const mockRates: Record<string, ExchangeRates> = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45,
        INR: 74.5,
        BRL: 5.2,
        ZAR: 14.8,
        NGN: 411.0,
        KES: 108.5,
        GHS: 6.1,
        XAF: 585.9, // Central African Franc (Cameroon)
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        JPY: 129.5,
        CAD: 1.47,
        AUD: 1.59,
        CHF: 1.08,
        CNY: 7.6,
        INR: 87.8,
        BRL: 6.12,
        ZAR: 17.4,
        NGN: 484.0,
        KES: 127.8,
        GHS: 7.18,
        XAF: 690.0, // Central African Franc (Cameroon)
      },
    };

    return mockRates[baseCurrency] || mockRates.USD;
  }

  getSupportedCurrencies(): string[] {
    return [
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CAD',
      'AUD',
      'CHF',
      'CNY',
      'INR',
      'BRL',
      'ZAR',
      'NGN',
      'KES',
      'GHS',
      'XAF', // Central African Franc
    ];
  }

  formatCurrency(
    amount: number,
    currency: string,
    locale: string = 'en-US'
  ): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback formatting if Intl fails
      const symbol = this.getCurrencySymbol(currency);
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      INR: '₹',
      BRL: 'R$',
      ZAR: 'R',
      NGN: '₦',
      KES: 'KSh',
      GHS: '₵',
      XAF: 'FCFA', // Central African Franc
    };

    return symbols[currency] || currency;
  }
}

export const currencyService = CurrencyService.getInstance();
