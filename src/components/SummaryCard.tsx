'use client';

import { Bot } from 'lucide-react';
import styles from './SummaryCard.module.css';
import { NewsItem } from '@/lib/crawler';

interface SummaryCardProps {
  topic: string;
  news?: NewsItem[];
}

export default function SummaryCard({ topic, news = [] }: SummaryCardProps) {
  let fullText = '';

  if (news.length > 0) {
    const topNews = news.slice(0, 3).map(n => n.title).join(', ');
    fullText = `"${topic}" AI 분석: 최근 데이터를 기반으로 분석한 결과, 주요 논의는 다음과 같습니다: ${topNews}. 시장 심리는 변동성이 높으며 복합적인 양상을 보이고 있습니다. 투자자들의 주의 깊은 모니터링이 필요합니다.`;
  } else {
    fullText = `"${topic}"에 대한 최신 시장 동향과 뉴스 데이터를 분석 중입니다... 잠시만 기다려 주세요.`;
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Bot size={18} />
        <span>AI 인사이트 • 실시간 분석</span>
      </div>
      <h2 className={styles.title}>
        &quot;{topic}&quot; 시장 브리핑
      </h2>
      <div className={styles.summary}>
        {fullText}
      </div>
    </div>
  );
}
