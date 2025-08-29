/**
 * Currency Service - Optimized for Mobile Performance
 * 
 * Features:
 * - Dual API support: ExchangeRate-API (primary) + Fixer.io (fallback)
 * - Smart caching with memory limits and automatic cleanup
 * - Request deduplication to prevent duplicate API calls
 * - 10-second timeout protection for better UX
 * - Offline fallback with mock exchange rates
 * - Performance monitoring and health checks
 * - Mobile-optimized with minimal memory footprint
 * 
 * Environment Variables Required:
 * - EXCHANGE_RATE_API_KEY: Primary API key from exchangerate-api.com
 * - FIXER_API_KEY: Fallback API key from fixer.io
 */

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyApiResponse {
  base: string;
  date: string;
  rates: ExchangeRates;
  // Fixer.io specific fields
  success?: boolean;
  error?: {
    code: number;
    info: string;
  };
  // ExchangeRate-API specific fields
  result?: string;
  'error-type'?: string;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private cache: Map<string, { rates: ExchangeRates; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly MAX_CACHE_SIZE = 10; // Limit cache size for memory optimization
  private pendingRequests: Map<string, Promise<ExchangeRates>> = new Map(); // Prevent duplicate requests
  private readonly API_URL = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/`;
  private readonly FALLBACK_API_URL =
    'https://api.fixer.io/latest?access_key=';

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

    // Check if there's already a pending request for this currency
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create a new request
    const requestPromise = this.fetchExchangeRates(baseCurrency, cached);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const rates = await requestPromise;
      
      // Cache the result
      this.setCacheWithLimit(cacheKey, rates);
      
      return rates;
    } finally {
      // Always clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchExchangeRates(
    baseCurrency: string, 
    cached?: { rates: ExchangeRates; timestamp: number }
  ): Promise<ExchangeRates> {
    try {
      // Try primary API
      const rates = await this.fetchFromPrimaryApi(baseCurrency);
      return rates;
    } catch (error) {
      console.error('Primary currency API failed:', error);

      try {
        // Try fallback API
        const rates = await this.fetchFromFallbackApi(baseCurrency);
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

  private setCacheWithLimit(cacheKey: string, rates: ExchangeRates): void {
    // If cache is at limit, remove oldest entry
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, { rates, timestamp: Date.now() });
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Round amount to avoid floating point precision issues in caching
    const roundedAmount = Math.round(amount * 100) / 100;
    const conversionKey = `${roundedAmount}:${fromCurrency}:${toCurrency}`;
    
    // Check conversion cache (short-term cache for common conversions)
    const cached = this.cache.get(conversionKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minute cache for conversions
      return cached.rates.converted as unknown as number;
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const rate = rates[toCurrency];

      if (!rate) {
        console.error(`Exchange rate not found for ${toCurrency}`);
        return amount; // Return original amount if rate not found
      }

      const converted = Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
      
      // Cache the conversion result
      this.setCacheWithLimit(conversionKey, { converted } as any);
      
      return converted;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return amount; // Return original amount on error
    }
  }

  private async fetchFromPrimaryApi(
    baseCurrency: string
  ): Promise<ExchangeRates> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${this.API_URL}${baseCurrency}`, {
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`ExchangeRate-API error! status: ${response.status}`);
      }

      const data: CurrencyApiResponse = await response.json();
      
      // Handle ExchangeRate-API response structure
      if (data.result === 'error') {
        throw new Error(`ExchangeRate-API error: ${data['error-type'] || 'Unknown error'}`);
      }

      return data.rates;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchFromFallbackApi(
    baseCurrency: string
  ): Promise<ExchangeRates> {
    // Note: need to get a free API key from fixer.io
    const apiKey = process.env.FIXER_API_KEY;

    if (!apiKey) {
      throw new Error('Fixer API key not configured - using mock rates');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(
        `${this.FALLBACK_API_URL}${apiKey}&base=${baseCurrency}&symbols=USD,XAF,EUR,GBP,JPY,CAD,AUD,CHF,CNY,INR,BRL,ZAR,NGN,KES,GHS`,
        {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Fixer API error! status: ${response.status}`);
      }

      const data: CurrencyApiResponse = await response.json();
      
      // Handle Fixer.io response structure
      if (data.success === false) {
        throw new Error(`Fixer API error: ${data.error?.info || 'Unknown error'}`);
      }

      return data.rates;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
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

  // Utility methods for performance monitoring and cache management
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  getCacheStats(): { size: number; maxSize: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      keys: Array.from(this.cache.keys())
    };
  }

  // Check if APIs are available (for offline detection)
  async checkAPIHealth(): Promise<{primary: boolean; fallback: boolean}> {
    const results = { primary: false, fallback: false };
    
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000); // Quick health check
      
      await fetch(`${this.API_URL}USD`, {
        method: 'HEAD',
        signal: controller.signal
      });
      results.primary = true;
    } catch (error) {
      // Primary API not available
    }

    try {
      if (process.env.FIXER_API_KEY) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        
        await fetch(`${this.FALLBACK_API_URL}${process.env.FIXER_API_KEY}`, {
          method: 'HEAD',
          signal: controller.signal
        });
        results.fallback = true;
      }
    } catch (error) {
      // Fallback API not available
    }

    return results;
  }
}

export const currencyService = CurrencyService.getInstance();
