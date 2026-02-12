import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateRSI, calculateMACD, calculateEMA } from '@/lib/indicators';

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchOHLCV(symbol: string, interval: string, limit: number = 100): Promise<OHLCVData[]> {
  const response = await axios.get(`${BINANCE_BASE_URL}/klines`, {
    params: {
      symbol: symbol.toUpperCase() + 'USDT',
      interval,
      limit,
    },
  });

  return response.data.map((k: (string | number)[]) => ({
    time: k[0] as number,
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
  }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'BTC';

  try {
    // 1. Fetch Daily and 4h data
    const [dailyData, fourHourData] = await Promise.all([
      fetchOHLCV(symbol, '1d', 50),
      fetchOHLCV(symbol, '4h', 50),
    ]);

    const dailyCloses = dailyData.map((d) => d.close);
    const fourHourCloses = fourHourData.map((d) => d.close);

    // 2. Calculate Indicators
    const dailyRSI = calculateRSI(dailyCloses);
    const dailyMACD = calculateMACD(dailyCloses);
    const dailyEMA20 = calculateEMA(dailyCloses, 20);

    const fhRSI = calculateRSI(fourHourCloses);
    const fhMACD = calculateMACD(fourHourCloses);
    const fhEMA20 = calculateEMA(fourHourCloses, 20);

    const latestPrice = dailyCloses[dailyCloses.length - 1];

    // 3. AI Analysis with Gemini
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({
        error: 'API_KEY_REQUIRED',
        message: 'Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.'
      }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: 'gemini-flash-latest' },
      { apiVersion: 'v1beta' }
    );

    const smcPromptContent = `
You are an **Elite Quant Trader with 15+ years of prop firm experience**, specializing in SMC (Smart Money Concepts) and ICT (Inner Circle Trader) strategies. 
Your goal is to provide **institutional-grade trading signals** with maximum precision.

### CORE ANALYSIS FRAMEWORK:
1. **Market Structure Analysis**: 
   - Identify HTF (Daily) and LTF (4H) bias.
   - Look for MSS/CHoCH (Change of Character) and BOS (Break of Structure).
2. **SMC/ICT Identification**:
   - Locate Order Blocks (OB) and Fair Value Gaps (FVG).
   - Identify Liquidity Sweeps above/below key swing points.
   - Observe Displacement in price movement.
3. **Execution Rules**:
   - Confluence Rule: Need at least 3 confluences (e.g., Sweep + MSS + FVG Retest).
   - HTF Alignment: LTF entry must align with HTF bias.
   - Killzone Check: Preferred entries during London/NY overlaps.

### INPUT DATA FOR ${symbol}:
- **Current Price**: ${latestPrice}
- **Daily Context**: RSI ${dailyRSI[dailyRSI.length - 1]?.toFixed(2)}, MACD ${dailyMACD.macdLine[dailyMACD.macdLine.length - 1]?.toFixed(4)}, EMA20 ${dailyEMA20[dailyEMA20.length - 1]?.toFixed(2)}
- **4-Hour Context**: RSI ${fhRSI[fhRSI.length - 1]?.toFixed(2)}, MACD ${fhMACD.macdLine[fhMACD.macdLine.length - 1]?.toFixed(4)}, EMA20 ${fhEMA20[fhEMA20.length - 1]?.toFixed(2)}

### OUTPUT REQUIREMENTS:
- Provide analysis in KOREAN (Insights section).
- Use professional SMC/ICT terminology (FVG, OB, BOS, MSS, Liquidity Sweep 등).
- Provide a clear recommendation and specific entry logic.
- Target Price and Stop Loss must respect technical structure (e.g., SL below/above the candle that created FVG/OB).

Response MUST be in this JSON format:
{
  "symbol": "${symbol}",
  "recommendation": "Strong Buy | Buy | Hold | Sell | Strong Sell | No Trade",
  "trend": "Bullish | Bearish | Neutral | Choppy",
  "insights": [
    "SMC 기반 추세 및 구조 분석 결과...",
    "주요 유동성(Liquidity) 및 공급/수요 존(OB/FVG) 위치...",
    "매수/매도 진입의 핵심 컨플루언스 근거(선정된 진입가 이유 포함)...",
    "주의해야 할 리스크 요소 및 세션 특징"
  ],
  "entryPrice": number,
  "targetPrice": number,
  "stopLoss": number,
  "confidence": number (0.0 to 1.0)
}
    `;

    const result = await model.generateContent(smcPromptContent);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse AI response' };

    return NextResponse.json({
      symbol,
      latestPrice,
      technical: {
        daily: { rsi: dailyRSI[dailyRSI.length - 1], macd: dailyMACD.macdLine[dailyMACD.macdLine.length - 1] },
        fourHour: { rsi: fhRSI[fhRSI.length - 1], macd: fhMACD.macdLine[fhMACD.macdLine.length - 1] }
      },
      ai: analysis
    });

  } catch (error: any) {
    console.error('AI Prediction error:', error);
    return NextResponse.json({ error: 'FAILED_TO_ANALYZE', message: error.message || '알 수 없는 오류' }, { status: 500 });
  }
}
