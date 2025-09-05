import { currencyService } from '@/lib/api/currencyService';
import { NextRequest, NextResponse } from 'next/server';

interface CurrencyConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

interface ExchangeRatesRequest {
  baseCurrency?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'rates';

    if (action === 'rates') {
      // Get exchange rates
      const baseCurrency = searchParams.get('base') || 'XAF';

      const rates = await currencyService.getExchangeRates(baseCurrency);

      return NextResponse.json({
        success: true,
        baseCurrency,
        rates,
        timestamp: new Date().toISOString(),
        supportedCurrencies: currencyService.getSupportedCurrencies(),
      });
    } else if (action === 'convert') {
      // Convert currency
      const amount = parseFloat(searchParams.get('amount') || '0');
      const fromCurrency = searchParams.get('from') || 'XAF';
      const toCurrency = searchParams.get('to') || 'USD';

      if (amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount provided' },
          { status: 400 }
        );
      }

      const convertedAmount = await currencyService.convertCurrency(
        amount,
        fromCurrency,
        toCurrency
      );

      // Ensure convertedAmount is a number
      if (typeof convertedAmount !== 'number') {
        return NextResponse.json(
          { error: 'Currency conversion failed - invalid result type' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        originalAmount: amount,
        fromCurrency,
        toCurrency,
        convertedAmount,
        exchangeRate: convertedAmount / amount,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'supported') {
      // Get supported currencies
      return NextResponse.json({
        success: true,
        currencies: currencyService.getSupportedCurrencies(),
        defaultCurrency: currencyService.getDefaultCurrency(),
      });
    } else if (action === 'health') {
      // API health check
      const health = await currencyService.checkApiHealth();
      const cacheStats = currencyService.getCacheStats();

      return NextResponse.json({
        success: true,
        apiHealth: health,
        cacheStats,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          error: 'Invalid action. Supported: rates, convert, supported, health',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Currency service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'convert') {
      const { amount, fromCurrency, toCurrency }: CurrencyConversionRequest =
        body;

      // Validate input
      if (!amount || !fromCurrency || !toCurrency) {
        return NextResponse.json(
          {
            error: 'Missing required fields: amount, fromCurrency, toCurrency',
          },
          { status: 400 }
        );
      }

      if (amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0' },
          { status: 400 }
        );
      }

      const convertedAmount = await currencyService.convertCurrency(
        amount,
        fromCurrency,
        toCurrency
      );

      // Ensure convertedAmount is a number
      if (typeof convertedAmount !== 'number') {
        return NextResponse.json(
          { error: 'Currency conversion failed - invalid result type' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        originalAmount: amount,
        fromCurrency,
        toCurrency,
        convertedAmount,
        exchangeRate: convertedAmount / amount,
        formatted: currencyService.formatCurrency(convertedAmount, toCurrency),
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'rates') {
      const { baseCurrency }: ExchangeRatesRequest = body;
      const base = baseCurrency || 'XAF';

      const rates = await currencyService.getExchangeRates(base);

      return NextResponse.json({
        success: true,
        baseCurrency: base,
        rates,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'batch-convert') {
      // Batch conversion for multiple currencies
      const { amount, fromCurrency, toCurrencies } = body;

      if (!amount || !fromCurrency || !Array.isArray(toCurrencies)) {
        return NextResponse.json(
          {
            error:
              'Missing required fields: amount, fromCurrency, toCurrencies (array)',
          },
          { status: 400 }
        );
      }

      const conversions = await Promise.all(
        toCurrencies.map(async (toCurrency: string) => {
          try {
            const convertedAmount = await currencyService.convertCurrency(
              amount,
              fromCurrency,
              toCurrency
            );

            // Ensure convertedAmount is a number
            if (typeof convertedAmount !== 'number') {
              return {
                currency: toCurrency,
                error: 'Currency conversion failed - invalid result type',
              };
            }

            return {
              currency: toCurrency,
              amount: convertedAmount,
              exchangeRate: convertedAmount / amount,
              formatted: currencyService.formatCurrency(
                convertedAmount,
                toCurrency
              ),
            };
          } catch (error) {
            return {
              currency: toCurrency,
              error:
                error instanceof Error ? error.message : 'Conversion failed',
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        originalAmount: amount,
        fromCurrency,
        conversions,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'clear-cache') {
      // Clear currency service cache (admin only)
      currencyService.clearCache();
      return NextResponse.json({
        success: true,
        message: 'Currency cache cleared successfully',
      });
    } else {
      return NextResponse.json(
        {
          error:
            'Invalid action. Supported: convert, rates, batch-convert, clear-cache',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Currency API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Currency service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
