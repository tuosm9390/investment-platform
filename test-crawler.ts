import { crawlNews } from './src/lib/crawler';
import * as fs from 'fs';

async function test() {
  const logs: string[] = [];
  const log = (...args: unknown[]) => {
    console.log(...args);
    logs.push(args.map(a => JSON.stringify(a, null, 2)).join(' '));
  };

  log('Testing crawler with keyword "비트코인"...');
  try {
    const results = await crawlNews('비트코인');
    log('Results count:', results.length);

    if (results.length > 0) {
      log('First item:', results[0]);
    } else {
      log('No results found.');
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
        log('Error:', e.message);
    } else {
        log('Error:', e);
    }
  }

  fs.writeFileSync('crawler-log.txt', logs.join('\n'));
}

test();
