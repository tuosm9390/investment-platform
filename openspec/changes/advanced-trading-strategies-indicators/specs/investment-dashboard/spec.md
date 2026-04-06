## ADDED Requirements

### Requirement: Advanced Indicator Visualization
The dashboard SHALL support a new "Professional Analysis" mode that visualizes institutional-grade indicators (SMC, VSA, VCP).

#### Scenario: Professional Analysis Mode Toggle
- **WHEN** the user toggles "Professional Mode" in the dashboard settings
- **THEN** the system SHALL overlay BOS, CHoCH, and Order Blocks onto the price chart

### Requirement: Institutional Flow Dashboard Component
The system SHALL provide a new component dedicated to showing institutional order flow and liquidity gaps.

#### Scenario: FVG List Display
- **WHEN** a stock has active (unfilled) Fair Value Gaps
- **THEN** the system SHALL list these gaps in the "Liquidity Analysis" component

<!--
## 한글 번역 (Full Translation)

## 추가된 요구사항 (ADDED Requirements)

### 요구사항: 고급 지표 시각화
대시보드는 기관급 지표(SMC, VSA, VCP)를 시각화하는 새로운 "전문가 분석" 모드를 지원해야 한다.

#### 시나리오: 전문가 분석 모드 토글
- **WHEN** 사용자가 대시보드 설정에서 "전문가 모드"를 토글할 때
- **THEN** 시스템은 BOS, CHoCH, 오더 블록을 가격 차트 위에 오버레이해야 한다.

### 요구사항: 기관 흐름 대시보드 컴포넌트
시스템은 기관의 주문 흐름과 유동성 갭을 보여주는 전용 컴포넌트를 제공해야 한다.

#### 시나리오: FVG 리스트 표시
- **WHEN** 주식에 활성화된(채워지지 않은) 공정가치 갭이 있을 때
- **THEN** 시스템은 "유동성 분석" 컴포넌트에 이러한 갭을 리스트업해야 한다.
-->


---
### 주석 (한글 번역)
사용자 UI인 투자 대시보드에 대한 추가 기능 명세입니다. 사용자는 "Professional Mode" 토글을 통해 기존 차트에 고급 지표들을 겹쳐서(Overlay) 볼 수 있으며, 새롭게 추가되는 기관 흐름 대시보드 컴포넌트를 통해 현재 채워지지 않은 불균형(FVG) 구간들을 리스트 형태로 한눈에 파악할 수 있습니다.
