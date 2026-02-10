/**
 * Technical Indicators Calculation Utility
 */

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Relative Strength Index (RSI)
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length <= period) return [];

  const rsi: number[] = new Array(prices.length).fill(0);
  let gains: number = 0;
  let losses: number = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsi[period] = 100 - (100 / (1 + avgGain / (avgLoss || 1)));

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsi[i] = 100 - (100 / (1 + avgGain / (avgLoss || 1)));
  }

  return rsi;
}

// Moving Average Convergence Divergence (MACD)
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);

  const macdLine = emaFast.map((f, i) => f - emaSlow[i]);
  const signalLine = calculateEMA(macdLine.slice(slowPeriod - 1), signalPeriod);

  // Pad signal line with zeros to match macdLine length
  const paddedSignal = new Array(macdLine.length).fill(0);
  for (let i = 0; i < signalLine.length; i++) {
    paddedSignal[i + slowPeriod - 1 + signalPeriod - 1] = signalLine[i];
  }

  const histogram = macdLine.map((m, i) => m - (paddedSignal[i] || 0));

  return { macdLine, signalLine: paddedSignal, histogram };
}

// Exponential Moving Average (EMA)
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];

  const ema: number[] = new Array(prices.length).fill(0);
  const k = 2 / (period + 1);

  // Initial SMA as first EMA value
  let sma = 0;
  for (let i = 0; i < period; i++) sma += prices[i];
  ema[period - 1] = sma / period;

  for (let i = period; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }

  return ema;
}

// Simple Moving Average (SMA)
export function calculateSMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const sma: number[] = new Array(prices.length).fill(0);

  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    sma[i] = sum / period;
  }

  return sma;
}
