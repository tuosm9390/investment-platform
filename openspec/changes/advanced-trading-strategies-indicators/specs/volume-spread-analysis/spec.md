## ADDED Requirements

### Requirement: VSA Signal Detection
The system SHALL identify key Volume Spread Analysis (VSA) signals by comparing candle spread and volume.

#### Scenario: Stopping Volume Detection
- **WHEN** a high-volume bearish candle has a very narrow spread near a support level
- **THEN** the system SHALL label the candle as "Stopping Volume", indicating professional buying

#### Scenario: No Demand Detection
- **WHEN** a low-volume bullish candle has a narrow spread near a resistance level
- **THEN** the system SHALL label the candle as "No Demand", indicating a lack of professional buying interest

<!--
## 한글 번역 (Full Translation)

## 추가된 요구사항 (ADDED Requirements)

### 요구사항: VSA 신호 감지
시스템은 캔들의 스프레드와 거래량을 비교하여 주요 거래량 스프레드 분석(VSA) 신호를 식별해야 한다.

#### 시나리오: Stopping Volume 감지
- **WHEN** 지지선 근처에서 고거래량 하락 캔들이 매우 좁은 스프레드를 가질 때
- **THEN** 시스템은 해당 캔들을 "Stopping Volume"으로 라벨링하여 전문적인 매수세를 나타내야 한다.

#### 시나리오: No Demand 감지
- **WHEN** 저항선 근처에서 저거래량 상승 캔들이 좁은 스프레드를 가질 때
- **THEN** 시스템은 해당 캔들을 "No Demand"로 라벨링하여 전문적인 매수 관심의 부족을 나타내야 한다.
-->

