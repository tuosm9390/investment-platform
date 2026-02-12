import SearchBar from '@/components/SearchBar';
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
          {['비트코인', '이더리움', '삼성전자', '솔라나', '리플'].map((tag) => (
            <a key={tag} href={`/search/${tag}`} className={styles.tag}>
              {tag}
            </a>
          ))}
        </div>
      </div>

      {/* 시장 대시보드 */}
      <section className={styles.dashboardSection}>
        <MarketDashboard />
      </section>
    </div>
  );
}
