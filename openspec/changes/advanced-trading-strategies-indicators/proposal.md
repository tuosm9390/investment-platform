## Why

The current platform provides basic stock analysis, but sophisticated investors and prop traders require more advanced indicators to identify institutional activity and market structure changes. High-level trading strategies like Smart Money Concepts (SMC), Volume Spread Analysis (VSA), and Volatility Contraction Pattern (VCP) are essential for modern trading, especially for passing prop firm evaluations. Implementing these advanced metrics will provide a significant competitive advantage to our users.

## What Changes

- **Advanced Indicator Suite**: Introduce a new set of indicators derived from professional prop trading strategies.
- **SMC Implementation**: Automatic detection of Market Structure (BOS, CHoCH), Order Blocks, and Fair Value Gaps (FVG).
- **VSA Enhancement**: Integration of Volume Spread Analysis to identify accumulation, distribution, and shakeouts.
- **VCP Scanner**: Implementation of Mark Minervini's Volatility Contraction Pattern to identify high-probability Stage 2 breakout setups.
- **Institutional Flow Dashboard**: A new dashboard view focusing on liquidity pools and institutional order flow.

## Capabilities

### New Capabilities
- `smc-market-structure`: Automatic detection and plotting of Break of Structure (BOS) and Change of Character (CHoCH).
- `institutional-liquidity-zones`: Identification of Order Blocks and Fair Value Gaps (FVG) where "Smart Money" is likely active.
- `volume-spread-analysis`: Indicators that analyze the relationship between volume, spread, and price action (e.g., Stopping Volume, No Demand).
- `vcp-pattern-recognition`: Detection of volatility contraction sequences and pivot points for breakout setups.

### Modified Capabilities
- `investment-dashboard`: Enhance the existing dashboard to support toggling and visualization of advanced indicators.

## Impact

- **Frontend**: New UI components for advanced charts and indicator settings.
- **Backend/Lib**: New analytical libraries in `src/lib/indicators.ts` or a new `advanced-indicators.ts` to calculate SMC, VSA, and VCP metrics.
- **Data**: Potential need for more granular volume and price data to accurately calculate VSA and SMC levels.

<!--
## 한글 번역 (Full Translation)

## 왜 (Why)
현재 플랫폼은 기본적인 주식 분석을 제공하지만, 정교한 투자자와 프랍 트레이더들은 기관의 활동과 시장 구조의 변화를 식별하기 위해 더 발전된 지표를 필요로 합니다. 스마트 머니 컨셉(SMC), 거래량 스프레드 분석(VSA), 변동성 수축 패턴(VCP)과 같은 높은 수준의 트레이딩 전략은 현대 트레이딩, 특히 프랍 트레이딩 회사의 평가를 통과하는 데 필수적입니다. 이러한 고급 지표를 구현함으로써 우리 사용자들에게 상당한 경쟁 우위를 제공할 것입니다.

## 무엇이 변하는가 (What Changes)
- **고급 지표 스위트**: 전문 프랍 트레이딩 전략에서 파생된 새로운 지표 세트를 도입합니다.
- **SMC 구현**: 시장 구조(BOS, CHoCH), 오더 블록(Order Blocks), 공정가치 갭(FVG)의 자동 감지.
- **VSA 강화**: 매집, 분산, 셰이크아웃(Shakeouts)을 식별하기 위한 거래량 스프레드 분석 통합.
- **VCP 스캐너**: 고확률 2단계 돌파 셋업을 식별하기 위한 마크 미너비니의 변동성 수축 패턴 구현.
- **기관 흐름 대시보드**: 유동성 풀과 기관의 주문 흐름에 초점을 맞춘 새로운 대시보드 뷰.

## 역량 (Capabilities)

### 새로운 역량 (New Capabilities)
- `smc-market-structure`: 구조 돌파(BOS) 및 성격 변화(CHoCH)의 자동 감지 및 플로팅.
- `institutional-liquidity-zones`: "스마트 머니"가 활성화될 가능성이 높은 오더 블록(Order Blocks) 및 공정가치 갭(FVG) 식별.
- `volume-spread-analysis`: 거래량, 스프레드, 가격 작용 사이의 관계를 분석하는 지표(예: Stopping Volume, No Demand).
- `vcp-pattern-recognition`: 돌파 셋업을 위한 변동성 수축 시퀀스 및 피벗 포인트 감지.

### 수정된 역량 (Modified Capabilities)
- `investment-dashboard`: 고급 지표의 토글 및 시각화를 지원하도록 기존 대시보드를 강화합니다.

## 영향 (Impact)
- **프론트엔드**: 고급 차트 및 지표 설정을 위한 새로운 UI 컴포넌트.
- **백엔드/라이브러리**: SMC, VSA, VCP 지표를 계산하기 위한 `src/lib/indicators.ts` 내의 새로운 분석 라이브러리 또는 새로운 `advanced-indicators.ts`.
- **데이터**: VSA 및 SMC 레벨을 정확하게 계산하기 위해 더 세밀한 거래량 및 가격 데이터가 필요할 수 있음.
-->

