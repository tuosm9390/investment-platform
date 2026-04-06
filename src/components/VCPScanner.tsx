'use client';

import React, { useState, useEffect } from 'react';
import { getCryptoPrices, getHistoricalKlines, PriceData } from '@/lib/prices';
import { detectVCP } from '@/lib/advanced-indicators';
import { Search, ShieldCheck, AlertCircle } from 'lucide-react';
import styles from './MarketDashboard.module.css';

interface Props {
  onSelectSymbol?: (symbol: string) => void;
}

export const VCPScanner: React.FC<Props> = ({ onSelectSymbol }) => {
  const [candidates, setCandidates] = useState<{ symbol: string; pullbacks: number[] }[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const scan = async () => {
      setIsScanning(true);
      try {
        const prices = await getCryptoPrices();
        const top50 = prices.sort((a, b) => b.quote_volume - a.quote_volume).slice(0, 30);
        
        const results = [];
        for (const coin of top50) {
          const klines = await getHistoricalKlines(coin.symbol, '1d', 260);
          if (klines.length > 250) {
            const vcpResult = detectVCP(klines);
            if (vcpResult.isVCP) {
              results.push({ symbol: coin.symbol, pullbacks: vcpResult.pullbacks });
            }
          }
        }
        setCandidates(results);
      } catch (err) {
        console.error('VCP Scan failed:', err);
      }
      setIsScanning(false);
    };
    scan();
  }, []);

  return (
    <div className={styles.coinListContainer}>
      <div className={styles.header}>
        <div className={styles.titleWithTooltip}>
          <h3><Search size={18} /> VCP 돌파 임박 스캐너</h3>
          <div className={styles.infoIcon}>
            <AlertCircle size={14} />
            <div className={styles.tooltipText}>
              <strong>VCP(변동성 수축 패턴)</strong>: 전설적인 트레이더 마크 미너비니의 전략입니다. 
              강력한 상승 추세에서 매물이 소화되며 가격 변동폭이 줄어드는 종목을 찾습니다. 
              수축 수치가 점점 작아질수록 폭발적 돌파 가능성이 높습니다.
            </div>
          </div>
        </div>
      </div>
      
      {isScanning ? (
        <div className={styles.loading}>전 세계 시장 패턴 분석 중...</div>
      ) : candidates.length === 0 ? (
        <div className={styles.empty}>
          <p>현재 VCP 기준을 충족하는 종목이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.listWrapper}>
          <p className={styles.clickGuide}>* 종목을 클릭하면 상세 차트와 기관 수급 분석을 볼 수 있습니다.</p>
          {candidates.map((c, i) => (
            <div 
              key={i} 
              className={`${styles.coinItem} ${styles.clickable}`}
              onClick={() => onSelectSymbol?.(c.symbol)}
            >
              <div className={styles.symbolInfo}>
                <span className={styles.symbol}>{c.symbol.toUpperCase()}</span>
                <ShieldCheck size={14} color="#3b82f6" />
              </div>
              <div className={styles.vcpDetail}>
                수축: {c.pullbacks.map(p => `${(p * 100).toFixed(0)}%`).join(' → ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
