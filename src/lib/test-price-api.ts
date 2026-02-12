
import axios from 'axios';

const USD_TO_KRW = 1350;

async function testBinance() {
  console.log('--- Testing Binance API ---');
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr', { timeout: 5000 });
    console.log('Binance Success! Sample data:', response.data.slice(0, 2));
    return true;
  } catch (error: any) {
    console.error('Binance Failed:', error.message);
    return false;
  }
}

async function testCoinCap() {
  console.log('\n--- Testing CoinCap API ---');
  try {
    const response = await axios.get('https://api.coincap.io/v2/assets?limit=10', { timeout: 5000 });
    console.log('CoinCap Success! Sample data:', response.data.data.slice(0, 2));
    return true;
  } catch (error: any) {
    console.error('CoinCap Failed:', error.message);
    return false;
  }
}

async function runTests() {
  const binanceOk = await testBinance();
  const coincapOk = await testCoinCap();

  console.log('\n--- Summary ---');
  console.log('Binance API:', binanceOk ? 'WORKING' : 'FAILED');
  console.log('CoinCap API:', coincapOk ? 'WORKING' : 'FAILED');

  if (!binanceOk && coincapOk) {
    console.log('\nResult: Fallback mechanism will be active as expected.');
  } else if (binanceOk) {
    console.log('\nResult: Primary API is working fine.');
  } else {
    console.log('\nResult: Both APIs failed. Check internet connection.');
  }
}

runTests();
