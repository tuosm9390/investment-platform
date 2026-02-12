'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './layout.module.css';
import SearchTabs from '@/components/SearchTabs';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const topic = typeof params?.topic === 'string' ? decodeURIComponent(params.topic) : '';

  // topic이 없으면(혹은 로딩 중이면) 렌더링 방지하거나 로딩 표시
  if (!topic) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {topic} <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: '1.5rem' }}>투자 정보</span>
        </h1>

        <Suspense fallback={null}>
          <SearchTabs />
        </Suspense>
      </header>
      {children}
    </div>
  );
}
