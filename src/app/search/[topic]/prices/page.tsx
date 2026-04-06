'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ArrowUp, ArrowDown, RefreshCw, AlertCircle, TrendingUp, Bitcoin, Activity, DollarSign, Wallet, Heart, Bell } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import { PriceData, BINANCE_WS_URL, KRW_RATE, FilterType, filterCryptoData } from '@/lib/prices';
import { useWatchlist } from '@/hooks/useWatchlist';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { usePortfolio } from '@/hooks/usePortfolio';
import styles from './page.module.css';
import ErrorBanner from '@/components/ErrorBanner';
import { AIPredictionTab } from '@/components/AIPredictionTab';
import { PriceAlertDialog } from '@/components/PriceAlertDialog';
import { PortfolioDialog } from '@/components/PortfolioDialog';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'volume', label: '거래대금순' },
  { value: 'price', label: '현재가격순' },
  { value: 'gainers', label: '상승률 상위' },
  { value: 'losers', label: '하락률 상위' },
];

interface BinanceTickerStream {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  c: string; // Last price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
}

export default function PricesPage() {
  const [allCryptoPrices, setAllCryptoPrices] = useState<PriceData[]>([]);
  const searchParams = useSearchParams();
  const params = useParams();
  const coinParam = searchParams.get('coin');

  // Topic 파라미터 처리 (URL 디코딩 + 배열 처리)
  const topicParam = decodeURIComponent(Array.isArray(params.topic) ? params.topic[0] : params.topic || '');
  // Topic이 심볼 형태(알파벳/숫자 2-6자)인지 확인
  const isTopicSymbol = /^[a-zA-Z0-9]{2,6}$/.test(topicParam);

  // 초기 코인 설정: 쿼리 파라미터 > 토픽(심볼일 경우) > 기본값(btc)
  const initialCrypto = coinParam?.toLowerCase() || (isTopicSymbol ? topicParam.toLowerCase() : 'btc');

  const [selectedCrypto, setSelectedCrypto] = useState<string>(initialCrypto);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [activeFilter, setActiveFilter] = useState<FilterType>('volume');
  const [displayCount, setDisplayCount] = useState(10);
  const [activeTab, setActiveTab] = useState<'prices' | 'ai'>('prices');
  const [imageErrorMap, setImageErrorMap] = useState<Set<string>>(new Set());
  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();
  const { alerts, addAlert, removeAlert, requestPermission } = usePriceAlerts();
  const { updatePosition, getPosition } = usePortfolio();

  // Alert Dialog State
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState('');
  const [activePrice, setActivePrice] = useState(0);

  const handleOpenAlert = (symbol: string, currentPrice: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSymbol(symbol);
    setActivePrice(currentPrice);
    setIsAlertDialogOpen(true);
  };

  const handleOpenPortfolio = (symbol: string, currentPrice: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSymbol(symbol);
    setActivePrice(currentPrice);
    setIsPortfolioDialogOpen(true);
  };

  const handleAlertSubmit = async (targetPrice: number) => {
    const granted = await requestPermission();
    if (granted) {
      addAlert(activeSymbol, targetPrice, activePrice);
    }
  };

  const handlePortfolioSubmit = (quantity: number, buyPrice: number) => {
    updatePosition(activeSymbol, quantity, buyPrice);
  };

  const getActiveAlert = (symbol: string) => {
    return alerts.find(a => a.symbol === symbol.toUpperCase() && a.isActive);
  };

  // TradingView 심볼 — 서버에서 USD/USDT 존재 여부 검증 후 설정
  const [tradingViewSymbol, setTradingViewSymbol] = useState<string>(`${initialCrypto.toUpperCase()}USD`);

  // URL 파라미터 변경 시 상태 업데이트 (클라이언트 네비게이션 대응)
  useEffect(() => {
    const newCrypto = coinParam?.toLowerCase() || (isTopicSymbol ? topicParam.toLowerCase() : 'btc');
    setSelectedCrypto(newCrypto);
    setTradingViewSymbol(`${newCrypto.toUpperCase()}USD`);
  }, [coinParam, topicParam, isTopicSymbol]);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      try {
        const res = await fetch(`/api/resolve-tv-symbol?coin=${selectedCrypto}`);
        const data = await res.json();
        if (!cancelled) setTradingViewSymbol(data.symbol);
      } catch {
        if (!cancelled) setTradingViewSymbol(`${selectedCrypto.toUpperCase()}USDT`);
      }
    };
    resolve();
    return () => { cancelled = true; };
  }, [selectedCrypto]);

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
        setLastUpdate(new Date());
        setError(null);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      if (isMounted.current) {
        console.error('Initial data fetch error:', err);
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
          const data: BinanceTickerStream[] = JSON.parse(event.data);

          if (Array.isArray(data)) {
            setAllCryptoPrices((prevPrices) => {
              const priceMap = new Map(data.map((t) => [t.s, t]));

              // If we have no prices yet, create the list from WebSocket data
              if (prevPrices.length === 0) {
                const newPrices: PriceData[] = [];
                data.forEach(ticker => {
                  if (!ticker.s.endsWith('USDT')) return;
                  const symbolStr = ticker.s.replace('USDT', '').toLowerCase();

                  // Basic filtering like in server-side
                  if (symbolStr.length > 6) return;
                  const excludeList = ['usdc', 'busd', 'dai', 'tusd', 'usdp', 'fdusd'];
                  if (excludeList.some(ex => symbolStr.includes(ex))) return;

                  const priceUsd = parseFloat(ticker.c);
                  newPrices.push({
                    id: symbolStr,
                    symbol: symbolStr,
                    name: symbolStr.toUpperCase(), // Fallback name
                    current_price_usd: priceUsd,
                    current_price_krw: priceUsd * KRW_RATE,
                    price_change_percentage_24h: parseFloat(ticker.P),
                    volume_24h: parseFloat(ticker.v),
                    quote_volume: parseFloat(ticker.q),
                  });
                });
                return newPrices;
              }

              // Update existing prices
              return prevPrices.map((crypto) => {
                const symbol = crypto.symbol.toUpperCase() + 'USDT';
                const ticker = priceMap.get(symbol);

                if (ticker && ticker.c) {
                  const newPriceUsd = parseFloat(ticker.c);
                  return {
                    ...crypto,
                    current_price_usd: newPriceUsd,
                    current_price_krw: newPriceUsd * KRW_RATE,
                    price_change_percentage_24h: parseFloat(ticker.P) || crypto.price_change_percentage_24h,
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
        <ErrorBanner
          message={error}
          onRetry={fetchInitialPrices}
        />
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

      {wsStatus === 'disconnected' && (
        <ErrorBanner
          variant="warning"
          message="실시간 연결이 끊어졌습니다. 자동 재연결을 시도합니다."
        />
      )}

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
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tradingViewSymbol}&interval=240&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Asia%2FSeoul&withdateranges=1&showpopupbutton=1&locale=kr`}
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
                    <th className={styles.watchlistHeader}></th>
                    <th className={styles.alertHeader}></th>
                    <th className={styles.portfolioHeader}></th>
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
                      <td className={styles.watchlistCell}>
                        <button
                          className={styles.watchlistButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(item.symbol);
                          }}
                        >
                          <Heart
                            size={16}
                            fill={isInWatchlist(item.symbol) ? 'var(--primary-color)' : 'none'}
                            color={isInWatchlist(item.symbol) ? 'var(--primary-color)' : 'var(--gray-400)'}
                          />
                        </button>
                      </td>
                      <td className={styles.alertCell}>
                        <button
                          className={styles.alertButton}
                          onClick={(e) => handleOpenAlert(item.symbol, item.current_price_usd, e)}
                          title={getActiveAlert(item.symbol) ? `알림 설정됨: $${getActiveAlert(item.symbol)?.targetPrice.toLocaleString()}` : "가격 알림 설정"}
                        >
                          <Bell
                            size={16}
                            fill={getActiveAlert(item.symbol) ? 'var(--warning)' : 'none'}
                            color={getActiveAlert(item.symbol) ? 'var(--warning)' : 'var(--gray-400)'}
                          />
                        </button>
                      </td>
                      <td className={styles.portfolioCell}>
                        <button
                          className={styles.portfolioButton}
                          onClick={(e) => handleOpenPortfolio(item.symbol, item.current_price_usd, e)}
                          title={getPosition(item.symbol) ? `보유 중: ${getPosition(item.symbol)?.quantity}개` : "포트폴리오 추가"}
                        >
                          <Wallet
                            size={16}
                            fill={getPosition(item.symbol) ? 'var(--success)' : 'none'}
                            color={getPosition(item.symbol) ? 'var(--success)' : 'var(--gray-400)'}
                          />
                        </button>
                      </td>
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
                      <td className={`${styles.alignRight} ${styles.priceUsdCell}`}>{formatUSD(item.current_price_usd)}</td>
                      <td className={`${styles.alignRight} ${styles.priceKrwCell}`}>{formatKRW(item.current_price_krw)}</td>
                      <td className={`${styles.alignRight} ${styles.changeCell} ${item.price_change_percentage_24h >= 0 ? styles.positive : styles.negative}`}>
                        {item.price_change_percentage_24h >= 0 ? '+' : ''}{item.price_change_percentage_24h.toFixed(2)}%
                      </td>
                      <td className={`${styles.alignRight} ${styles.volumeCell}`}>{formatVolume(item.quote_volume)}</td>
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

      <PriceAlertDialog
        isOpen={isAlertDialogOpen}
        onClose={() => setIsAlertDialogOpen(false)}
        onSubmit={handleAlertSubmit}
        symbol={activeSymbol}
        currentPrice={activePrice}
      />

      <PortfolioDialog
        isOpen={isPortfolioDialogOpen}
        onClose={() => setIsPortfolioDialogOpen(false)}
        onSubmit={handlePortfolioSubmit}
        symbol={activeSymbol}
        currentPrice={activePrice}
      />

      <p className={styles.disclaimer}>
        * 암호화폐 시세는 Binance WebSocket API를 통해 실시간 제공됩니다.
      </p>
    </div>
  );
}
