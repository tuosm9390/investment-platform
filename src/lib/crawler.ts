import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  imageUrl?: string;
}

export async function crawlNews(topic: string): Promise<NewsItem[]> {
  const encodedTopic = encodeURIComponent(topic);
  const url = `https://news.google.com/rss/search?q=${encodedTopic}&hl=ko&gl=KR&ceid=KR:ko`;

  console.log(`Fetching Google News RSS for topic: ${topic}`);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data, { xmlMode: true });
    const newsItems: NewsItem[] = [];

    $('item').each((index, element) => {
      if (index >= 12) return false; // Limit items

      const titleFull = $(element).find('title').text();
      const link = $(element).find('link').text();
      const pubDate = $(element).find('pubDate').text();
      const source = $(element).find('source').text();

      // Title usually comes as "Title - Source", let's clean it if needed, or keep it.
      // Google News titles are often "Headline - SourceName".
      let title = titleFull;
      if (title.includes(' - ')) {
        title = title.split(' - ').slice(0, -1).join(' - ');
      }

      // Format date (pubDate is RFC822, e.g., "Mon, 09 Feb 2026 ...")
      // Simple formatting to "YYYY-MM-DD" or similar
      const dateObj = new Date(pubDate);
      const date = dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      // Google RSS doesn't provide summary/description cleanly (it's often HTML).
      // We can use the description as summary but strip HTML tags.
      const descriptionHtml = $(element).find('description').text();
      const summary = cheerio.load(descriptionHtml).text().trim() || title;

      if (title) {
        newsItems.push({
          id: `google-rss-${index}`,
          title,
          source: source || 'Google News',
          date: date,
          summary: summary.length > 100 ? summary.substring(0, 100) + '...' : summary,
          url: link,
          // Google RSS doesn't provide images in a standard way easily compliant with simple parsing.
          // We could try to extract from description HTML if present, but often it's just text links.
          // For now, leave imageUrl undefined or use a placeholder in the UI component.
        });
      }
    });

    console.log(`Crawled ${newsItems.length} items from Google News RSS`);
    return newsItems;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('RSS Crawling failed:', error.message);
    } else {
      console.error('RSS Crawling failed:', error);
    }
    return [];
  }
}
