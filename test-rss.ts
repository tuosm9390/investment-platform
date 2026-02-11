import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const topic = '비트코인';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=ko&gl=KR&ceid=KR:ko`;

  console.log('Fetching RSS:', url);

  try {
    const response = await axios.get(url);
    console.log('Status:', response.status);

    const $ = cheerio.load(response.data, { xmlMode: true });
    const items = $('item');

    console.log(`Found ${items.length} items`);

    items.each((i, el) => {
      if (i < 3) {
        const title = $(el).find('title').text();
        const link = $(el).find('link').text();
        const pubDate = $(el).find('pubDate').text();
        const source = $(el).find('source').text();

        console.log(`[${i}] ${title} (${source}) - ${pubDate}`);
        console.log(`    Link: ${link}`);
      }
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('Failed:', error.message);
    } else {
        console.error('Failed:', error);
    }
  }
}

test();
