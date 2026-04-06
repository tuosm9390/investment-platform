import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { detectMarketStructure, detectVCP, OHLCV } from "./advanced-indicators";

describe("Advanced Indicators Logic", () => {
  // Create zigzag data to ensure swing highs/lows are detected
  const mockData: OHLCV[] = Array.from({ length: 300 }, (_, i) => {
    const basePrice = 100 + i;
    const zigzag = i % 10 === 0 ? 5 : i % 10 === 5 ? -5 : 0;
    return {
      time: i * 3600,
      open: basePrice + zigzag,
      high: basePrice + zigzag + 2,
      low: basePrice + zigzag - 2,
      close: basePrice + zigzag + 1,
      volume: 1000,
    };
  });

  test("detectMarketStructure identifies BOS in a simple trend", () => {
    const structures = detectMarketStructure(mockData);
    assert.ok(structures.length > 0, "Should detect at least one structure");
    assert.strictEqual(
      structures[0].type,
      "BOS",
      "First structure should be BOS",
    );
  });

  test("detectVCP identifies Stage 2 criteria", () => {
    const result = detectVCP(mockData);
    assert.ok(result !== undefined, "Result should be defined");
    // Since mockData is strictly increasing, it should meet Stage 2 trend criteria
    assert.strictEqual(
      result.isStage2,
      true,
      "Should be identified as Stage 2",
    );
  });

  test("detectVCP detects narrowing volatility", () => {
    const contractingData: OHLCV[] = [];
    let price = 100;
    for (let i = 0; i < 300; i++) {
      const volatility = i > 250 ? 2 : 10;
      contractingData.push({
        time: i,
        open: price,
        high: price + volatility,
        low: price - volatility,
        close: price + volatility / 2,
        volume: 1000,
      });
      price += 1;
    }

    const result = detectVCP(contractingData);
    assert.ok(
      result.pullbacks && result.pullbacks.length > 0,
      "Should detect pullbacks",
    );
  });
});
