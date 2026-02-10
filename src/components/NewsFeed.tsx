'use client';

import { useState } from 'react';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import type { NewsItem } from '@/data/mockData';
import styles from './NewsFeed.module.css';

interface NewsFeedProps {
  news: NewsItem[];
}

export default function NewsFeed({ news }: NewsFeedProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.viewToggle}>
          <button
            onClick={() => setViewMode('list')}
            className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
            aria-label="List view"
          >
            <ListIcon size={20} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`${styles.toggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
            aria-label="Grid view"
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      <div className={viewMode === 'list' ? styles.list : styles.grid}>
        {news.map((item) => (
          <article key={item.id} className={styles.card}>
            {item.imageUrl && (
              <div className={styles.imageWrapper}>
                {/* In a real app, use Next.js Image component */}
                <img src={item.imageUrl} alt="" className={styles.image} />
              </div>
            )}
            <div className={styles.content}>
              <div className={styles.meta}>
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.date}</span>
              </div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.summary}>{item.summary}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.readMore}>
                자세히 보기 →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
