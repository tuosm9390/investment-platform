import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { SUGGESTIONS } from '@/data/suggestions';
import { MarketDashboard } from '@/components/MarketDashboard';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Invesight</h1>
        <p className={styles.subtitle}>
          AI 기반 투자 분석 플랫폼 — 실시간 시세, 뉴스, AI 예측을 한 곳에서
        </p>
        <div className={styles.searchWrapper}>
          <SearchBar />
        </div>
        <div className={styles.tags}>
          <span className={styles.tagLabel}>인기 검색</span>
          {['비트코인', '이더리움', '삼성전자', '솔라나', '리플'].map((tag) => {
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
    </div>
  );
}
