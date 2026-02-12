import { NextResponse } from 'next/server';
import { getCryptoPrices, getStockPrices, PriceData, StockPriceData } from '@/lib/prices';

// Server-side cache to reduce API calls
let cachedCrypto: PriceData[] = [];
let cachedStocks: StockPriceData[] = [];
let lastFetchTime: number = 0;
let lastStockFetchTime: number = 0;
const CACHE_DURATION = 15000; // 15 seconds
const STOCK_CACHE_DURATION = 60000; // 1분 (주식은 업데이트 빈도가 낮음)

export async function GET() {
  const now = Date.now();

  // 주식 캐시 갱신 (1분마다)
  if (cachedStocks.length === 0 || (now - lastStockFetchTime) > STOCK_CACHE_DURATION) {
    try {
      cachedStocks = await getStockPrices();
      lastStockFetchTime = now;
    } catch {
      // 실패해도 기존 캐시 유지
    }
  }

  // Check if crypto cache is still valid
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
      console.warn('Crypto prices returned empty.');
    } else {
      cachedCrypto = crypto;
      lastFetchTime = now;
    }

    return NextResponse.json({
      crypto: cachedCrypto.length > 0 ? cachedCrypto : crypto,
      stocks: cachedStocks,
      cached: false
    });
  } catch (error: any) {
    console.error('API Route Error:', error.message || error);

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
