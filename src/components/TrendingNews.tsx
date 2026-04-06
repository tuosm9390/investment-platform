import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import type { NewsItem } from '@/lib/crawler';
import styles from './TrendingNews.module.css';

interface TrendingNewsProps {
  news: NewsItem[];
}

export const TrendingNews: React.FC<TrendingNewsProps> = ({ news }) => {
  if (!news || news.length === 0) return null;

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
