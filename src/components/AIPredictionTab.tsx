'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Info, Target, AlertCircle, RefreshCw } from 'lucide-react';
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
    targetPrice: number;
    stopLoss: number;
    confidence: number;
  };
}

export const AIPredictionTab: React.FC<AIPredictionProps> = ({ symbol }) => {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/predict?symbol=${symbol}`);
      const result = await res.json();

      if (result.error === 'API_KEY_REQUIRED') {
        setError('API 키 설정이 필요합니다. .env.local 파일을 확인해 주세요.');
      } else if (result.error) {
        setError(result.message || '분석 중 오류가 발생했습니다.');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [symbol]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <RefreshCw size={32} className={styles.spinner} style={{ marginBottom: '1rem', color: 'var(--primary-600)' }} />
        <p>AI가 차트 지표와 ICT 패턴을 분석 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--red-50)', borderRadius: '1rem' }}>
        <AlertCircle size={32} color="var(--red-600)" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--red-700)', fontWeight: 600 }}>{error}</p>
        <button onClick={fetchPrediction} className={styles.retryButton} style={{ marginTop: '1rem' }}>다시 시도</button>
      </div>
    );
  }

  const isBullish = data?.ai.trend === 'Bullish' || data?.ai.trend.toLowerCase().includes('bull');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* AI Summary Header */}
      <div style={{
        background: isBullish ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        padding: '2rem',
        borderRadius: '1.5rem',
        border: `1px solid ${isBullish ? '#bfdbfe' : '#fecaca'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Brain size={24} color="var(--primary-600)" />
            <span style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: '0.875rem' }}>AI 종합 분석 결과</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: isBullish ? '#1e40af' : '#991b1b', marginBottom: '0.25rem' }}>
            {data?.ai.recommendation}
          </h2>
          <p style={{ color: isBullish ? '#3b82f6' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {isBullish ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {data?.ai.trend} Trend
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>AI 신뢰도</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{(data!.ai.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Insights List */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={20} color="var(--primary-500)" />
            AI 인사이트
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem' }}>
            {data?.ai.insights.map((insight, i) => (
              <li key={i} style={{ color: 'var(--gray-700)', lineHeight: 1.5 }}>{insight}</li>
            ))}
          </ul>
        </div>

        {/* Target & Technicals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', color: 'var(--green-600)', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Target size={18} />
                <span>목표가</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${data?.ai.targetPrice.toLocaleString()}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--gray-200)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', color: 'var(--red-600)', fontWeight: 600, marginBottom: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>손절가</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${data?.ai.stopLoss.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--gray-50)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '1rem', textTransform: 'uppercase' }}>Technical Indicators</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Daily RSI</div>
                <div style={{ fontWeight: 600 }}>{data?.technical.daily.rsi.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>4H RSI</div>
                <div style={{ fontWeight: 600 }}>{data?.technical.fourHour.rsi.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Daily MACD</div>
                <div style={{ fontWeight: 600 }}>{data?.technical.daily.macd.toFixed(4)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>4H MACD</div>
                <div style={{ fontWeight: 600 }}>{data?.technical.fourHour.macd.toFixed(4)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center' }}>
        * 본 분석은 AI가 제공하는 기술적 견해이며 실제 투자 결과에 대한 책임을 지지 않습니다.
      </p>
    </div>
  );
};
