export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  imageUrl?: string;
  url: string;
}

export interface AnalysisData {
  topic: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number; // 0-100
  summary: string;
  keyPoints: string[];
  risks: string[];
  updatedAt: string;
}

const bitcoinNews: NewsItem[] = [
  {
    id: '1',
    title: '비트코인, 반감기 이후 채굴 난이도 역대 최고치 경신',
    source: 'CoinDesk Korea',
    date: '2024-05-15',
    summary: '비트코인 네트워크의 해시레이트가 지속적으로 상승하며 채굴 난이도가 또다시 최고치를 기록했습니다. 이는 네트워크 보안성이 강화되었음을 의미하지만 채굴자들의 수익성에는 압박이 될 수 있습니다.',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=300&h=200'
  },
  {
    id: '2',
    title: 'SEC, 현물 비트코인 ETF 옵션 승인 검토 연기',
    source: 'BlockMedia',
    date: '2024-05-14',
    summary: '미국 증권거래위원회(SEC)가 비트코인 현물 ETF에 대한 옵션 상품 승인 결정을 연기했습니다. 시장은 이에 대해 단기적인 실망감을 나타냈으나 장기적인 승인 가능성은 여전히 높게 보고 있습니다.',
    url: '#'
  },
  {
    id: '3',
    title: '글로벌 자산운용사들, 암호화폐 포트폴리오 비중 확대',
    source: 'Financial Times',
    date: '2024-05-13',
    summary: '주요 자산운용사들이 고객들의 수요 증가에 따라 암호화폐 관련 상품의 비중을 점진적으로 늘리고 있다는 보고서가 발표되었습니다.',
    url: '#',
  }
];

const stockNews: NewsItem[] = [
  {
    id: '101',
    title: '삼성전자, HBM 공급 확대 기대감에 주가 상승',
    source: '한국경제',
    date: '2024-05-15',
    summary: '삼성전자가 엔비디아에 HBM3E 공급을 위한 테스트를 순조롭게 진행 중이라는 소식에 주가가 강세를 보이고 있습니다.',
    url: '#',
  },
  {
    id: '102',
    title: '연준 의장 "인플레이션 둔화 확신 들 때까지 금리 인하 없다"',
    source: 'Bloomberg',
    date: '2024-05-14',
    summary: '제롬 파월 연준 의장이 네덜란드 암스테르담에서 열린 행사에서 인플레이션이 목표치인 2%로 확실히 향하고 있다는 확신이 들기 전까지는 금리를 인하하지 않겠다고 재차 강조했습니다.',
    url: '#',
  }
];

export const getNews = (topic: string): NewsItem[] => {
  const query = decodeURIComponent(topic).toLowerCase();
  if (query.includes('비트코인') || query.includes('crypto')) return bitcoinNews;
  if (query.includes('삼성') || query.includes('stock')) return stockNews;
  return [...bitcoinNews, ...stockNews]; // Default mixed
};

export const getAnalysis = (topic: string): AnalysisData => {
  const query = decodeURIComponent(topic).toLowerCase();
  const isCrypto = query.includes('비트코인') || query.includes('crypto');

  return {
    topic: decodeURIComponent(topic),
    sentiment: isCrypto ? 'Bullish' : 'Neutral',
    score: isCrypto ? 75 : 50,
    summary: isCrypto
      ? '최근 현물 ETF 승인 이후 기관 자금 유입이 지속되고 있으며, 반감기 이슈가 소화되면서 장기적인 우상향 추세가 유효해 보입니다. 단기 변동성은 주의가 필요합니다.'
      : '거시경제 지표의 불확실성이 지속됨에 따라 보수적인 접근이 필요합니다. 실적 호전이 예상되는 종목 위주의 선별적 투자가 권장됩니다.',
    keyPoints: [
      isCrypto ? '기관 투자자 유입 지속' : '고금리 장기화 우려',
      isCrypto ? '반감기 이후 공급 충격' : 'AI 반도체 수요 증가',
      '규제 환경 변화 주시 필요'
    ],
    risks: [
      '거시경제 불확실성',
      '지정학적 리스크',
      '규제 당국의 정책 변화'
    ],
    updatedAt: new Date().toISOString().split('T')[0]
  };
};
