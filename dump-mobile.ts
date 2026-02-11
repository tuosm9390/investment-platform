import axios from 'axios';
import * as fs from 'fs';

async function test() {
  const topic = '비트코인';
  const query = encodeURIComponent(topic);
  const url = `https://m.search.naver.com/search.naver?where=m_news&sm=mtb_jum&query=${query}`;

  console.log('Fetching URL:', url);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    console.log('Status:', response.status);
    fs.writeFileSync('naver-search-mobile.html', response.data);
    console.log('Saved HTML to naver-search-mobile.html');

  } catch (error: unknown) {
    console.error('Failed:', error.message);
  }
}

test();
