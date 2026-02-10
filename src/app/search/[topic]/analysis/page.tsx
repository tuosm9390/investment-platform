import { getAnalysis } from '@/data/mockData';
import { crawlNews } from '@/lib/crawler';
import { generateAnalysisFromNews } from '@/lib/analyzer';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ topic: string }>;
}

export default async function AnalysisPage({ params }: PageProps) {
  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);

  // Try to crawl real news for analysis
  const news = await crawlNews(decodedTopic);

  let analysis;
  if (news.length > 0) {
    analysis = generateAnalysisFromNews(decodedTopic, news);
  } else {
    analysis = getAnalysis(decodedTopic);
  }

  const sentimentClass = analysis.sentiment.toLowerCase();

  return (
    <div className={styles.container}>
      <section className={styles.scoreCard}>
        <div className={styles.scoreInfo}>
          <div className={styles.label}>AI Investment Outlook</div>
          <div className={`${styles.sentiment} ${styles[sentimentClass]}`}>
            {analysis.sentiment}
          </div>
          <p className={styles.scoreDescription}>{analysis.summary}</p>
        </div>
        <div className={`${styles.scoreCircle} ${styles[sentimentClass]}`}>
          {analysis.score}
        </div>
      </section>

      <div className={styles.grid}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>핵심 투자 포인트 (Key Points)</h3>
          <ul className={styles.list}>
            {analysis.keyPoints.map((point, index) => (
              <li key={index} className={styles.listItem}>
                <span className={styles.bullet}>✓</span>
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>주의해야 할 리스크 (Risks)</h3>
          <ul className={styles.list}>
            {analysis.risks.map((point, index) => (
              <li key={index} className={styles.listItem}>
                <span className={styles.bullet} style={{ color: 'var(--danger)' }}>!</span>
                {point}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
