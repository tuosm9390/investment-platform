import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import styles from './page.module.css';
import { ResearchSection } from '@/components/research/ResearchSection';

export default function Home() {
  const popularTags = ['비트코인', '삼성전자', '테슬라', '이더리움', 'S&P 500', '엔비디아'];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        투자의 모든 것, Invesight
      </h1>
      <p className={styles.subtitle}>
        주식부터 암호화폐까지, AI가 분석한 최신 투자 정보를 한눈에 확인하세요.
      </p>

      <div className={styles.searchWrapper}>
        <SearchBar />

        <div className={styles.tags}>
          {popularTags.map((tag) => (
            <Link key={tag} href={`/search/${encodeURIComponent(tag)}`} className={styles.tag}>
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      <ResearchSection />
    </div>
  );
}
