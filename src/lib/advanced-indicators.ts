/**
 * Advanced Trading Indicators
 * Smart Money Concepts (SMC), Volume Spread Analysis (VSA),
 * and Volatility Contraction Pattern (VCP).
 */

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketStructure {
  type: "BOS" | "CHoCH";
  direction: "bullish" | "bearish";
  price: number;
  time: number;
}

export interface OrderBlock {
  type: "bullish" | "bearish";
  top: number;
  bottom: number;
  startTime: number;
  mitigated: boolean;
  mitigationTime?: number;
}

export interface FVG {
  type: "bullish" | "bearish";
  top: number;
  bottom: number;
  time: number;
  mitigated: boolean;
}

export interface VSASignal {
  type: "Stopping Volume" | "No Demand" | "No Supply" | "Shakeout";
  time: number;
  price: number;
}

/**
 * Utility to identify swing highs and lows
 */
export function identifySwings(
  data: OHLCV[],
  leftStrength: number = 2,
  rightStrength: number = 2,
) {
  const highs: { price: number; time: number; index: number }[] = [];
  const lows: { price: number; time: number; index: number }[] = [];

  for (let i = leftStrength; i < data.length - rightStrength; i++) {
    const current = data[i];
    let isHigh = true;
    let isLow = true;

    for (let j = 1; j <= leftStrength; j++) {
      if (data[i - j].high >= current.high) isHigh = false;
      if (data[i - j].low <= current.low) isLow = false;
    }
    for (let j = 1; j <= rightStrength; j++) {
      if (data[i + j].high > current.high) isHigh = false;
      if (data[i + j].low < current.low) isLow = false;
    }

    if (isHigh)
      highs.push({ price: current.high, time: current.time, index: i });
    if (isLow) lows.push({ price: current.low, time: current.time, index: i });
  }

  return { highs, lows };
}

/**
 * Basic Trend Identification
 */
export function detectTrend(
  data: OHLCV[],
  period: number = 50,
): "bullish" | "bearish" | "sideways" {
  if (data.length < period) return "sideways";

  const lastPrice = data[data.length - 1].close;
  let sum = 0;
  for (let i = data.length - period; i < data.length; i++) {
    sum += data[i].close;
  }
  const sma = sum / period;

  if (lastPrice > sma * 1.02) return "bullish";
  if (lastPrice < sma * 0.98) return "bearish";
  return "sideways";
}

/**
 * Detect Market Structure (BOS, CHoCH)
 */
export function detectMarketStructure(data: OHLCV[]): MarketStructure[] {
  const { highs, lows } = identifySwings(data);
  const structures: MarketStructure[] = [];

  if (highs.length < 2 || lows.length < 2) return [];

  let currentTrend: "bullish" | "bearish" | null = null;
  let lastConfirmedHigh = highs[0].price;
  let lastConfirmedLow = lows[0].price;

  for (let i = 1; i < data.length; i++) {
    const candle = data[i];

    // Bullish Trend Logic
    if (currentTrend === "bullish") {
      // BOS (Break of Structure) - Continuation
      if (candle.close > lastConfirmedHigh) {
        structures.push({
          type: "BOS",
          direction: "bullish",
          price: lastConfirmedHigh,
          time: candle.time,
        });
        // Update high from swings occurring before this candle
        const nextHigh = highs.find((h) => h.index >= i - 5 && h.index <= i);
        if (nextHigh) lastConfirmedHigh = nextHigh.price;
      }
      // CHoCH (Change of Character) - Reversal
      else if (candle.close < lastConfirmedLow) {
        structures.push({
          type: "CHoCH",
          direction: "bearish",
          price: lastConfirmedLow,
          time: candle.time,
        });
        currentTrend = "bearish";
        const nextLow = lows.find((l) => l.index >= i - 5 && l.index <= i);
        if (nextLow) lastConfirmedLow = nextLow.price;
      }
    }
    // Bearish Trend Logic
    else if (currentTrend === "bearish") {
      // BOS - Continuation
      if (candle.close < lastConfirmedLow) {
        structures.push({
          type: "BOS",
          direction: "bearish",
          price: lastConfirmedLow,
          time: candle.time,
        });
        const nextLow = lows.find((l) => l.index >= i - 5 && l.index <= i);
        if (nextLow) lastConfirmedLow = nextLow.price;
      }
      // CHoCH - Reversal
      else if (candle.close > lastConfirmedHigh) {
        structures.push({
          type: "CHoCH",
          direction: "bullish",
          price: lastConfirmedHigh,
          time: candle.time,
        });
        currentTrend = "bullish";
        const nextHigh = highs.find((h) => h.index >= i - 5 && h.index <= i);
        if (nextHigh) lastConfirmedHigh = nextHigh.price;
      }
    }
    // Initial Trend Detection
    else {
      if (candle.close > lastConfirmedHigh) currentTrend = "bullish";
      else if (candle.close < lastConfirmedLow) currentTrend = "bearish";
    }
  }

  return structures;
}

