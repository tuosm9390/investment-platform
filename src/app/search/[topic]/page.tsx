import { getNews } from '@/data/mockData';
import { crawlNews } from '@/lib/crawler'; // Import crawler
import NewsFeed from '@/components/NewsFeed';
import SummaryCard from '@/components/SummaryCard';

interface PageProps {
  params: Promise<{ topic: string }>;
}

export default async function SearchPage({ params }: PageProps) {
  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);

  // Try crawling first, fallback to mock data if empty (or just use crawled data)
  let news = await crawlNews(decodedTopic);

  if (news.length === 0) {
    console.log('Crawling returned no results, falling back to mock data');
    news = getNews(decodedTopic);
  }

  return (
    <div>
      <SummaryCard topic={decodedTopic} news={news} />
      <NewsFeed news={news} />
    </div>
  );
}
