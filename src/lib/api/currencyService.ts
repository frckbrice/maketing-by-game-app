/**
 * Professional Currency Service
 *
 * Features:
 * - ExchangeRate-API.com integration (primary)
 * - Fixer.io integration (fallback)
 * - Server-side optimized for production
 * - No mock data - real API calls only
 * - Environment agnostic (server/client detection)
 * - Smart caching with TTL
 * - Request deduplication
 * - Timeout protection
 * - Error handling and fallback strategies
 */

import { EXCHANGE_RATE_API_KEY, FIXER_API_KEY } from '@/lib/constants';

interface ExchangeRates {
  [currency: string]: number;
}

interface ExchangeRateApiResponse {
  result: 'success' | 'error';
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: ExchangeRates;
  error_type?: string;
}

interface PairConversionResponse {
  result: 'success' | 'error';
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  error_type?: string;
}

interface FixerApiResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: ExchangeRates;
  error?: {
    code: number;
    info: string;
    type: string;
  };
}

interface ConversionResult {
  success: boolean;
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  timestamp: string;
  source: 'exchangerate-api' | 'fixer' | 'cache';
}

export class CurrencyService {
  private static instance: CurrencyService;
  private cache: Map<
    string,
    { rates: ExchangeRates; timestamp: number; source: string }
  > = new Map();
  private pendingRequests: Map<string, Promise<ExchangeRates>> = new Map();

  // Configuration
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds
  private readonly MAX_CACHE_SIZE = 50;

  // API URLs according to documentation
  private readonly EXCHANGE_RATE_API_BASE =
    'https://v6.exchangerate-api.com/v6';
  private readonly FIXER_API_BASE = 'https://api.fixer.io';

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private constructor() {
    // Only validate API keys on server side
    if (typeof window === 'undefined') {
      if (!EXCHANGE_RATE_API_KEY && !FIXER_API_KEY) {
        console.error(
          'Currency Service: No API keys configured. Service will fail.'
        );
      }
    }
  }

  /**
   * Get exchange rates for a base currency
   */
  async getExchangeRates(baseCurrency: string = 'XAF'): Promise<ExchangeRates> {
    const cacheKey = `rates:${baseCurrency}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rates;
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = this.fetchExchangeRates(baseCurrency);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const rates = await requestPromise;
      this.setCacheWithLimit(cacheKey, rates, 'exchangerate-api');
      return rates;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Convert currency amounts using efficient pair conversion
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConversionResult> {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (fromCurrency === toCurrency) {
      return {
        success: true,
        originalAmount: amount,
        convertedAmount: amount,
        fromCurrency,
        toCurrency,
        exchangeRate: 1,
        timestamp: new Date().toISOString(),
        source: 'cache',
      };
    }

    // Check cache first
    const cacheKey = `pair:${fromCurrency}:${toCurrency}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      const rate = cached.rates.rate as number;
      const convertedAmount = Math.round(amount * rate * 100) / 100;

      return {
        success: true,
        originalAmount: amount,
        convertedAmount,
        fromCurrency,
        toCurrency,
        exchangeRate: rate,
        timestamp: new Date().toISOString(),
        source: 'cache',
      };
    }

    try {
      // Use pair conversion endpoint for direct conversion
      const rate = await this.getPairConversionRate(fromCurrency, toCurrency);
      const convertedAmount = Math.round(amount * rate * 100) / 100;

      // Cache the rate
      this.setCacheWithLimit(cacheKey, { rate }, 'exchangerate-api');

      return {
        success: true,
        originalAmount: amount,
        convertedAmount,
        fromCurrency,
        toCurrency,
        exchangeRate: rate,
        timestamp: new Date().toISOString(),
        source: 'exchangerate-api',
      };
    } catch (error) {
      throw new Error(
        `Currency conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get pair conversion rate using ExchangeRate-API pair endpoint
   */
  private async getPairConversionRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const isServer = typeof window === 'undefined';

    if (!isServer) {
      throw new Error(
        'Currency service should only be used on the server side for security'
      );
    }

    let lastError: Error | null = null;

    // Try ExchangeRate-API pair endpoint first
    if (EXCHANGE_RATE_API_KEY) {
      try {
        const rate = await this.fetchPairConversionRate(
          fromCurrency,
          toCurrency
        );
        return rate;
      } catch (error) {
        console.error('ExchangeRate-API pair conversion failed:', error);
        lastError =
          error instanceof Error ? error : new Error('ExchangeRate-API failed');
      }
    }

    // Fallback to full rates and extract the specific rate
    try {
      const rates = await this.fetchExchangeRates(fromCurrency);
      const rate = rates[toCurrency];

      if (!rate || rate <= 0) {
        throw new Error(
          `Exchange rate not available for ${fromCurrency} to ${toCurrency}`
        );
      }

      return rate;
    } catch (error) {
      throw new Error(
        `All currency APIs failed. Last error: ${lastError?.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Fetch pair conversion rate from ExchangeRate-API
   */
  private async fetchPairConversionRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (!EXCHANGE_RATE_API_KEY) {
      throw new Error('ExchangeRate-API key not configured');
    }

    console.log('EXCHANGE_RATE_API_KEY', EXCHANGE_RATE_API_KEY);

    const url = `${this.EXCHANGE_RATE_API_BASE}/${EXCHANGE_RATE_API_KEY}/pair/${fromCurrency}/${toCurrency}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BlackFriday-Marketing-App/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `ExchangeRate-API Pair HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: PairConversionResponse = await response.json();

      if (data.result !== 'success') {
        throw new Error(
          `ExchangeRate-API Pair error: ${data.error_type || 'Unknown error'}`
        );
      }

      if (!data.conversion_rate || data.conversion_rate <= 0) {
        throw new Error('Invalid conversion rate from ExchangeRate-API');
      }

      return data.conversion_rate;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('ExchangeRate-API Pair request timeout');
      }
      throw error;
    }
  }

