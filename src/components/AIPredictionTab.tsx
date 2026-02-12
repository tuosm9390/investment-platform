'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, TrendingDown, Info, AlertCircle, RefreshCw, BarChart3, LineChart as ChartIcon } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import * as LightweightCharts from 'lightweight-charts';
import styles from '../app/search/[topic]/prices/page.module.css';

interface AIPredictionProps {
  symbol: string;
}

interface PredictionData {
  symbol: string;
  latestPrice: number;
  technical: {
    daily: { rsi: number; macd: number };
    fourHour: { rsi: number; macd: number };
  };
  ai: {
    recommendation: string;
    trend: string;
    insights: string[];
    entryPrice: number;
    targetPrice: number;
    stopLoss: number;
    confidence: number;
  };
  timestamp: number;
}

const CACHE_KEY = 'ai_prediction_cache';
const USAGE_KEY = 'ai_prediction_usage';

interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Custom AI Chart Component using Lightweight Charts
const AICustomChart = ({
  symbol,
  entryPrice,
  targetPrice,
  stopLoss,
  isBullish
}: {
  symbol: string,
  entryPrice: number,
  targetPrice: number,
  stopLoss: number,
  isBullish: boolean
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = LightweightCharts.createChart(chartContainerRef.current, {
      layout: {
        background: { type: LightweightCharts.ColorType.Solid, color: 'transparent' },
        textColor: '#6e7681',
      },
      grid: {
        vertLines: { color: 'rgba(48, 54, 61, 0.3)' },
        horzLines: { color: 'rgba(48, 54, 61, 0.3)' },
      },
      autoSize: true,
      timeScale: {
        borderColor: 'rgba(48, 54, 61, 0.5)',
        timeVisible: true,
      },
    });

    // --- Pane 0: Price & Indicators ---
    const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    }, 0);



    // EMA Series
    const ema20Series = chart.addSeries(LightweightCharts.LineSeries, {
      color: 'rgba(41, 98, 255, 0.7)',
      lineWidth: 1,
      title: 'EMA 20',
      priceLineVisible: false,
    }, 0);

    const ema50Series = chart.addSeries(LightweightCharts.LineSeries, {
      color: 'rgba(255, 109, 0, 0.7)',
      lineWidth: 1,
      title: 'EMA 50',
      priceLineVisible: false,
    }, 0);

    // --- Pane 1: RSI ---
    const rsiSeries = chart.addSeries(LightweightCharts.LineSeries, {
      color: '#9c27b0',
      lineWidth: 2,
      title: 'RSI(14)',
    }, 1);

    // Add RSI levels
    rsiSeries.createPriceLine({
      price: 70,
      color: 'rgba(156, 39, 176, 0.4)',
      lineWidth: 1,
      lineStyle: LightweightCharts.LineStyle.Dashed,
      axisLabelVisible: true,
      title: 'Overbought',
    });

    rsiSeries.createPriceLine({
      price: 30,
      color: 'rgba(156, 39, 176, 0.4)',
      lineWidth: 1,
      lineStyle: LightweightCharts.LineStyle.Dashed,
      axisLabelVisible: true,
      title: 'Oversold',
    });

    // --- Pane 2: MACD ---
    const macdHistogramSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
      color: '#26a69a',
      title: 'MACD Hist',
    }, 2);

    const macdLineSeries = chart.addSeries(LightweightCharts.LineSeries, {
      color: '#2962FF',
      lineWidth: 1,
      title: 'MACD',
    }, 2);

    const macdSignalSeries = chart.addSeries(LightweightCharts.LineSeries, {
      color: '#FF6D00',
      lineWidth: 1,
      title: 'Signal',
    }, 2);

    // Indicator Calculators
    const calculateRSI = (data: OHLCVData[], period = 14) => {
      const results: { time: number; value: number }[] = [];
      let gains = 0;
      let losses = 0;

      for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;

        if (i <= period) {
          gains += gain;
          losses += loss;
          if (i === period) {
            const rs = gains / losses;
            results.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
          }
        } else {
          const avgGain = (gains * (period - 1) + gain) / period;
          const avgLoss = (losses * (period - 1) + loss) / period;
          gains = avgGain;
          losses = avgLoss;
          const rs = gains / losses;
          results.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
        }
      }
      return results;
    };

    const calculateEMA = (data: OHLCVData[], period: number) => {
      const k = 2 / (period + 1);
      let ema = data[0].close;
      const results: { time: number; value: number }[] = [];
      for (let i = 0; i < data.length; i++) {
        const val = data[i].close;
        ema = val * k + ema * (1 - k);
        results.push({ time: data[i].time, value: ema });
      }
      return results;
    };




    const fetchKlines = async () => {
      try {


        const binanceSymbol = symbol.toUpperCase().replace('USDT', '') + 'USDT';
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=4h&limit=150`);
        const klinesData = await response.json();

        const formattedData: OHLCVData[] = klinesData.map((d: (string | number)[]) => ({
          time: (d[0] as number) / 1000,
          open: parseFloat(d[1] as string),
          high: parseFloat(d[2] as string),
          low: parseFloat(d[3] as string),
          close: parseFloat(d[4] as string),
          volume: parseFloat(d[5] as string),
        }));

        candlestickSeries.setData(formattedData as any);

        // EMA Data
        ema20Series.setData(calculateEMA(formattedData, 20) as any);
        ema50Series.setData(calculateEMA(formattedData, 50) as any);








        // RSI 14
        const rsiData = calculateRSI(formattedData, 14);
        rsiSeries.setData(rsiData as any);

        // MACD (12, 26, 9)
        const ema12 = calculateEMA(formattedData, 12);
        const ema26 = calculateEMA(formattedData, 26);
        const macdLineData = ema12.map((d, i) => ({
          time: d.time as LightweightCharts.Time,
          value: d.value - ema26[i].value
        }));
        const signalLineData = calculateEMA(macdLineData.map(d => ({ time: d.time as number, close: d.value }) as OHLCVData), 9);
        const histogramData = macdLineData.map((d) => {
          const signal = signalLineData.find(s => (s.time as number) === (d.time as number));
          if (!signal) return null;
          const value = d.value - signal.value;
          return {
            time: d.time as LightweightCharts.Time,
            value,
            color: value >= 0 ? '#26a69a' : '#ef5350'
          };
        }).filter((d): d is { time: LightweightCharts.Time; value: number; color: string } => d !== null);

        macdLineSeries.setData(macdLineData as any);
        macdSignalSeries.setData(signalLineData as any);
        macdHistogramSeries.setData(histogramData as any);







        // Entry/Target/Stop Loss Lines
        candlestickSeries.createPriceLine({
          price: entryPrice, color: '#2962FF', lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: 'Entry (Limit)',
        });
        candlestickSeries.createPriceLine({
          price: targetPrice, color: '#22c55e', lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: 'Target',
        });
        candlestickSeries.createPriceLine({
          price: stopLoss, color: '#ef4444', lineWidth: 2,
          lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: true, title: 'Stop Loss',
        });

        chart.timeScale().fitContent();

      } catch (err: unknown) {
        console.error('Failed to fetch indicators:', err);
      }
    };

    fetchKlines();
    chartRef.current = chart;

    return () => {
      chart.remove();
    };
  }, [symbol, entryPrice, targetPrice, stopLoss]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export const AIPredictionTab: React.FC<AIPredictionProps> = ({ symbol }) => {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [usage, setUsage] = useState({ count: 0, date: '', emailRegistered: false });

  useEffect(() => {
    setData(null);
    setError(null);
    setLoading(true);

    const savedUsage = localStorage.getItem(USAGE_KEY);
    const today = new Date().toISOString().split('T')[0];

    if (savedUsage) {
      const parsed = JSON.parse(savedUsage);
      if (parsed.date === today) {
        setUsage(parsed);
      } else {
        const newUsage = { ...parsed, count: 0, date: today };
        setUsage(newUsage);
        localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
      }
    } else {
      const initialUsage = { count: 0, date: today, emailRegistered: false };
      setUsage(initialUsage);
      localStorage.setItem(USAGE_KEY, JSON.stringify(initialUsage));
    }

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (parsedCache[symbol]) {
        setData(parsedCache[symbol]);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  }, [symbol]);

  const fetchPrediction = async () => {
    const today = new Date().toISOString().split('T')[0];
    const currentUsage = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');

    if (!currentUsage.emailRegistered && currentUsage.count >= 3 && currentUsage.date === today) {
      setShowEmailModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/predict?symbol=${symbol}`);
      const result = await res.json();

      if (result.error === 'API_KEY_REQUIRED') {
        setError('API 키 설정이 필요합니다.');
      } else if (result.error) {
        setError(result.message || '분석 중 오류가 발생했습니다.');
      } else {
        const newData = { ...result, timestamp: Date.now() };
        setData(newData);

        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        cached[symbol] = newData;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));

        const savedUsage = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
        const newUsage = { ...savedUsage, count: (savedUsage.count || 0) + 1 };
        setUsage(newUsage);
        localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
      }
    } catch (err: unknown) {
      console.error('AI Prediction fetch error:', err); // Log the error
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const newUsage = { ...usage, emailRegistered: true };
    setUsage(newUsage);
    localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
    setShowEmailModal(false);
    fetchPrediction();
  };

  if (loading && !data) {
    return (
      <div className={styles.loading} style={{ padding: '4rem 1rem', minHeight: '300px' }}>
        <RefreshCw size={36} className={styles.spinner} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>AI가 데이터를 분석하고 있습니다...</p>
      </div>
    );
  }

  if (!loading && !data && !error) {
    return (
      <div className={styles.landingContainer}>
        <div className={styles.iconCircle}>
          <Brain size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
          {symbol} AI 예측 시작
        </h3>
        <p style={{ color: 'var(--gray-500)', maxWidth: '360px', lineHeight: 1.5, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          차트 패턴과 기술 지표를 종합 분석하여<br />
          AI가 매매 비중과 목표가를 산출합니다.
        </p>
        <button onClick={() => fetchPrediction()} className={styles.primaryButton}>
          분석 시작하기
        </button>
      </div>
    );
  }

  const isBullish = !!(data?.ai.trend === 'Bullish' || data?.ai.trend?.toLowerCase().includes('bull'));

  // Data for Radar Chart (Upper)
  const radarData = data ? [
    { subject: 'RSI (1D)', A: data.technical.daily.rsi, fullMark: 100 },
    { subject: 'RSI (4H)', A: data.technical.fourHour.rsi, fullMark: 100 },
    { subject: 'Confidence', A: data.ai.confidence * 100, fullMark: 100 },
    { subject: 'Trend Strength', A: isBullish ? 80 : 30, fullMark: 100 },
  ] : [];

  return (
    <div className={styles.aiPredictionContainer}>
      <div className={styles.regenerationHeader}>
        <div className={styles.lastUpdateText}>
          {data && `업데이트: ${new Date(data.timestamp).toLocaleTimeString()}`}
        </div>
        <div className={styles.refreshControl}>
          <span className={styles.usageInfo}>
            {usage.emailRegistered ? '분석 횟수: 무제한' : `남은 분석 횟수: ${3 - usage.count}회`}
          </span>
          <button onClick={() => fetchPrediction()} disabled={loading} className={styles.secondaryButton}>
            <RefreshCw size={12} className={loading ? styles.spinner : ''} />
            새로고침
          </button>
        </div>
      </div>

      {error ? (
        <div className={styles.predictionCard} style={{ textAlign: 'center', borderColor: 'var(--danger-200)' }}>
          <AlertCircle size={32} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>
          <button onClick={() => fetchPrediction()} className={styles.primaryButton} style={{ marginTop: '1rem' }}>재시도</button>
        </div>
      ) : data ? (
        <>
          <div className={styles.predictionCard}>
            <div className={styles.summarySection}>
              <div className={styles.recommendationBox}>
                <div className={`${styles.trendBadge} ${isBullish ? styles.bullishBadge : styles.bearishBadge}`}>
                  {isBullish ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {data.ai.trend}
                </div>
                <h2 className={styles.recommendationText}>{data.ai.recommendation}</h2>
                <div className={styles.priceContainer}>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Entry</span>
                    <span className={styles.priceValue} style={{ color: 'var(--primary-color)' }}>${data.ai.entryPrice?.toLocaleString()}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Target</span>
                    <span className={styles.priceValue} style={{ color: 'var(--success)' }}>${data.ai.targetPrice?.toLocaleString()}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Stop Loss</span>
                    <span className={styles.priceValue} style={{ color: 'var(--danger)' }}>${data.ai.stopLoss?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--gray-200)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--gray-400)', fontSize: 10 }} />
                    <Radar
                      name="AI Analysis"
                      dataKey="A"
                      stroke="var(--primary-color)"
                      fill="var(--primary-color)"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.technicalGrid}>
              <div className={styles.technicalItem}>
                <span className={styles.technicalLabel}>CONFIDENCE</span>
                <span className={styles.technicalValue}>{(data.ai.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className={styles.technicalItem}>
                <span className={styles.technicalLabel}>SIGNAL</span>
                <span className={styles.technicalValue}>{isBullish ? 'BUY' : 'SELL'}</span>
              </div>
            </div>
          </div>

          <div className={styles.predictionCard}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} color="var(--primary-color)" />
              AI Insights
            </h3>
            <ul className={styles.insightList}>
              {data.ai.insights.map((insight, i) => (
                <li key={i} className={styles.insightItem}>
                  <div className={styles.insightIcon}><BarChart3 size={14} /></div>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.predictionCard}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChartIcon size={16} color="var(--primary-color)" />
              AI Advanced Analysis Chart
            </h3>
            <div className={styles.detailChartContainer} style={{ height: '650px', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--card-background)' }}>
              <AICustomChart
                symbol={symbol}
                entryPrice={data.ai.entryPrice!}
                targetPrice={data.ai.targetPrice}
                stopLoss={data.ai.stopLoss}
                isBullish={isBullish}
              />
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--gray-400)', textAlign: 'center' }}>
              * 파란색 실선: 진입 지정가 (Entry) / 초록색 실선: AI 목표가 (Target) / 빨간색 점선: AI 손절가 (Stop Loss)
            </p>


          </div>
        </>
      ) : null}

      {showEmailModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>한도 도달</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              일일 무료 분석(3회)이 완료되었습니다.<br />이메일 등록 시 계속 이용 가능합니다.
            </p>
            <form onSubmit={handleEmailSubmit}>
              <input type="email" placeholder="email@example.com" required className={styles.primaryInput} value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" className={styles.primaryButton} style={{ width: '100%' }}>등록하고 계속하기</button>
            </form>
            <button onClick={() => setShowEmailModal(false)} style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--gray-400)' }}>나중에 하기</button>
          </div>
        </div>
      )}
    </div>
  );
};