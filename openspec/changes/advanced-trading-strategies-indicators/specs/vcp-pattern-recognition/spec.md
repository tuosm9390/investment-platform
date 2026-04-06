## ADDED Requirements

### Requirement: Mark Minervini's VCP Scanner
The system SHALL scan for Volatility Contraction Patterns (VCP) within a Stage 2 uptrend.

#### Scenario: Stage 2 Trend Confirmation
- **WHEN** price is above the 50-day SMA, which is above the 150-day SMA, and the 200-day SMA has been trending up for 1 month
- **THEN** the system SHALL mark the stock as being in a "Stage 2 Trend"

#### Scenario: VCP Volatility Shrinkage
- **WHEN** a stock in a Stage 2 trend shows a sequence of narrowing pullbacks (e.g., 20% → 10% → 5% depth)
- **THEN** the system SHALL identify the setup as a "VCP Setup" and highlight the pivot point for a potential breakout

<!--
## 한글 번역 (Full Translation)

## 추가된 요구사항 (ADDED Requirements)

### 요구사항: 마크 미너비니의 VCP 스캐너
시스템은 2단계 상승 추세 내에서 변동성 수축 패턴(VCP)을 스캔해야 한다.

#### 시나리오: 2단계 추세 확인
- **WHEN** 가격이 50일 SMA 위에 있고, 50일 SMA가 150일 SMA 위에 있으며, 200일 SMA가 1개월 동안 상승 추세를 유지할 때
- **THEN** 시스템은 해당 주식을 "2단계 추세"에 있는 것으로 마킹해야 한다.

#### 시나리오: VCP 변동성 수축
- **WHEN** 2단계 추세에 있는 주식이 일련의 좁아지는 눌림(예: 20% → 10% → 5% 깊이)을 보일 때
- **THEN** 시스템은 해당 설정을 "VCP 셋업"으로 식별하고 잠재적 돌파를 위한 피벗 포인트를 강조해야 한다.
-->

