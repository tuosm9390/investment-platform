import { NextResponse } from 'next/server';
import { getCryptoPrices, PriceData } from '@/lib/prices';

// Server-side cache to reduce API calls
let cachedCrypto: PriceData[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 15000; // 15 seconds

export async function GET() {
  const now = Date.now();

  // Check if crypto cache is still valid
  if (cachedCrypto.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return NextResponse.json({
      crypto: cachedCrypto,
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
      cached: false
    });
  } catch (error: any) {
    console.error('API Route Error:', error.message || error);

    if (cachedCrypto.length > 0) {
      return NextResponse.json({
        crypto: cachedCrypto,
        cached: true,
        error: 'Using cached data'
      });
    }

    return NextResponse.json({ crypto: [] }, { status: 500 });
  }
}
