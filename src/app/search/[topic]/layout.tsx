'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation'; // useParams 추가
import styles from './layout.module.css';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams(); // params 가져오기
  const pathname = usePathname();
  const topic = typeof params?.topic === 'string' ? decodeURIComponent(params.topic) : '';

  // topic이 없으면(혹은 로딩 중이면) 렌더링 방지하거나 로딩 표시
  if (!topic) return null;

  const isAnalysis = pathname?.includes('/analysis');
  const isPrices = pathname?.includes('/prices');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {topic} <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: '1.5rem' }}>투자 정보</span>
        </h1>

        <nav className={styles.tabs}>
          <Link
            href={`/search/${encodeURIComponent(topic)}`}
            className={`${styles.tab} ${!isAnalysis && !isPrices ? styles.active : ''}`}
          >
            뉴스 & 포럼
          </Link>
          <Link
            href={`/search/${encodeURIComponent(topic)}/analysis`}
            className={`${styles.tab} ${isAnalysis ? styles.active : ''}`}
          >
            투자 관점 (AI 요약)
          </Link>
          <Link
            href={`/search/${encodeURIComponent(topic)}/prices`}
            className={`${styles.tab} ${isPrices ? styles.active : ''}`}
          >
            시세 정보
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
