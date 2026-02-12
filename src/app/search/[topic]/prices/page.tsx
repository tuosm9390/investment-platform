'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { PriceData, StockPriceData, getTradingViewSymbol, BINANCE_WS_URL, KRW_RATE, FilterType, filterCryptoData } from '@/lib/prices';
import styles from './page.module.css';
import { AIPredictionTab } from '@/components/AIPredictionTab';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'volume', label: '거래대금순' },
  { value: 'price', label: '현재가격순' },
  { value: 'gainers', label: '상승률 상위' },
  { value: 'losers', label: '하락률 상위' },
];

interface BinanceMiniTicker {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  c: string; // Close price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
}

export default function PricesPage() {
  const [allCryptoPrices, setAllCryptoPrices] = useState<PriceData[]>([]);
  const [stockPrices, setStockPrices] = useState<StockPriceData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [activeFilter, setActiveFilter] = useState<FilterType>('volume');
  const [displayCount, setDisplayCount] = useState(10);
  const [activeTab, setActiveTab] = useState<'prices' | 'ai'>('prices');
  const [imageErrorMap, setImageErrorMap] = useState<Set<string>>(new Set()); // Track images that failed to load

  const isMounted = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Filter and sort crypto prices (get all, then slice for display)
  const allFilteredPrices = useMemo(() => {
    return filterCryptoData(allCryptoPrices, activeFilter, 100);
  }, [allCryptoPrices, activeFilter]);

  // Slice for display
  const cryptoPrices = useMemo(() => {
    return allFilteredPrices.slice(0, displayCount);
  }, [allFilteredPrices, displayCount]);

  // Reset display count when filter changes
  useEffect(() => {
    setDisplayCount(10);
  }, [activeFilter]);

  // Initial data fetch via REST API
  const fetchInitialPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/prices');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      if (isMounted.current) {
        if (data.crypto && data.crypto.length > 0) {
          setAllCryptoPrices(data.crypto);
        }
        if (data.stocks && data.stocks.length > 0) {
          setStockPrices(data.stocks);
        }
        setLastUpdate(new Date());
        setError(null);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      if (isMounted.current) {
        console.error('Initial data fetch error:', err); // Explicitly use err
        setError('초기 데이터 로딩 실패');
        setIsLoading(false);
      }
    }
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    isMounted.current = true;

    // Fetch initial data
    fetchInitialPrices();

    // Connect to Binance WebSocket
    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      setWsStatus('connecting');
      const ws = new WebSocket(BINANCE_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted.current) {
          setWsStatus('connected');
          setError(null);
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted.current) return;

        try {
          const data: BinanceMiniTicker[] = JSON.parse(event.data);

          if (Array.isArray(data)) {
            setAllCryptoPrices((prevPrices) => {
              const priceMap = new Map(data.map((t) => [t.s, t]));

              return prevPrices.map((crypto) => {
                const symbol = crypto.symbol.toUpperCase() + 'USDT';
                const ticker = priceMap.get(symbol);

                if (ticker && ticker.c) {
                  const newPriceUsd = parseFloat(ticker.c);
                  return {
                    ...crypto,
                    current_price_usd: newPriceUsd,
                    current_price_krw: newPriceUsd * KRW_RATE,
                    quote_volume: parseFloat(ticker.q) || crypto.quote_volume,
                  };
                }
                return crypto;
              });
            });

            setLastUpdate(new Date());
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      ws.onerror = () => {
        if (isMounted.current) {
          setWsStatus('disconnected');
        }
      };

      ws.onclose = () => {
        if (isMounted.current) {
          setWsStatus('disconnected');
          setTimeout(connectWebSocket, 3000);
        }
      };
    };

    const wsTimeout = setTimeout(connectWebSocket, 500);

    return () => {
      isMounted.current = false;
      clearTimeout(wsTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [fetchInitialPrices]);

  const formatKRW = useCallback((price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const formatUSD = useCallback((price: number) => {
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    }).format(price);
  }, []);

  const formatVolume = useCallback((volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  }, []);

  const tradingViewSymbol = getTradingViewSymbol(selectedCrypto);

  if (isLoading && allCryptoPrices.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>시세 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && allCryptoPrices.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={fetchInitialPrices} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* WebSocket Status */}
      <div className={styles.statusBar}>
        <span className={`${styles.statusDot} ${styles[wsStatus]}`}></span>
        <span className={styles.statusText}>
          {wsStatus === 'connected' ? '실시간 연결됨 (Binance)' : wsStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
        </span>
        {lastUpdate && (
          <span className={styles.updateTime}>
            마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          </span>
        )}
      </div>

      {/* Main Tabs Selection */}
      <div className={styles.mainTabs}>
        <button
          className={`${styles.mainTab} ${activeTab === 'prices' ? styles.mainTabActive : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          📊 실시간 시세
        </button>
        <button
          className={`${styles.mainTab} ${activeTab === 'ai' ? styles.mainTabActive : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI 투자 예측
        </button>
      </div>

      {activeTab === 'prices' ? (
        <>
          {/* TradingView Chart */}
          <section className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h2 className={styles.sectionTitle}>📊 실시간 차트</h2>
              <select
                className={styles.cryptoSelect}
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
              >
                {cryptoPrices.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.chartWrapper}>
              <iframe
                key={tradingViewSymbol}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tradingViewSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Asia%2FSeoul&withdateranges=1&showpopupbutton=1&locale=kr`}
                className={styles.tradingViewFrame}
                allowFullScreen
              />
            </div>
          </section>

          {/* Crypto Prices */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🪙 암호화폐 실시간 시세</h2>
              <span className={styles.totalCount}>{allCryptoPrices.length}개 코인</span>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.filterTab} ${activeFilter === option.value ? styles.filterTabActive : ''}`}
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>이름</th>
                    <th>심볼</th>
                    <th className={styles.alignRight}>현재가 (USD)</th>
                    <th className={styles.alignRight}>현재가 (KRW)</th>
                    <th className={styles.alignRight}>24시간 변동</th>
                    <th className={styles.alignRight}>거래대금 (24h)</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoPrices.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`${styles.clickableRow} ${selectedCrypto === item.id ? styles.selectedRow : ''}`}
                      onClick={() => setSelectedCrypto(item.id)}
                    >
                      <td className={styles.rankCell}>{index + 1}</td>
                      <td className={styles.nameCell}>
                        <span className={styles.coinIconWrapper}>
                          {!imageErrorMap.has(item.id) ? (
                            <Image
                              src={`https://assets.coincap.io/assets/icons/${item.symbol}@2x.png`}
                              alt={`${item.name} icon`}
                              width={24}
                              height={24}
                              className={styles.coinIcon}
                              onError={() => setImageErrorMap(prev => new Set(prev).add(item.id))}
                            />
                          ) : (
                            <span style={{ width: 24, height: 24, display: 'inline-block' }} /> // Transparent blank space
                          )}
                        </span>
                        {item.name}
                      </td>
                      <td className={styles.symbolCell}>{item.symbol.toUpperCase()}</td>
                      <td className={styles.alignRight}>{formatUSD(item.current_price_usd)}</td>
                      <td className={styles.alignRight}>{formatKRW(item.current_price_krw)}</td>
                      <td className={`${styles.alignRight} ${item.price_change_percentage_24h >= 0 ? styles.positive : styles.negative}`}>
                        {item.price_change_percentage_24h >= 0 ? '+' : ''}{item.price_change_percentage_24h.toFixed(2)}%
                      </td>
                      <td className={styles.alignRight}>{formatVolume(item.quote_volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {displayCount < allFilteredPrices.length && (
              <div className={styles.loadMoreWrapper}>
                <button
                  className={styles.loadMoreButton}
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                >
                  더보기 ({cryptoPrices.length} / {allFilteredPrices.length})
                </button>
              </div>
            )}
          </section>
        </>
      ) : (
        <AIPredictionTab symbol={allCryptoPrices.find(c => c.id === selectedCrypto)?.symbol.toUpperCase() || 'BTC'} />
      )}

      {/* Stock Prices */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📈 주요 주식 시세</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>이름</th>
                <th>종목코드</th>
                <th className={styles.alignRight}>현재가</th>
                <th className={styles.alignRight}>24시간 변동</th>
              </tr>
            </thead>
            <tbody>
              {stockPrices.map((item) => (
                <tr key={item.id}>
                  <td className={styles.nameCell}>{item.name}</td>
                  <td className={styles.symbolCell}>{item.symbol}</td>
                  <td className={styles.alignRight}>{formatKRW(item.current_price)}</td>
                  <td className={`${styles.alignRight} ${item.price_change_percentage_24h >= 0 ? styles.positive : styles.negative}`}>
                    {item.price_change_percentage_24h >= 0 ? '+' : ''}{item.price_change_percentage_24h.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className={styles.disclaimer}>
        * 암호화폐 시세는 Binance WebSocket API 제공 (실시간). 주식 시세는 예시 데이터입니다.
      </p>
    </div>
  );
}
