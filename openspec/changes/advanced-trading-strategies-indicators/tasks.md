## 1. Advanced Indicator Library (Core Logic)

- [x] 1.1 Create `src/lib/advanced-indicators.ts` with basic OHLCV types and utility functions.
- [x] 1.2 Implement Market Structure Detection (BOS, CHoCH) logic.
- [x] 1.3 Implement Institutional Level Detection (Order Blocks, FVG) logic.
- [x] 1.4 Implement Volume Spread Analysis (VSA) signal detection (e.g., Stopping Volume).
- [x] 1.5 Implement Volatility Contraction Pattern (VCP) scanner logic using SMAs and volatility metrics.

## 2. API and Data Integration

- [x] 2.1 Update `src/lib/prices.ts` or add a new utility to fetch granular Klines (historical candle data) from Binance.
- [x] 2.2 Add local caching for historical candle data to minimize API requests and respect rate limits.


## 3. UI and Visualization Components

- [x] 3.1 Create `src/components/ProfessionalAnalysisView.tsx` as a dedicated view for advanced metrics.
- [x] 3.2 Implement a "Smart Money" overlay for existing charts to visualize BOS, CHoCH, and Order Blocks.

- [x] 3.3 Create a "Liquidity Analysis" component to list active FVGs and liquidity gaps.

- [x] 3.4 Create a "VCP Scanner" dashboard component to display coins meeting Mark Minervini's criteria.


## 4. Integration and Refinement

- [x] 4.1 Update `src/components/MarketDashboard.tsx` to include a toggle for "Professional Mode".
- [x] 4.2 Add unit tests for SMC and VCP logic in `src/lib/advanced-indicators.test.ts`.
- [x] 4.3 Polish the UI/UX for indicator visualization (color coding, labels, and tooltips).

<!--
## 한글 번역 (Full Translation)

## 1. 고급 지표 라이브러리 (핵심 로직)
- [x] 1.1 기본 OHLCV 타입 및 유틸리티 함수를 포함한 `src/lib/advanced-indicators.ts` 생성.
- [x] 1.2 시장 구조 감지(BOS, CHoCH) 로직 구현.
- [x] 1.3 기관 레벨 감지(Order Blocks, FVG) 로직 구현.
- [x] 1.4 거래량 스프레드 분석(VSA) 신호 감지(예: Stopping Volume) 구현.
- [x] 1.5 SMA 및 변동성 메트릭을 사용한 변동성 수축 패턴(VCP) 스캐너 로직 구현.

## 2. API 및 데이터 통합
- [x] 2.1 바이낸스에서 세밀한 Klines(과거 캔들 데이터)를 가져오도록 `src/lib/prices.ts` 업데이트 또는 새로운 유틸리티 추가.
- [x] 2.2 API 요청을 최소화하고 속도 제한을 준수하기 위해 과거 캔들 데이터에 대한 로컬 캐싱 추가.

## 3. UI 및 시각화 컴포넌트
- [x] 3.1 고급 지표를 위한 전용 뷰인 `src/components/ProfessionalAnalysisView.tsx` 생성.
- [x] 3.2 BOS, CHoCH, 오더 블록을 시각화하기 위해 기존 차트에 "Smart Money" 오버레이 구현.
- [x] 3.3 활성 FVG 및 유동성 갭을 리스트업하는 "유동성 분석" 컴포넌트 생성.
- [x] 3.4 마크 미너비니의 기준을 충족하는 코인들을 표시하는 "VCP 스캐너" 대시보드 컴포넌트 생성.

## 4. 통합 및 정교화
- [x] 4.1 "전문가 모드" 토글을 포함하도록 `src/components/MarketDashboard.tsx` 업데이트.
- [x] 4.2 `src/lib/advanced-indicators.test.ts`에 SMC 및 VCP 로직에 대한 단위 테스트 추가.
- [x] 4.3 지표 시각화(색상 코딩, 라벨, 툴팁 등)를 위한 UI/UX 폴리싱.
-->


