import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // 서버 환경에서 외부 API 호출 (CORS 영향 없음)
    const response = await axios.get('https://api.frankfurter.app/latest?from=USD&to=KRW', {
      timeout: 5000
    });
    
    if (response.data && response.data.rates && response.data.rates.KRW) {
      return NextResponse.json({ rate: response.data.rates.KRW });
    }
    
    return NextResponse.json({ rate: 1430, error: 'Invalid structure' });
  } catch (error) {
    console.error('Exchange rate API error on server:', error);
    return NextResponse.json({ rate: 1430, error: 'Fetch failed' });
  }
}
