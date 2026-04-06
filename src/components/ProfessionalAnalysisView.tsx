'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, CandlestickSeries } from 'lightweight-charts';
import { 
  getHistoricalKlines 
} from '@/lib/prices';
import { 
  detectMarketStructure, 
  detectOrderBlocks, 
  detectFVGs, 
  detectVSASignals, 
  detectVCP, 
  OHLCV 
} from '@/lib/advanced-indicators';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Activity,
  Layers
} from 'lucide-react';
import styles from './ProfessionalAnalysisView.module.css';

interface Props {
  symbol: string;
}

export const ProfessionalAnalysisView: React.FC<Props> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [data, setData] = useState<OHLCV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SMC' | 'VSA' | 'VCP'>('SMC');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const klines = await getHistoricalKlines(symbol, '1h', 500);
      setData(klines);
      setIsLoading(false);
    };
    fetchData();
  }, [symbol]);

  const analysis = useMemo(() => {
    if (data.length === 0) return null;
    return {
      structure: detectMarketStructure(data),
      orderBlocks: detectOrderBlocks(data),
      fvgs: detectFVGs(data),
      vsa: detectVSASignals(data),
      vcp: detectVCP(data)
    };
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#1a1a1a' }, textColor: '#d1d4dc' },
      grid: { vertLines: { color: '#2b2b2b' }, horzLines: { color: '#2b2b2b' } },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    // Use the modern addSeries API which is more robust in v5
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', 
      downColor: '#ef4444', 
      borderVisible: false,
      wickUpColor: '#22c55e', 
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(data.map(d => ({
      time: d.time as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })));

    // Visualize SMC Structure with safety check for setMarkers
    if (analysis && typeof candlestickSeries.setMarkers === 'function') {
      const markers = analysis.structure.map(s => ({
        time: s.time as UTCTimestamp,
        position: s.direction === 'bullish' ? 'aboveBar' : 'belowBar',
        color: s.direction === 'bullish' ? '#22c55e' : '#ef4444',
        shape: 'arrowDown' as const,
        text: s.type,
      }));
      candlestickSeries.setMarkers(markers as any);
    } else if (analysis) {
      console.warn('setMarkers method not found on candlestickSeries object');
    }

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, analysis]);

  if (isLoading) return <div className={styles.loading}>분석 데이터 불러오는 중...</div>;
  if (!analysis) return <div className={styles.error}>데이터를 분석할 수 없습니다.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2><Activity size={20} /> {symbol.toUpperCase()} 전문 분석</h2>
        <div className={styles.tabs}>
          {(['SMC', 'VSA', 'VCP'] as const).map(tab => (
            <button 
              key={tab} 
              className={activeTab === tab ? styles.activeTab : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div ref={chartContainerRef} className={styles.chartWrapper} />

      <main className={styles.content}>
        {activeTab === 'SMC' && (
          <div className={styles.smcSection}>
            <div className={styles.summaryGrid}>
              <div className={styles.card}>
                <h3>시장 구조 (BOS/CHoCH)</h3>
                <p className={styles.description}>시장의 추세 지속(BOS) 및 반전(CHoCH) 지점을 자동으로 감지합니다.</p>
                <ul className={styles.list}>
                  {analysis.structure.slice(-5).reverse().map((s, i) => (
                    <li key={i} className={s.direction === 'bullish' ? styles.bullish : styles.bearish}>
                      {s.type === 'BOS' ? <TrendingUp size={14} /> : <Zap size={14} />}
                      <span>{s.type} ({s.direction}) @ {s.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.card}>
                <h3>미완화 오더 블록 (Active OB)</h3>
                <ul className={styles.list}>
                  {analysis.orderBlocks.filter(ob => !ob.mitigated).slice(-5).map((ob, i) => (
                    <li key={i} className={ob.type === 'bullish' ? styles.bullish : styles.bearish}>
                      <Layers size={14} />
                      <span>{ob.type === 'bullish' ? 'Demand' : 'Supply'} OB: {ob.bottom.toFixed(2)} - {ob.top.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'VSA' && (
          <div className={styles.vsaSection}>
            <div className={styles.card}>
              <h3>주요 VSA 신호</h3>
              <div className={styles.signalGrid}>
                {analysis.vsa.slice(-8).reverse().map((sig, i) => (
                  <div key={i} className={styles.signalItem}>
                    <span className={styles.signalType}>{sig.type}</span>
                    <span className={styles.signalPrice}>가격: {sig.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'VCP' && (
          <div className={styles.vcpSection}>
            <div className={styles.vcpStatus}>
              <div className={`${styles.statusBadge} ${analysis.vcp.isStage2 ? styles.positive : ''}`}>
                Stage 2 상승 추세: {analysis.vcp.isStage2 ? '확인됨' : '미흡'}
              </div>
              <div className={`${styles.statusBadge} ${analysis.vcp.isVCP ? styles.highlight : ''}`}>
                VCP 셋업: {analysis.vcp.isVCP ? '포착됨' : '아님'}
              </div>
            </div>
            <div className={styles.card}>
              <h3>변동성 수축 현황</h3>
              <div className={styles.pullbackList}>
                {analysis.vcp.pullbacks.map((p, i) => (
                  <div key={i} className={styles.pullbackItem}>
                    T{i + 1} 눌림 깊이: {(p * 100).toFixed(1)}%
                  </div>
                ))}
              </div>
              {analysis.vcp.isVCP && (
                <p className={styles.vcpAlert}>
                  <AlertTriangle size={16} /> 변동성이 충분히 수축되었습니다. 돌파를 주시하세요!
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
