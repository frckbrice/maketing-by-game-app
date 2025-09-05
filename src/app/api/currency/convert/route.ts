import { currencyService } from '@/lib/api/currencyService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, fromCurrency, toCurrency } = await request.json();

    // Validate input
    if (!amount || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters: amount, fromCurrency, toCurrency',
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Use the currency service for server-side conversion
    const convertedAmount = await currencyService.convertCurrency(
      amount,
      fromCurrency,
      toCurrency
    );

    // Type guard to ensure convertedAmount is a number
    if (typeof convertedAmount !== 'number') {
      throw new Error('Invalid conversion result');
    }

    return NextResponse.json({
      success: true,
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      targetCurrency: toCurrency,
      exchangeRate: convertedAmount / amount,
    });
  } catch (error) {
    console.error('Currency conversion API error:', error);

    return NextResponse.json(
      {
        error: 'Currency conversion failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baseCurrency = searchParams.get('base') || 'USD';

    // Get exchange rates for the base currency
    const rates = await currencyService.getExchangeRates(baseCurrency);

    return NextResponse.json({
      success: true,
      baseCurrency,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Exchange rates API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch exchange rates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
