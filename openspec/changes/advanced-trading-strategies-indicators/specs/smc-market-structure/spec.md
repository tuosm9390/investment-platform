## ADDED Requirements

### Requirement: Automatic BOS and CHoCH Detection
The system SHALL automatically identify and plot "Break of Structure" (BOS) and "Change of Character" (CHoCH) based on swing highs and swing lows.

#### Scenario: Bullish BOS Detection
- **WHEN** price breaks and closes above the previous swing high in an uptrend
- **THEN** the system SHALL mark the break point as "BOS" and update the current trend structure

#### Scenario: CHoCH Detection
- **WHEN** price breaks and closes below the most recent swing low in a bullish trend
- **THEN** the system SHALL mark the break point as "CHoCH", indicating a potential trend reversal to bearish

<!--
## 한글 번역 (Full Translation)

## 추가된 요구사항 (ADDED Requirements)

### 요구사항: 자동 BOS 및 CHoCH 감지
시스템은 스윙 고점과 스윙 저점을 기반으로 "구조 돌파"(BOS) 및 "성격 변화"(CHoCH)를 자동으로 식별하고 플로팅해야 한다.

#### 시나리오: 상승 BOS 감지
- **WHEN** 가격이 상승 추세에서 이전 스윙 고점을 돌파하고 그 위에서 마감될 때
- **THEN** 시스템은 돌파 지점을 "BOS"로 표시하고 현재 추세 구조를 업데이트해야 한다.

#### 시나리오: CHoCH 감지
- **WHEN** 가격이 상승 추세에서 가장 최근의 스윙 저점을 이탈하고 그 아래에서 마감될 때
- **THEN** 시스템은 돌파 지점을 "CHoCH"로 표시하여 잠재적인 하락 추세 반전을 나타내야 한다.
-->

