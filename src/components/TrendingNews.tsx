'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, AlertCircle } from 'lucide-react';
import type { NewsItem } from '@/lib/crawler';
import styles from './TrendingNews.module.css';

export const TrendingNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/news?topic=crypto');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error('TrendingNews fetch error:', err);
        setError('뉴스를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Newspaper size={20} className={styles.icon} />
            <h2 className={styles.title}>실시간 트렌딩 뉴스</h2>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={`${styles.skeleton} ${styles.skeletonMeta}`} />
              <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeleton} ${styles.skeletonText}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Newspaper size={20} className={styles.icon} />
            <h2 className={styles.title}>실시간 트렌딩 뉴스</h2>
          </div>
        </div>
        <div className={styles.emptyState}>
          <AlertCircle size={24} className={styles.errorIcon} />
          <p>{error || '최신 뉴스가 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Newspaper size={20} className={styles.icon} />
          <h2 className={styles.title}>실시간 트렌딩 뉴스</h2>
        </div>
      </div>

      <div className={styles.list}>
        {news.map((item) => (
          <article key={item.id} className={styles.item}>
            <div className={styles.meta}>
              <span className={styles.source}>{item.source}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.date}>{item.date}</span>
            </div>
            <div className={styles.content}>
              <h3 className={styles.newsTitle}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                  <ExternalLink size={14} className={styles.linkIcon} />
                </a>
              </h3>
              <p className={styles.summary}>{item.summary}</p>
              
              {item.coinTags && item.coinTags.length > 0 && (
                <div className={styles.tags}>
                  {item.coinTags.map(tag => (
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