/**
 * Detect Order Blocks (OB)
 */
export function detectOrderBlocks(data: OHLCV[]): OrderBlock[] {
  const obs: OrderBlock[] = [];
  const lookback = 5;

  for (let i = 1; i < data.length - lookback; i++) {
    const current = data[i];

    // Bullish OB: Bearish candle before a strong bullish move
    if (current.close < current.open) {
      let isStrongMove = true;
      let moveSize = 0;
      for (let j = 1; j <= lookback; j++) {
        const next = data[i + j];
        if (next.close <= current.high) isStrongMove = false;
        moveSize += next.close - next.open;
      }

      if (isStrongMove && moveSize > 0) {
        obs.push({
          type: "bullish",
          top: current.high,
          bottom: current.low,
          startTime: current.time,
          mitigated: false,
        });
      }
    }
    // Bearish OB: Bullish candle before a strong bearish move
    else if (current.close > current.open) {
      let isStrongMove = true;
      let moveSize = 0;
      for (let j = 1; j <= lookback; j++) {
        const next = data[i + j];
        if (next.close >= current.low) isStrongMove = false;
        moveSize += next.open - next.close;
      }

      if (isStrongMove && moveSize > 0) {
        obs.push({
          type: "bearish",
          top: current.high,
          bottom: current.low,
          startTime: current.time,
          mitigated: false,
        });
      }
    }
  }

  // Update mitigation status based on subsequent price action
  for (const ob of obs) {
    const obIndex = data.findIndex((d) => d.time === ob.startTime);
    for (let j = obIndex + lookback + 1; j < data.length; j++) {
      if (ob.type === "bullish" && data[j].low <= ob.top) {
        ob.mitigated = true;
        ob.mitigationTime = data[j].time;
        break;
      } else if (ob.type === "bearish" && data[j].high >= ob.bottom) {
        ob.mitigated = true;
        ob.mitigationTime = data[j].time;
        break;
      }
    }
  }

  return obs;
}

/**
 * Detect Fair Value Gaps (FVG)
 */
export function detectFVGs(data: OHLCV[]): FVG[] {
  const fvgs: FVG[] = [];

  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1];
    const next = data[i + 1];

    // Bullish FVG
    if (next.low > prev.high) {
      fvgs.push({
        type: "bullish",
        top: next.low,
        bottom: prev.high,
        time: data[i].time,
        mitigated: false,
      });
    }
    // Bearish FVG
    else if (next.high < prev.low) {
      fvgs.push({
        type: "bearish",
        top: prev.low,
        bottom: next.high,
        time: data[i].time,
        mitigated: false,
      });
    }
  }

  // Mitigation check
  for (const fvg of fvgs) {
    const fvgIndex = data.findIndex((d) => d.time === fvg.time);
    for (let j = fvgIndex + 2; j < data.length; j++) {
      if (fvg.type === "bullish" && data[j].low <= fvg.bottom) {
        fvg.mitigated = true;
        break;
      } else if (fvg.type === "bearish" && data[j].high >= fvg.top) {
        fvg.mitigated = true;
        break;
      }
    }
  }

  return fvgs;
}

/**
 * Detect VSA Signals
 */
