import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateRSI, calculateMACD, calculateEMA } from '@/lib/indicators';
import { loadPrompt } from '@/lib/promptLoader';

const BINANCE_BASE_URL = 'https://api.binance.us/api/v3';

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
      { 
        model: 'gemini-flash-latest',
        generationConfig: {
          temperature: 0.2, // 분석의 일관성과 정밀도를 위해 낮게 설정
          topP: 0.8,
          topK: 40,
        }
      },
      { apiVersion: 'v1beta' }
    );

    const smcPrompt = loadPrompt('SMC_prompt.md');
    const traningPrompt = loadPrompt('traning_prompt.md');

    const combinedPrompt = `
${traningPrompt}

---

### ADDITIONAL STRICT SMC FILTERS (From SMC_prompt.md):
${smcPrompt}

---

### CURRENT MARKET DATA INPUT FOR ${symbol}:
- **Current Price**: ${latestPrice.toLocaleString()} USDT
- **Daily Context (HTF)**: RSI ${dailyRSI[dailyRSI.length - 1]?.toFixed(2)}, MACD ${dailyMACD.macdLine[dailyMACD.macdLine.length - 1]?.toFixed(4)}, EMA20 ${dailyEMA20[dailyEMA20.length - 1]?.toFixed(2)}
- **4-Hour Context (LTF)**: RSI ${fhRSI[fhRSI.length - 1]?.toFixed(2)}, MACD ${fhMACD.macdLine[fhMACD.macdLine.length - 1]?.toFixed(4)}, EMA20 ${fhEMA20[fhEMA20.length - 1]?.toFixed(2)}

### OUTPUT REQUIREMENTS & JSON SCHEMA:
Provide your final institutional-grade briefing in KOREAN.
Use the JSON schema below for the final response. Ensure the 'insights' array strictly follows the structure: 
[MARKET CONTEXT], [SETUP VALIDATION], [TRADE PLAN], [EXPERT WARNING] as defined in the master logic.

Response MUST be in this JSON format:
{
  "symbol": "${symbol}",
  "recommendation": "Strong Buy | Buy | Hold | Sell | Strong Sell | No Trade",
  "trend": "Bullish | Bearish | Neutral | Choppy",
  "insights": [
    "[MARKET CONTEXT] HTF Bias 및 현재 Killzone 상태 분석...",
    "[SETUP VALIDATION] 유동성 스윕, MSS, POI(OB/FVG/Unicorn) 확인 결과...",
    "[TRADE PLAN] 구체적인 진입가 선정 이유 및 R:R 계산 근거...",
    "[EXPERT WARNING] 리테일 함정(Inducement) 주의 및 주요 리스크 요소..."
  ],
  "entryPrice": number,
  "targetPrice": number,
  "stopLoss": number,
  "confidence": number (0.0 to 1.0)
}
    `;

    const result = await model.generateContent(combinedPrompt);
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
