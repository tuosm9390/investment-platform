'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Activity, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import styles from './CoinList.module.css';

export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  isNew?: boolean;
}

interface CoinListProps {
  title: string;
  icon: React.ReactNode;
  data: CoinData[];
  defaultSortKey?: keyof CoinData;
  defaultSortOrder?: 'asc' | 'desc';
}

export const CoinList: React.FC<CoinListProps> = ({ 
  title, 
  icon, 
  data, 
  defaultSortKey = 'volume24h',
  defaultSortOrder = 'desc'
}) => {
  const [sortKey, setSortKey] = useState<keyof CoinData>(defaultSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  const handleSort = (key: keyof CoinData) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (typeof valA === 'number' && typeof valB === 'number') {
      // 24시간 변동률(change24h)의 경우, '상승'이나 '하락' 섹터에서는 절대값 기준으로 정렬하여 
      // 변동 폭이 가장 큰 것이 항상 먼저 오도록 처리 (사용자 직관 반영)
      if (sortKey === 'change24h') {
        const absA = Math.abs(valA);
        const absB = Math.abs(valB);
        return sortOrder === 'asc' ? absA - absB : absB - absA;
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return 0;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${vol.toLocaleString()}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.icon}>{icon}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} className={styles.sortable}>
              자산 {sortKey === 'name' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </th>
            <th onClick={() => handleSort('price')} className={styles.sortable}>
              가격 {sortKey === 'price' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </th>
            <th onClick={() => handleSort('change24h')} className={styles.sortable}>
              24h 변동 {sortKey === 'change24h' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </th>
            <th onClick={() => handleSort('volume24h')} className={styles.sortable}>
              24h 거래량 {sortKey === 'volume24h' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((coin) => (
            <tr key={coin.symbol}>
              <td>
                <Link href={`/search/${encodeURIComponent(coin.name)}?coin=${coin.symbol.toLowerCase()}`} className={styles.coinInfo}>
                  <span className={styles.coinSymbol}>{coin.symbol}</span>
                  <span className={styles.coinName}>{coin.name}</span>
                  {coin.isNew && <span className={styles.newBadge}>NEW</span>}
                </Link>
              </td>
              <td className={styles.priceCell}>{formatPrice(coin.price)}</td>
              <td className={`${styles.changeCell} ${coin.change24h >= 0 ? styles.positive : styles.negative}`}>
                {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
              </td>
              <td className={styles.volumeCell}>{formatVolume(coin.volume24h)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
