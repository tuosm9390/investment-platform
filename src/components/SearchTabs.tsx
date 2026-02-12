'use client';

import Link from 'next/link';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import styles from '@/app/search/[topic]/layout.module.css';

export default function SearchTabs() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const topic = typeof params?.topic === 'string' ? decodeURIComponent(params.topic) : '';
  const coinParam = searchParams.get('coin');
  const coinQuery = coinParam ? `?coin=${coinParam}` : '';

  const isAnalysis = pathname?.includes('/analysis');
  const isPrices = pathname?.includes('/prices');

  return (
    <nav className={styles.tabs}>
      <Link
        href={`/search/${encodeURIComponent(topic)}${coinQuery}`}
        className={`${styles.tab} ${!isAnalysis && !isPrices ? styles.active : ''}`}
      >
        뉴스 & 포럼
      </Link>
      <Link
        href={`/search/${encodeURIComponent(topic)}/analysis${coinQuery}`}
        className={`${styles.tab} ${isAnalysis ? styles.active : ''}`}
      >
        투자 관점 (AI 요약)
      </Link>
      <Link
        href={`/search/${encodeURIComponent(topic)}/prices${coinQuery}`}
        className={`${styles.tab} ${isPrices ? styles.active : ''}`}
      >
        시세 정보
      </Link>
    </nav>
  );
}
