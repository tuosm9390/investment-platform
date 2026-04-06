## ADDED Requirements

### Requirement: Order Block (OB) Identification
The system SHALL identify institutional Order Blocks based on high-volume candles that precede significant market moves.

#### Scenario: Bullish Order Block Identification
- **WHEN** a bearish candle occurs before a strong move to the upside that breaks structure
- **THEN** the system SHALL mark that bearish candle's range as a "Bullish Order Block" zone

#### Scenario: Mitigation Tracking
- **WHEN** price returns to and enters a previously identified Order Block zone
- **THEN** the system SHALL mark the Order Block as "mitigated" and adjust its visual priority

### Requirement: Fair Value Gap (FVG) Detection
The system SHALL identify and highlight Fair Value Gaps (Imbalances) in price action.

#### Scenario: Bullish FVG Detection
- **WHEN** the high of candle $n$ is lower than the low of candle $n+2$, creating a gap in a bullish impulse
- **THEN** the system SHALL highlight the gap between $high(n)$ and $low(n+2)$ as a "Bullish FVG"

<!--
## 한글 번역 (Full Translation)

## 추가된 요구사항 (ADDED Requirements)

### 요구사항: 오더 블록(OB) 식별
시스템은 중대한 시장 움직임에 앞서 발생하는 고거래량 캔들을 기반으로 기관의 오더 블록을 식별해야 한다.

#### 시나리오: 상승 오더 블록 식별
- **WHEN** 구조를 돌파하는 강력한 상승 움직임 이전에 하락(음봉) 캔들이 발생할 때
- **THEN** 시스템은 해당 하락 캔들의 범위를 "상승 오더 블록" 영역으로 표시해야 한다.

#### 시나리오: 완화(Mitigation) 추적
- **WHEN** 가격이 이전에 식별된 오더 블록 영역으로 돌아와 진입할 때
- **THEN** 시스템은 해당 오더 블록을 "완화됨(mitigated)"으로 표시하고 시각적 우선순위를 조정해야 한다.

### 요구사항: 공정가치 갭(FVG) 감지
시스템은 가격 작용에서 공정가치 갭(불균형)을 식별하고 강조해야 한다.

#### 시나리오: 상승 FVG 감지
- **WHEN** 상승 임펄스에서 캔들 n의 고점이 캔들 n+2의 저점보다 낮아 갭이 발생할 때
- **THEN** 시스템은 고점(n)과 저점(n+2) 사이의 갭을 "상승 FVG"로 강조해야 한다.
-->

