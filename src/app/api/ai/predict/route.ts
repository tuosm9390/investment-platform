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

    const prompt = `
      Analyze the ${symbol} coin for investment purposes. 
      Use technical indicators and ICT (Inner Circle Trader) concepts.
      
      Daily Data:
      - Current Price: ${latestPrice}
      - RSI (14): ${dailyRSI[dailyRSI.length - 1]?.toFixed(2)}
      - MACD: ${dailyMACD.macdLine[dailyMACD.macdLine.length - 1]?.toFixed(4)}
      - EMA (20): ${dailyEMA20[dailyEMA20.length - 1]?.toFixed(2)}
      
      4-Hour Data:
      - RSI (14): ${fhRSI[fhRSI.length - 1]?.toFixed(2)}
      - MACD: ${fhMACD.macdLine[fhMACD.macdLine.length - 1]?.toFixed(4)}
      - EMA (20): ${fhEMA20[fhEMA20.length - 1]?.toFixed(2)}
      
      Requirements:
      1. Analyze short-term (4h) and mid-term (Daily) trends.
      2. Identify key ICT concepts like Market Structure Shift (MSS), Order Blocks, or Fair Value Gaps (FVG) if applicable based on the price relation to EMA.
      3. Provide a clear investment recommendation: [Strong Buy, Buy, Hold, Sell, Strong Sell].
      4. Give 3-4 bullet point insights in KOREAN.
      5. Estimate Target Price and Stop Loss.
      
      Response format (JSON):
      {
        "symbol": "${symbol}",
        "recommendation": "Buy",
        "trend": "Bullish",
        "insights": ["...", "..."],
        "targetPrice": 0,
        "stopLoss": 0,
        "confidence": 0.8
      }
    `;

    const result = await model.generateContent(prompt);
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

  } catch (error: unknown) {
    console.error('AI Prediction error:', error);
    return NextResponse.json({ error: 'FAILED_TO_ANALYZE', message: error.message }, { status: 500 });
  }
}
