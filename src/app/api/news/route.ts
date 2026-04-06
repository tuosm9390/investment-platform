import { NextRequest, NextResponse } from 'next/server';
import { crawlNews } from '@/lib/crawler';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || 'crypto';

  try {
    const news = await crawlNews(topic);
    return NextResponse.json(news);
  } catch (error) {
    console.error('API News fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
