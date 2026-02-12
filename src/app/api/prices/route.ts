import { NextResponse } from 'next/server';
import { getCryptoPrices, getStockPrices, PriceData, StockPriceData } from '@/lib/prices';

// Server-side cache to reduce API calls
let cachedCrypto: PriceData[] = [];
const cachedStocks: StockPriceData[] = getStockPrices();
let lastFetchTime: number = 0;
const CACHE_DURATION = 15000; // 15 seconds cache (CoinCap has generous limits)

export async function GET() {
  const now = Date.now();

  // Check if cache is still valid
  if (cachedCrypto.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return NextResponse.json({
      crypto: cachedCrypto,
      stocks: cachedStocks,
      cached: true,
      cacheAge: Math.floor((now - lastFetchTime) / 1000)
    });
  }

  try {
    const crypto = await getCryptoPrices();

    if (crypto.length === 0) {
      console.warn('Crypto prices returned empty. Fallback might have failed or returned no data.');
    } else {
      cachedCrypto = crypto;
      lastFetchTime = now;
      console.log(`Successfully fetched ${crypto.length} crypto prices.`);
    }

    return NextResponse.json({
      crypto: cachedCrypto.length > 0 ? cachedCrypto : crypto,
      stocks: cachedStocks,
      cached: false
    });
  } catch (error: any) {
    console.error('API Route Error:', error.message || error);

    // Return cached data if available
    if (cachedCrypto.length > 0) {
      return NextResponse.json({
        crypto: cachedCrypto,
        stocks: cachedStocks,
        cached: true,
        error: 'Using cached data'
      });
    }

    return NextResponse.json({ crypto: [], stocks: cachedStocks }, { status: 500 });
  }
}
