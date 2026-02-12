import axios from 'axios';
import * as fs from 'fs';

async function test() {
  const topic = '비트코인';
  const query = encodeURIComponent(topic);
  const url = `https://search.naver.com/search.naver?where=news&query=${query}&sm=tab_opt&sort=1&photo=0&field=0&pd=0&ds=&de=&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Add%2Cp%3Aall%2Ca%3Aall&is_sug_officeid=0`;

  console.log('Fetching URL:', url);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      },
    });

    console.log('Status:', response.status);
    fs.writeFileSync('naver-search.html', response.data);
    console.log('Saved HTML to naver-search.html');

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed:', error.message);
    } else {
      console.error('Failed:', error);
    }
  }
}

test();
