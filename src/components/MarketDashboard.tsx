'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, TrendingDown, ArrowRight, Zap, Activity } from 'lucide-react';
import styles from './MarketDashboard.module.css';
import { getExchangeRate } from '@/lib/prices';

interface CoinData {
  symbol: string;
  name: string;
  lastPrice: number;
  priceChangePercent: number;
  quoteVolume: number;
}

// 주요 코인 이름 매핑
const COIN_NAMES: Record<string, string> = {
  BTC: '비트코인', ETH: '이더리움', BNB: 'BNB', XRP: '리플',
  SOL: '솔라나', DOGE: '도지코인', ADA: '에이다', AVAX: '아발란체',
  SHIB: '시바이누', DOT: '폴카닷', LINK: '체인링크', UNI: '유니스왑',
  MATIC: '폴리곤', LTC: '라이트코인', NEAR: '니어', APT: '앱토스',
  PEPE: '페페', SUI: '수이', ARB: '아비트럼', OP: '옵티미즘',
};

export const MarketDashboard: React.FC = () => {
  const [topCoins, setTopCoins] = useState<CoinData[]>([]);
  const [gainers, setGainers] = useState<CoinData[]>([]);
  const [losers, setLosers] = useState<CoinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [krwRate, setKrwRate] = useState(1400); // Default fallback
  const isMounted = useRef(true);

  // 환율 조회
  useEffect(() => {
    getExchangeRate().then(rate => {
      if (isMounted.current) setKrwRate(rate);
    });
  }, []);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
        next: { revalidate: 30 }
      } as RequestInit);
      const data = await response.json();

      if (!isMounted.current) return;

      const usdtPairs = data
        .filter((t: any) => {
          if (!t.symbol.endsWith('USDT')) return false;
          const base = t.symbol.replace('USDT', '');
          const excludes = ['USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FDUSD'];
          if (excludes.some(ex => base.includes(ex))) return false;
          if (base.length > 6) return false;
          return true;
        })
        .map((t: any) => ({
          symbol: t.symbol.replace('USDT', ''),
          name: COIN_NAMES[t.symbol.replace('USDT', '')] || t.symbol.replace('USDT', ''),
          lastPrice: parseFloat(t.lastPrice),
          priceChangePercent: parseFloat(t.priceChangePercent),
          quoteVolume: parseFloat(t.quoteVolume),
        }));

      // TOP 5 by volume
      const sorted = [...usdtPairs].sort((a: CoinData, b: CoinData) => b.quoteVolume - a.quoteVolume);
      setTopCoins(sorted.slice(0, 5));

      // Top gainers/losers
      const byChange = [...usdtPairs].sort((a: CoinData, b: CoinData) => b.priceChangePercent - a.priceChangePercent);
      setGainers(byChange.slice(0, 3));
      setLosers(byChange.slice(-3).reverse());

      setIsLoading(false);
    } catch (err) {
      console.error('Market data fetch error:', err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // 30초마다 갱신
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchMarketData]);

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
  };

  const formatKRW = (price: number) => {
    return `₩${Math.round(price * krwRate).toLocaleString('ko-KR')}`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>
            <Activity size={20} /> 실시간 시장 현황
          </h2>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonCircle} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 거래대금 TOP 5 */}
      <div className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>
            <Activity size={18} /> 거래량 TOP 5
          </h2>
          <Link href="/search/비트코인?coin=btc" className={styles.moreLink}>
            전체 시세 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className={styles.coinGrid}>
          {topCoins.map((coin) => (
            <Link
              key={coin.symbol}
              href={`/search/${encodeURIComponent(coin.name)}?coin=${coin.symbol.toLowerCase()}`}
              className={styles.coinCard}
            >
              <div className={styles.coinHeader}>
                <span className={styles.coinIconWrapper}>
                  {!imageErrors.has(coin.symbol.toLowerCase()) ? (
                    <Image
                      src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                      alt={coin.name}
                      width={28}
                      height={28}
                      className={styles.coinIcon}
                      onError={() => setImageErrors(prev => new Set(prev).add(coin.symbol.toLowerCase()))}
                    />
                  ) : (
                    <span className={styles.coinIconFallback}>{coin.symbol.charAt(0)}</span>
                  )}
                </span>
                <div>
                  <span className={styles.coinName}>{coin.name}</span>
                  <span className={styles.coinSymbol}>{coin.symbol}</span>
                </div>
              </div>
              <div className={styles.coinPrice}>
                <span className={styles.priceUsd}>{formatPrice(coin.lastPrice)}</span>
                <span className={styles.priceKrw}>{formatKRW(coin.lastPrice)}</span>
              </div>
              <div className={`${styles.changeTag} ${coin.priceChangePercent >= 0 ? styles.positive : styles.negative}`}>
                {coin.priceChangePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 급등 / 급락 */}
      <div className={styles.trendGrid}>
        <div className={styles.trendSection}>
          <h3 className={styles.trendTitle}>
            <Zap size={16} className={styles.gainIcon} /> 24시간 급등
          </h3>
          <div className={styles.trendList}>
            {gainers.map((coin) => (
              <Link
                key={coin.symbol}
                href={`/search/${encodeURIComponent(coin.name)}?coin=${coin.symbol.toLowerCase()}`}
                className={styles.trendItem}
              >
                <span className={styles.trendName}>
                  <span className={styles.trendSymbol}>{coin.symbol}</span>
                  {coin.name}
                </span>
                <span className={`${styles.trendChange} ${styles.positive}`}>
                  +{coin.priceChangePercent.toFixed(2)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.trendSection}>
          <h3 className={styles.trendTitle}>
            <TrendingDown size={16} className={styles.lossIcon} /> 24시간 급락
          </h3>
          <div className={styles.trendList}>
            {losers.map((coin) => (
              <Link
                key={coin.symbol}
                href={`/search/${encodeURIComponent(coin.name)}?coin=${coin.symbol.toLowerCase()}`}
                className={styles.trendItem}
              >
                <span className={styles.trendName}>
                  <span className={styles.trendSymbol}>{coin.symbol}</span>
                  {coin.name}
                </span>
                <span className={`${styles.trendChange} ${styles.negative}`}>
                  {coin.priceChangePercent.toFixed(2)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