  /**
   * Fetch exchange rates from APIs
   */
  private async fetchExchangeRates(
    baseCurrency: string
  ): Promise<ExchangeRates> {
    // Environment detection
    const isServer = typeof window === 'undefined';

    if (!isServer) {
      throw new Error(
        'Currency service should only be used on the server side for security'
      );
    }

    let lastError: Error | null = null;

    // Try ExchangeRate-API first (primary)
    if (EXCHANGE_RATE_API_KEY) {
      try {
        const rates = await this.fetchFromExchangeRateApi(baseCurrency);
        return rates;
      } catch (error) {
        console.error('ExchangeRate-API failed:', error);
        lastError =
          error instanceof Error ? error : new Error('ExchangeRate-API failed');
      }
    }

    // Try Fixer.io as fallback
    if (FIXER_API_KEY) {
      try {
        const rates = await this.fetchFromFixerApi(baseCurrency);
        return rates;
      } catch (error) {
        console.error('Fixer API failed:', error);
        lastError =
          error instanceof Error ? error : new Error('Fixer API failed');
      }
    }

    // If both APIs fail, throw the last error
    throw new Error(
      `All currency APIs failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Fetch from ExchangeRate-API.com
   * Documentation: https://www.exchangerate-api.com/docs/standard-requests
   */
  private async fetchFromExchangeRateApi(
    baseCurrency: string
  ): Promise<ExchangeRates> {
    if (!EXCHANGE_RATE_API_KEY) {
      throw new Error('ExchangeRate-API key not configured');
    }

    const url = `${this.EXCHANGE_RATE_API_BASE}/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BlackFriday-Marketing-App/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `ExchangeRate-API HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: ExchangeRateApiResponse = await response.json();

      if (data.result !== 'success') {
        throw new Error(
          `ExchangeRate-API error: ${data.error_type || 'Unknown error'}`
        );
      }

      if (!data.conversion_rates || typeof data.conversion_rates !== 'object') {
        throw new Error('Invalid response format from ExchangeRate-API');
      }

      return data.conversion_rates;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('ExchangeRate-API request timeout');
      }
      throw error;
    }
  }

  /**
   * Fetch from Fixer.io
   * Documentation: https://fixer.io/documentation
   */
  private async fetchFromFixerApi(
    baseCurrency: string
  ): Promise<ExchangeRates> {
    if (!FIXER_API_KEY) {
      throw new Error('Fixer API key not configured');
    }

    // Get supported currencies for Fixer API
    const symbols = this.getSupportedCurrencies().join(',');
    const url = `${this.FIXER_API_BASE}/latest?access_key=${FIXER_API_KEY}&base=${baseCurrency}&symbols=${symbols}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BlackFriday-Marketing-App/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Fixer API HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: FixerApiResponse = await response.json();

      if (!data.success) {
        const errorMsg =
          data.error?.info || data.error?.type || 'Unknown error';
        throw new Error(`Fixer API error: ${errorMsg}`);
      }

      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid response format from Fixer API');
      }

      return data.rates;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Fixer API request timeout');
      }
      throw error;
    }
  }

  /**
   * Cache management with size limit
   */
  private setCacheWithLimit(
    cacheKey: string,
    rates: ExchangeRates,
    source: string
  ): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, {
      rates,
      timestamp: Date.now(),
      source,
    });
  }

  /**
   * Get supported currencies
   */
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
      'XAF', // Central African Franc (Cameroon)
      'NGN', // Nigerian Naira
      'KES', // Kenyan Shilling
      'GHS', // Ghanaian Cedi
      'ZAR', // South African Rand
      'INR', // Indian Rupee
      'BRL', // Brazilian Real
    ];
  }

  /**
   * Get default currency for Cameroon
   */
  getDefaultCurrency(): string {
    return 'XAF';
  }

  /**
   * Format currency amount
   */
  formatCurrency(
    amount: number,
    currency: string,
    locale: string = 'en-US'
  ): string {
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
   * Health check for APIs
   */
  async checkApiHealth(): Promise<{
    exchangeRateApi: boolean;
    fixerApi: boolean;
  }> {
    const results = { exchangeRateApi: false, fixerApi: false };

    // Quick health check for ExchangeRate-API
    if (EXCHANGE_RATE_API_KEY) {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `${this.EXCHANGE_RATE_API_BASE}/${EXCHANGE_RATE_API_KEY}/latest/USD`,
          {
            method: 'HEAD',
            signal: controller.signal,
          }
        );

        results.exchangeRateApi = response.ok;
      } catch {
        results.exchangeRateApi = false;
      }
    }

    // Quick health check for Fixer API
    if (FIXER_API_KEY) {
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `${this.FIXER_API_BASE}/latest?access_key=${FIXER_API_KEY}`,
          {
            method: 'HEAD',
            signal: controller.signal,
          }
        );

        results.fixerApi = response.ok;
      } catch {
        results.fixerApi = false;
      }
    }

    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance - only create on server side
export const currencyService =
  typeof window === 'undefined' ? CurrencyService.getInstance() : (null as any);
