import { NewsItem } from './crawler';
import { AnalysisData } from '@/data/mockData';

export function generateAnalysisFromNews(topic: string, news: NewsItem[]): AnalysisData {
  const isCrypto = topic.includes('비트코인') || topic.toLowerCase().includes('crypto') || topic.toLowerCase().includes('btc');

  // Heuristic analysis based on news count and keywords
  let positiveCount = 0;
  let negativeCount = 0;

  news.forEach(item => {
    const title = item.title.toLowerCase();
    if (title.includes('상승') || title.includes('급등') || title.includes('돌파') || title.includes('호재') || title.includes('bull') || title.includes('up')) {
      positiveCount++;
    }
    if (title.includes('하락') || title.includes('급락') || title.includes('폭락') || title.includes('악재') || title.includes('bear') || title.includes('down')) {
      negativeCount++;
    }
  });

  let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
  let score = 50;

  if (positiveCount > negativeCount) {
    sentiment = 'Bullish';
    score = 50 + Math.min((positiveCount - negativeCount) * 10, 40);
  } else if (negativeCount > positiveCount) {
    sentiment = 'Bearish';
    score = 50 - Math.min((negativeCount - positiveCount) * 10, 40);
  }

  // Extract key points from top 3 news
  const keyPoints = news.slice(0, 3).map(item => item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title);
  if (keyPoints.length === 0) {
    keyPoints.push('데이터가 충분하지 않아 분석할 수 없습니다.');
  }

  // Generate generic risks based on topic type
  const risks = [
    '높은 시장 변동성 주의',
    '글로벌 거시경제 지표 영향',
    isCrypto ? '규제 불확실성 및 보안 리스크' : '기업 실적 및 금리 변동 리스크'
  ];

  return {
    topic: topic,
    sentiment,
    score,
    summary: `최근 ${news.length}개의 뉴스 기사를 분석한 결과, 시장의 심리는 '${sentiment}'로 기울어져 있습니다. (긍정 키워드: ${positiveCount}, 부정 키워드: ${negativeCount})`,
    keyPoints,
    risks,
    updatedAt: new Date().toISOString().split('T')[0]
  };
}
