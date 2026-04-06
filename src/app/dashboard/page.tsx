'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, PieChart, TrendingUp, TrendingDown, Plus, Trash2, ArrowUpRight } from 'lucide-react';
import { usePortfolio, PortfolioItem } from '@/hooks/usePortfolio';
import styles from './page.module.css';

// Mock current prices for dashboard if real data fetch fails
const MOCK_PRICES: Record<string, number> = {
  'BTC': 65432.10,
  'ETH': 3456.78,
  'SOL': 145.20,
  'XRP': 0.52,
  'DOGE': 0.15,
};

export default function DashboardPage() {
  const { portfolio, isLoaded, updatePosition, removePosition } = usePortfolio();
  const [prices, setPrices] = useState<Record<string, number>>(MOCK_PRICES);

  // In a real app, we'd fetch actual prices here
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data = await res.json();
        const priceMap: Record<string, number> = {};
        data.forEach((item: any) => {
          if (item.symbol.endsWith('USDT')) {
            const symbol = item.symbol.replace('USDT', '');
            priceMap[symbol] = parseFloat(item.price);
          }
        });
        setPrices(prev => ({ ...prev, ...priceMap }));
      } catch (e) {
        console.error('Failed to fetch dashboard prices', e);
      }
    };
    fetchPrices();
  }, []);

  const stats = useMemo(() => {
    let totalInvested = 0;
    let currentValue = 0;

    portfolio.forEach(item => {
      totalInvested += item.quantity * item.averagePrice;
      const currentPrice = prices[item.symbol] || item.averagePrice;
      currentValue += item.quantity * currentPrice;
    });

    const totalProfit = currentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue,
      totalProfit,
      profitPercent
    };
  }, [portfolio, prices]);

  if (!isLoaded) return <div className={styles.loading}>Loading Dashboard...</div>;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>투자 대시보드</h1>
        <p className={styles.subtitle}>내 포트폴리오 성과 및 자산 현황</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>총 자산 가치</div>
          <div className={styles.statValue}>{formatCurrency(stats.currentValue)}</div>
          <div className={`${styles.statSub} ${stats.totalProfit >= 0 ? styles.positive : styles.negative}`}>
            {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)} ({stats.profitPercent.toFixed(2)}%)
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>총 투자 금액</div>
          <div className={styles.statValue}>{formatCurrency(stats.totalInvested)}</div>
          <div className={styles.statSub}>누적 원금 기준</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>보유 자산 수</div>
          <div className={styles.statValue}>{portfolio.length} 종목</div>
          <div className={styles.statSub}>활성 포지션</div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>보유 자산 목록</h2>
        </div>

        {portfolio.length === 0 ? (
          <div className={styles.emptyState}>
            <PieChart size={48} className={styles.emptyIcon} />
            <h3>보유하신 자산이 없습니다</h3>
            <p>검색 페이지에서 코인을 찾아 포트폴리오에 추가해보세요.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>자산</th>
                  <th>보유량</th>
                  <th>평균 단가</th>
                  <th>현재가</th>
                  <th>평가 금액</th>
                  <th>수익률</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(item => {
                  const currentPrice = prices[item.symbol] || 0;
                  const itemValue = item.quantity * currentPrice;
                  const profit = itemValue - (item.quantity * item.averagePrice);
                  const profitPercent = (profit / (item.quantity * item.averagePrice)) * 100;

                  return (
                    <tr key={item.symbol}>
                      <td className={styles.assetCell}>
                        <span className={styles.symbol}>{item.symbol}</span>
                      </td>
                      <td>{item.quantity.toLocaleString()}</td>
                      <td>{formatCurrency(item.averagePrice)}</td>
                      <td>{formatCurrency(currentPrice)}</td>
                      <td>{formatCurrency(itemValue)}</td>
                      <td className={profit >= 0 ? styles.positive : styles.negative}>
                        {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                      </td>
                      <td>
                        <button 
                          onClick={() => removePosition(item.symbol)}
                          className={styles.deleteBtn}
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
