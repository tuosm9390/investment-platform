import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { SUGGESTIONS } from '@/data/suggestions';
import { MarketDashboard } from '@/components/MarketDashboard';
import { TrendingNews } from '@/components/TrendingNews';
import { crawlNews } from '@/lib/crawler';
import styles from './page.module.css';

export default async function Home() {
  // Fetch trending news for the main page
  const news = await crawlNews('crypto');

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Invesight</h1>
        <p className={styles.subtitle}>
          전문 투자자를 위한 AI 기반 분석 플랫폼 — 실시간 시세, 트렌딩 뉴스, 포트폴리오 관리
        </p>
        <div className={styles.searchWrapper}>
          <SearchBar />
        </div>
        <div className={styles.tags}>
          <span className={styles.tagLabel}>인기 검색</span>
          {['비트코인', '이더리움', '솔라나', '리플', '도지코인'].map((tag) => {
            const suggestion = SUGGESTIONS.find(s => s.name === tag);
            const href = suggestion
              ? `/search/${encodeURIComponent(tag)}?coin=${suggestion.symbol.toLowerCase()}`
              : `/search/${encodeURIComponent(tag)}`;

            return (
              <Link key={tag} href={href} className={styles.tag}>
                {tag}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 시장 대시보드 */}
      <section className={styles.dashboardSection}>
        <MarketDashboard />
      </section>

      {/* 트렌딩 뉴스 */}
      <section className={styles.newsSection}>
        <TrendingNews news={news} />
      </section>
    </div>
  );
}
