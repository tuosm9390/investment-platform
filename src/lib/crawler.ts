import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  imageUrl?: string;
  coinTags?: string[]; // Added for impact mapping
}

const COIN_KEYWORDS: Record<string, string[]> = {
  'BTC': ['비트코인', 'bitcoin', 'btc'],
  'ETH': ['이더리움', 'ethereum', 'eth'],
  'SOL': ['솔라나', 'solana', 'sol'],
  'XRP': ['리플', 'ripple', 'xrp'],
  'DOGE': ['도지코인', 'dogecoin', 'doge'],
  'ADA': ['에이다', 'cardano', 'ada'],
  'AVAX': ['아발란체', 'avalanche', 'avax'],
  'SHIB': ['시바이누', 'shiba', 'shib'],
  'DOT': ['폴카닷', 'dot'],
  'TRX': ['트론', 'tron', 'trx']
};

// In-memory cache for news
interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
}

const newsCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

function extractCoinTags(text: string): string[] {
  const lowerText = text.toLowerCase();
  const tags = new Set<string>();

  for (const [symbol, keywords] of Object.entries(COIN_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      tags.add(symbol);
    }
  }

  return Array.from(tags);
}

export async function crawlNews(topic: string): Promise<NewsItem[]> {
  const now = Date.now();
  const cacheKey = topic.toLowerCase();

  // Check cache
  if (newsCache[cacheKey] && (now - newsCache[cacheKey].timestamp < CACHE_TTL)) {
    console.log(`Returning cached news for topic: ${topic}`);
    return newsCache[cacheKey].data;
  }

  const encodedTopic = encodeURIComponent(topic);
  const url = `https://kr.investing.com/search/?q=${encodedTopic}`;

  console.log(`Fetching Investing.com News for topic: ${topic}`);

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const content = await page.content();
    const $ = cheerio.load(content);
    
    if ($('title').text().includes('Cloudflare') || $('title').text().includes('Attention Required')) {
        console.warn('Blocked by Cloudflare while crawling Investing.com');
        return [];
    }

    const newsItems: NewsItem[] = [];

    $('.articleItem').each((index, element) => {
      if (index >= 12) return false;

      const title = $(element).find('.title').text().trim();
      const relativeLink = $(element).find('.title').attr('href');
      const link = relativeLink ? (relativeLink.startsWith('http') ? relativeLink : `https://kr.investing.com${relativeLink}`) : '';
      
      const summaryText = $(element).find('p').text().trim();
      const summary = summaryText || title;
      
      let dateText = $(element).find('.date').text().trim();
      if (!dateText) {
        const details = $(element).find('.articleDetails').text().trim();
        const dateMatch = details.match(/\d{4}년 \d{2}월 \d{2}일/);
        dateText = dateMatch ? dateMatch[0] : new Date().toLocaleDateString('ko-KR');
      }

      if (title && link) {
        // Extract tags from title and summary
        const coinTags = extractCoinTags(`${title} ${summary}`);

        newsItems.push({
          id: `investing-${index}-${Date.now()}`,
          title,
          source: 'Investing.com',
          date: dateText,
          summary: summary.length > 150 ? summary.substring(0, 150) + '...' : summary,
          url: link,
          coinTags: coinTags.length > 0 ? coinTags : undefined
        });
      }
    });

    console.log(`Crawled ${newsItems.length} items from Investing.com with tags`);
    
    // Store in cache
    newsCache[cacheKey] = {
      data: newsItems,
      timestamp: now
    };

    return newsItems;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Investing.com Crawling failed:', error.message);
    } else {
      console.error('Investing.com Crawling failed:', error);
    }
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