export function detectVSASignals(data: OHLCV[]): VSASignal[] {
  const signals: VSASignal[] = [];
  const avgVolLookback = 20;

  for (let i = avgVolLookback; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];

    let volSum = 0;
    for (let j = 1; j <= avgVolLookback; j++) volSum += data[i - j].volume;
    const avgVol = volSum / avgVolLookback;

    const spread = current.high - current.low;
    const bodySize = Math.abs(current.close - current.open);
    const isHighVolume = current.volume > avgVol * 1.5;
    const isLowVolume = current.volume < avgVol * 0.7;
    const isNarrowSpread = spread < (data[i - 1].high - data[i - 1].low) * 0.8;

    // Stopping Volume: High volume, narrow spread, after a down move
    if (isHighVolume && isNarrowSpread && current.close < prev.close) {
      signals.push({
        type: "Stopping Volume",
        time: current.time,
        price: current.low,
      });
    }
    // No Demand: Low volume, bullish candle with narrow spread
    else if (isLowVolume && isNarrowSpread && current.close > current.open) {
      signals.push({
        type: "No Demand",
        time: current.time,
        price: current.high,
      });
    }
    // Shakeout: High volume, long lower wick, close near high after a dip
    else if (
      isHighVolume &&
      current.close - current.low > (current.high - current.low) * 0.6 &&
      current.open > current.low
    ) {
      signals.push({
        type: "Shakeout",
        time: current.time,
        price: current.low,
      });
    }
  }

  return signals;
}

/**
 * Detect Volatility Contraction Pattern (VCP)
 */
export function detectVCP(data: OHLCV[]) {
  if (data.length < 250) return { isStage2: false, isNarrowing: false, pullbacks: [], isVCP: false };

  const closes = data.map((d) => d.close);
  const sma50 = calculateSMA(closes, 50);
  const sma150 = calculateSMA(closes, 150);
  const sma200 = calculateSMA(closes, 200);

  const lastIndex = data.length - 1;
  const currentPrice = data[lastIndex].close;

  // Stage 2 Criteria (Minervini)
  const isAboveSMAs =
    currentPrice > sma150[lastIndex] && currentPrice > sma200[lastIndex];
  const isSMAsAligned =
    sma50[lastIndex] > sma150[lastIndex] &&
    sma150[lastIndex] > sma200[lastIndex];
  const isSMA200Trending = sma200[lastIndex] > sma200[lastIndex - 20]; // Up for ~1 month

  const low52Week = Math.min(...closes.slice(-250));
  const high52Week = Math.max(...closes.slice(-250));
  const isAboveLow = currentPrice > low52Week * 1.3; // At least 30% above low
  const nearHigh = currentPrice > high52Week * 0.75; // Within 25% of high

  const isStage2 =
    isAboveSMAs && isSMAsAligned && isSMA200Trending && isAboveLow && nearHigh;

  // Simple VCP Contraction Logic (Looking for narrowing pullbacks)
  const pullbacks: number[] = [];
  let currentMax = 0;
  let currentMin = Infinity;
  let inPullback = false;

  for (let i = data.length - 100; i < data.length; i++) {
    const price = data[i].high;
    if (price > currentMax) {
      if (inPullback) {
        pullbacks.push((currentMax - currentMin) / currentMax);
      }
      currentMax = price;
      currentMin = price;
      inPullback = false;
    } else {
      inPullback = true;
      if (data[i].low < currentMin) currentMin = data[i].low;
    }
  }

  // Check if pullbacks are narrowing
  const isNarrowing =
    pullbacks.length >= 2 &&
    pullbacks.slice(-3).every((p, i, arr) => i === 0 || p <= arr[i - 1] * 1.1);

  return {
    isStage2,
    isNarrowing,
    pullbacks: pullbacks.slice(-4),
    isVCP: isStage2 && isNarrowing,
  };
}

// Helper SMA from standard indicators (re-implemented here for independence or import)
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = new Array(prices.length).fill(0);
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += prices[i - j];
    sma[i] = sum / period;
  }
  return sma;
}
