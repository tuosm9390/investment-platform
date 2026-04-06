## Context

The current `investment-platform` provides basic technical indicators (RSI, MACD, EMA, SMA) in `src/lib/indicators.ts`. The `MarketDashboard` focuses on 24-hour ticker data from Binance. To cater to professional traders and prop firm candidates, the platform needs to transition from basic retail indicators to institutional-grade analysis tools like Smart Money Concepts (SMC), Volume Spread Analysis (VSA), and Volatility Contraction Pattern (VCP).

## Goals / Non-Goals

**Goals:**
- Implement a suite of advanced analytical functions for SMC, VSA, and VCP.
- Integrate these indicators into a new specialized "Professional Analysis" view or enhance the existing dashboard.
- Provide automatic detection of institutional levels (Order Blocks, FVG).
- Implement a VCP scanner to find stocks/coins in Stage 2 tightening phases.

**Non-Goals:**
- Real-time order execution or trading (this is an analysis platform).
- Backtesting engine implementation (out of scope for this change).
- Paid subscription/gatekeeping of these indicators.

## Decisions

- **Architecture: Separate Lib for Advanced Metrics**: I will create `src/lib/advanced-indicators.ts` to host the complex logic for SMC and VCP. This keeps `src/lib/indicators.ts` clean for standard retail indicators.
- **Data Requirement: Granular OHLCV**: VSA and SMC require high-resolution OHLCV data. I will use the Binance Klines API (`/api/v3/klines`) to fetch historical candle data (1h, 4h, 1d) for these calculations, rather than just 24h ticker data.
- **SMC Detection Logic**: 
  - **Market Structure**: Compare recent highs/lows to identify BOS (Break of Structure) and CHoCH (Change of Character).
  - **Order Blocks**: Identify high-volume candles that precede a strong move, which haven't been "mitigated" (revisited) yet.
  - **FVG**: Identify gaps between the high of bar $n-1$ and low of bar $n+1$ in a large directional move.
- **VCP Scanner**: Implement Mark Minervini's criteria:
  - Price above 150-day and 200-day SMA.
  - 200-day SMA trending up for at least 1 month.
  - Current price at least 30% above 52-week low.
  - Price within 25% of 52-week high.
  - Volatility contraction: sequential pullbacks (T1, T2, T3) with decreasing depth.

## Risks / Trade-offs

- **[Risk] High Computation Cost**: Calculating SMC/VCP on many symbols client-side might cause UI lag.
  - **Mitigation**: Use Web Workers for calculation or limit the scanner to top 50 symbols. Use memoization for results.
- **[Risk] Data API Rate Limits**: Fetching Klines for multiple symbols might hit Binance rate limits.
  - **Mitigation**: Batch requests and implement a simple local cache (session storage or indexedDB) for candle data.
- **[Risk] Subjectivity in Patterns**: SMC and VCP can be subjective.
  - **Mitigation**: Use strict mathematical definitions (e.g., % depth for VCP, specific candle patterns for OB) and allow users to adjust sensitivity parameters.

<!--
## 한글 번역 (Full Translation)

## 컨텍스트 (Context)
현재 `investment-platform`은 `src/lib/indicators.ts`에서 기본적인 기술적 지표(RSI, MACD, EMA, SMA)를 제공합니다. `MarketDashboard`는 바이낸스의 24시간 티커 데이터에 집중되어 있습니다. 전문 트레이더와 프랍 트레이딩 회사 지망생들을 만족시키기 위해, 플랫폼은 기본적인 개인 투자자용 지표에서 스마트 머니 컨셉(SMC), 거래량 스프레드 분석(VSA), 변동성 수축 패턴(VCP)과 같은 기관급 분석 도구로 전환할 필요가 있습니다.

## 목표 / 비목표 (Goals / Non-Goals)

**목표 (Goals):**
- SMC, VSA, VCP를 위한 고급 분석 함수 세트 구현.
- 이러한 지표들을 새로운 전문 분석 뷰에 통합하거나 기존 대시보드 강화.
- 기관 레벨(Order Blocks, FVG)의 자동 감지 제공.
- 2단계 타이트닝 단계에 있는 주식/코인을 찾기 위한 VCP 스캐너 구현.

**비목표 (Non-Goals):**
- 실시간 주문 실행 또는 트레이딩 (이것은 분석 플랫폼입니다).
- 백테스팅 엔진 구현 (이 변경 범위 밖임).
- 이러한 지표들에 대한 유료 구독 또는 접근 제한.

## 결정 사항 (Decisions)

- **아키텍처: 고급 메트릭을 위한 라이브러리 분리**: SMC 및 VCP에 대한 복잡한 로직을 호스팅하기 위해 `src/lib/advanced-indicators.ts`를 생성합니다. 이는 기존의 표준 소매 지표들을 위해 `src/lib/indicators.ts`를 깔끔하게 유지하기 위함입니다.
- **데이터 요구사항: 세밀한 OHLCV**: VSA 및 SMC는 고해상도 OHLCV 데이터가 필요합니다. 단순히 24시간 티커 데이터보다는 이러한 계산을 위해 바이낸스 Klines API(/api/v3/klines)를 사용하여 과거 캔들 데이터(1h, 4h, 1d)를 가져올 것입니다.
- **SMC 감지 로직**:
  - **시장 구조**: 최근 고점/저점을 비교하여 구조 돌파(BOS) 및 성격 변화(CHoCH)를 식별합니다.
  - **오더 블록 (Order Blocks)**: 강력한 움직임 이전에 발생한 고거래량 캔들 중 아직 "완화(mitigated)"(재방문)되지 않은 캔들을 식별합니다.
  - **FVG**: 큰 방향성 움직임에서 캔들 n-1의 고점과 캔들 n+1의 저점 사이의 갭을 식별합니다.
- **VCP 스캐너**: 마크 미너비니의 기준을 구현합니다:
  - 가격이 150일 및 200일 SMA 위에 있어야 함.
  - 200일 SMA가 최소 1개월 동안 상승 추세여야 함.
  - 현재 가격이 52주 최저점보다 최소 30% 높아야 함.
  - 가격이 52주 최고점의 25% 이내여야 함.
  - 변동성 수축: 깊이가 줄어드는 연속적인 눌림(T1, T2, T3).

## 리스크 / 트레이드오프 (Risks / Trade-offs)

- **[리스크] 높은 계산 비용**: 많은 심볼에 대해 클라이언트 측에서 SMC/VCP를 계산하면 UI 지연이 발생할 수 있습니다.
  - **완화**: 계산을 위해 Web Workers를 사용하거나 스캐너를 상위 50개 심볼로 제한합니다. 결과에 메모이제이션(memoization)을 사용합니다.
- **[리스크] 데이터 API 속도 제한**: 여러 심볼에 대해 Klines를 요청하면 바이낸스 속도 제한에 걸릴 수 있습니다.
  - **완화**: 요청을 일괄 처리(Batch)하고 캔들 데이터를 위해 간단한 로컬 캐시(세션 스토리지 또는 indexedDB)를 구현합니다.
- **[리스크] 패턴의 주관성**: SMC 및 VCP는 주관적일 수 있습니다.
  - **완화**: 엄격한 수학적 정의(예: VCP 깊이 %, OB를 위한 특정 캔들 패턴)를 사용하고 사용자가 민감도 파라미터를 조정할 수 있도록 합니다.
-->

