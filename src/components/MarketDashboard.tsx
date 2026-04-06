"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  PieChart,
  Heart,
  Zap,
} from "lucide-react";
import styles from "./MarketDashboard.module.css";
import { CoinList, CoinData } from "./CoinList";
import { VCPScanner } from "./VCPScanner";
import { ProfessionalAnalysisView } from "./ProfessionalAnalysisView";
import { getExchangeRate } from "@/lib/prices";

import { useWatchlist } from "@/hooks/useWatchlist";
import { usePortfolio } from "@/hooks/usePortfolio";

// 주요 코인 이름 매핑
const COIN_NAMES: Record<string, string> = {
  BTC: "비트코인",
  ETH: "이더리움",
  BNB: "BNB",
  XRP: "리플",
  SOL: "솔라나",
  DOGE: "도지코인",
  ADA: "에이다",
  AVAX: "아발란체",
  SHIB: "시바이누",
  DOT: "폴카닷",
  LINK: "체인링크",
  UNI: "유니스왑",
  MATIC: "폴리곤",
  LTC: "라이트코인",
  NEAR: "니어",
  APT: "앱토스",
  PEPE: "페페",
  SUI: "수이",
  ARB: "아비트럼",
  OP: "옵티미즘",
};

// Newly listed coins (Mock for now)
const NEWLY_LISTED_SYMBOLS = ["SUI", "APT", "ARB", "OP", "PEPE"];

export const MarketDashboard: React.FC = () => {
  const [marketSectors, setMarketSectors] = useState<{
    topVolume: CoinData[];
    topGainers: CoinData[];
    topLosers: CoinData[];
    newlyListed: CoinData[];
    trending: CoinData[];
  }>({
    topVolume: [],
    topGainers: [],
    topLosers: [],
    newlyListed: [],
    trending: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Reset selected symbol when switching modes
  useEffect(() => {
    if (!isProfessionalMode) setSelectedSymbol(null);
  }, [isProfessionalMode]);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr",
      );
      const data = await response.json();

      if (!isMounted.current) return;

      const usdtPairs = data
        .filter((t: any) => {
          if (!t.symbol.endsWith("USDT")) return false;
          const base = t.symbol.replace("USDT", "");
          const excludes = ["USDC", "BUSD", "DAI", "TUSD", "USDP", "FDUSD"];
          if (excludes.some((ex) => base.includes(ex))) return false;
          if (base.length > 6) return false;
          return true;
        })
        .map((t: any) => ({
          symbol: t.symbol.replace("USDT", ""),
          name:
            COIN_NAMES[t.symbol.replace("USDT", "")] ||
            t.symbol.replace("USDT", ""),
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          volume24h: parseFloat(t.quoteVolume),
          isNew: false,
        }));

      // 1. Top Volume
      const topVolume = [...usdtPairs]
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 10);

      // 2. Top Gainers
      const topGainers = [...usdtPairs]
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 10);

      // 3. Top Losers (Sort by largest drop first)
      const topLosers = [...usdtPairs]
        .filter((c) => c.change24h < 0)
        .sort((a, b) => a.change24h - b.change24h) // Most negative first
        .slice(0, 10);

      // 4. Newly Listed (30 days criteria)
      const RECENT_30D_LISTINGS = [
        "WIF",
        "METIS",
        "AEVO",
        "BOME",
        "ETHFI",
        "ENA",
        "W",
        "TNSR",
        "SAGA",
      ];
      const newlyListed = usdtPairs
        .filter((c: { symbol: string }) =>
          RECENT_30D_LISTINGS.includes(c.symbol.toUpperCase()),
        )
        .map((c: any) => ({ ...c, isNew: true }))
        .slice(0, 10);

      // 5. Trending Activity (High volume + high volatility / "Hot" right now)
      // Heuristic: Top volume but excluding the absolute top 2 (BTC, ETH) to show surging alts,
      // or simply products with highest combined (vol + abs_change)
      const trending = [...usdtPairs]
        .filter((c) => !["BTC", "ETH"].includes(c.symbol.toUpperCase()))
        .sort(
          (a, b) =>
            b.volume24h * Math.abs(b.change24h) -
            a.volume24h * Math.abs(a.change24h),
        )
        .slice(0, 10);

      setMarketSectors({
        topVolume,
        topGainers,
        topLosers,
        newlyListed,
        trending,
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Market data fetch error:", err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchMarketData]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>시장 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.titleGroup}>
          <PieChart size={24} />
          <h2>실시간 시장 대시보드</h2>
        </div>
        <button
          className={`${styles.proToggle} ${isProfessionalMode ? styles.active : ""}`}
          onClick={() => setIsProfessionalMode(!isProfessionalMode)}
        >
          {isProfessionalMode
            ? "Professional Mode On"
            : "Professional Mode Off"}
        </button>
      </div>

      {isProfessionalMode && (
        <div className={styles.proSection}>
          <VCPScanner onSelectSymbol={setSelectedSymbol} />
        </div>
      )}

      {selectedSymbol && (
        <div className={styles.analysisSection}>
          <ProfessionalAnalysisView symbol={selectedSymbol} />
        </div>
      )}

      <div className={styles.dashboardGrid}>
        <CoinList
          title="24h 최고 거래량"
          icon={<Activity size={18} />}
          data={marketSectors.topVolume}
        />
        <CoinList
          title="거래량 급증 및 활성"
          icon={<Zap size={18} />}
          data={marketSectors.trending}
          defaultSortKey="volume24h"
        />
        <CoinList
          title="24h 최고 상승"
          icon={<TrendingUp size={18} />}
          data={marketSectors.topGainers}
          defaultSortKey="change24h"
        />
        <CoinList
          title="24h 최고 하락"
          icon={<TrendingDown size={18} />}
          data={marketSectors.topLosers}
          defaultSortKey="change24h"
          defaultSortOrder="desc"
        />
        <CoinList
          title="새롭게 출시된 코인"
          icon={<Clock size={18} />}
          data={marketSectors.newlyListed}
        />
      </div>
    </div>
  );
};
