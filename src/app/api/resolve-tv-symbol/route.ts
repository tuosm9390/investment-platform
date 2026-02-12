import { NextRequest, NextResponse } from 'next/server';

// TradingView 심볼 검증 캐시 (서버 메모리, 프로세스 수명 동안 유지)
const symbolCache = new Map<string, { symbol: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1시간

export async function GET(request: NextRequest) {
  const coin = request.nextUrl.searchParams.get('coin')?.toUpperCase();

  if (!coin) {
    return NextResponse.json({ symbol: 'BTCUSD' });
  }

  // 캐시 확인
  const cached = symbolCache.get(coin);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ symbol: cached.symbol });
  }

  // 1순위: {COIN}USD 검색
  const usdSymbol = `${coin}USD`;
  const usdtSymbol = `${coin}USDT`;

  try {
    const res = await fetch(
      `https://symbol-search.tradingview.com/symbol_search/v3/?text=${usdSymbol}&type=crypto&lang=en`,
      { next: { revalidate: 3600 } } // ISR 캐시 1시간
    );
    const data = await res.json();

    // TradingView 결과에서 정확한 USD 페어 존재 여부 확인
    const hasUsdPair = data.symbols?.some((s: Record<string, string>) => {
      const sym = (s.symbol || '').toUpperCase();
      const desc = (s.description || '').toUpperCase();
      // 정확히 {COIN}USD인지, 또는 심볼/설명에서 매칭되는지 확인
      return sym === usdSymbol || desc.includes(usdSymbol);
    });

    const resolved = hasUsdPair ? usdSymbol : usdtSymbol;

    // 캐시 저장
    symbolCache.set(coin, { symbol: resolved, timestamp: Date.now() });

    return NextResponse.json({ symbol: resolved });
  } catch {
    // API 실패 시 USDT 폴백
    return NextResponse.json({ symbol: usdtSymbol });
  }
}
