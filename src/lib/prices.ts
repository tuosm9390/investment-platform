import axios from 'axios';

// Helper function for delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price_krw: number;
  current_price_usd: number;
  price_change_percentage_24h: number;
  volume_24h: number; // Trading volume in USD
  quote_volume: number; // Quote volume (USDT)
}

export interface StockPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

// Binance API response interfaces
interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
}

// Exchange rate (approximate)
const USD_TO_KRW = 1350;

// Filter types
export type FilterType = 'volume' | 'price' | 'gainers' | 'losers';

// Common coin name mapping for display
const COIN_NAMES: Record<string, string> = {
  'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'BNB': 'BNB', 'XRP': 'XRP',
  'SOL': 'Solana', 'DOGE': 'Dogecoin', 'ADA': 'Cardano', 'AVAX': 'Avalanche',
  'SHIB': 'Shiba Inu', 'DOT': 'Polkadot', 'MATIC': 'Polygon', 'LTC': 'Litecoin',
  'LINK': 'Chainlink', 'UNI': 'Uniswap', 'ATOM': 'Cosmos', 'TRX': 'TRON',
  'ETC': 'Ethereum Classic', 'XLM': 'Stellar', 'BCH': 'Bitcoin Cash',
  'FIL': 'Filecoin', 'NEAR': 'NEAR Protocol', 'APT': 'Aptos', 'ARB': 'Arbitrum',
  'OP': 'Optimism', 'PEPE': 'Pepe', 'WIF': 'dogwifhat', 'BONK': 'Bonk',
  'FLOKI': 'Floki', 'SUI': 'Sui', 'SEI': 'Sei', 'INJ': 'Injective',
  'FET': 'Fetch.ai', 'RNDR': 'Render', 'IMX': 'Immutable X', 'STX': 'Stacks',
  'GALA': 'Gala', 'SAND': 'The Sandbox', 'MANA': 'Decentraland', 'AXS': 'Axie Infinity',
  'THETA': 'Theta', 'VET': 'VeChain', 'ALGO': 'Algorand', 'HBAR': 'Hedera',
};

// Fetch prices from CoinCap as a fallback
async function getCryptoPricesCoinCap(): Promise<PriceData[]> {
  try {
    const response = await axios.get('https://api.coincap.io/v2/assets?limit=100');
    const data = response.data.data;

    return data.map((coin: any) => {
      const symbol = coin.symbol.toLowerCase();
      const priceUsd = parseFloat(coin.priceUsd);
      return {
        id: symbol,
        symbol: symbol,
        name: coin.name,
        current_price_usd: priceUsd,
        current_price_krw: priceUsd * USD_TO_KRW,
        price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
        volume_24h: parseFloat(coin.volumeUsd24Hr),
        quote_volume: parseFloat(coin.volumeUsd24Hr), // Using volumeUsd as quote volume for CoinCap
      };
    });
  } catch (error) {
    console.error('Failed to fetch from CoinCap:', error);
    return [];
  }
}

// Fetch ALL USDT pairs from Binance
export async function getCryptoPrices(): Promise<PriceData[]> {
  const MAX_RETRIES = 2; // Reduced retries for faster fallback
  const RETRY_DELAY_MS = 1000;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
        timeout: 5000 // Add timeout to fail fast
      });
      const tickers: BinanceTicker[] = response.data;

      const usdtPairs = tickers.filter((ticker) => {
        const symbol = ticker.symbol;
        if (!symbol.endsWith('USDT')) return false;
        const base = symbol.replace('USDT', '');
        const excludeList = ['USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FDUSD', 'EUR', 'GBP', 'UP', 'DOWN', 'BEAR', 'BULL'];
        if (excludeList.some(ex => base.includes(ex))) return false;
        if (base.length > 6) return false;
        return true;
      });

      const result = usdtPairs.map((ticker) => {
        const symbol = ticker.symbol.replace('USDT', '');
        const priceUsd = parseFloat(ticker.lastPrice);
        const volume = parseFloat(ticker.volume);
        const quoteVolume = parseFloat(ticker.quoteVolume);

        return {
          id: symbol.toLowerCase(),
          symbol: symbol.toLowerCase(),
          name: COIN_NAMES[symbol] || symbol,
          current_price_usd: priceUsd,
          current_price_krw: priceUsd * USD_TO_KRW,
          price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
          volume_24h: volume,
          quote_volume: quoteVolume,
        };
      });

      if (result.length > 0) return result;
    } catch (error: any) {
      console.warn(`Binance attempt ${i + 1} failed: ${error.message}`);
      if (i < MAX_RETRIES - 1) await delay(RETRY_DELAY_MS);
    }
  }

  // Fallback to CoinCap if Binance fails
  console.log('Falling back to CoinCap API...');
  return getCryptoPricesCoinCap();
}

// Sort and filter crypto data
export function filterCryptoData(data: PriceData[], filter: FilterType, limit: number = 30): PriceData[] {
  let sorted: PriceData[];

  switch (filter) {
    case 'volume':
      // Sort by trading volume (quote volume in USDT)
      sorted = [...data].sort((a, b) => b.quote_volume - a.quote_volume);
      break;
    case 'price':
      // Sort by current price (highest first)
      sorted = [...data].sort((a, b) => b.current_price_usd - a.current_price_usd);
      break;
    case 'gainers':
      // Top gainers (highest positive change)
      sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      break;
    case 'losers':
      // Top losers (highest negative change)
      sorted = [...data].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
      break;
    default:
      sorted = data;
  }

  return sorted.slice(0, limit);
}

// Mock stock data
export function getStockPrices(): StockPriceData[] {
  return [
    { id: 'samsung', symbol: '005930', name: '삼성전자', current_price: 78500, price_change_percentage_24h: 1.2 },
    { id: 'sk-hynix', symbol: '000660', name: 'SK하이닉스', current_price: 142000, price_change_percentage_24h: -0.8 },
    { id: 'lg-energy', symbol: '373220', name: 'LG에너지솔루션', current_price: 412000, price_change_percentage_24h: 0.5 },
    { id: 'hyundai-motor', symbol: '005380', name: '현대자동차', current_price: 215000, price_change_percentage_24h: 2.1 },
    { id: 'naver', symbol: '035420', name: 'NAVER', current_price: 198000, price_change_percentage_24h: 0.3 },
    { id: 'kakao', symbol: '035720', name: '카카오', current_price: 51200, price_change_percentage_24h: -0.2 },
  ];
}

// TradingView symbol mapping
export function getTradingViewSymbol(cryptoId: string): string {
  return `BINANCE:${cryptoId.toUpperCase()}USDT`;
}

// Binance WebSocket stream URL for real-time prices
export const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';

// Exchange rate constant
export const KRW_RATE = USD_TO_KRW;
