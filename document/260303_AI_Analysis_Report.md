Date: 2026-03-03 01:30:00
Author: Antigravity

# AI 투자 예측 시스템 분석 보고서

본 보고서는 `src/app/api/ai/predict/route.ts`에 구현된 AI 투자 예측 기능과 `src/prompt/` 경로의 전문 프롬프트 파일(`SMC_prompt.md`, `traning_prompt.md`)을 분석하고, 이를 통합하여 고도화된 투자 전략을 수립하기 위한 내용을 담고 있습니다.

## 1. 기존 시스템 분석 (`route.ts`)

- **데이터 소스**: Binance API를 통해 비트코인(BTC)을 기본으로 하는 OHLCV(Open, High, Low, Close, Volume) 데이터를 수집합니다.
- **분석 주기**: 일봉(1d)과 4시간봉(4h) 데이터를 동시에 활용하여 상위 프레임(HTF)과 하위 프레임(LTF) 분석을 시도합니다.
- **기술 지표**: RSI, MACD, EMA20을 계산하여 AI 프롬프트의 입력 데이터로 제공합니다.
- **AI 모델**: Google의 `gemini-flash-latest`를 사용하며, API 응답은 JSON 형식을 요구합니다.
- **프롬프트 구조**: 코드 내에 `smcPromptContent`라는 변수로 하드코딩되어 있으며, 기본적인 SMC(Smart Money Concepts) 페르소나를 포함하고 있으나 전문적인 ICT/SMC 로직은 다소 단순화되어 있습니다.

## 2. 신규 프롬프트 상세 분석

### A. `SMC_prompt.md` (전문 전략 필터)
- **핵심 가치**: 리테일 노이즈 배제 및 알고리즘 기반의 유동성(Liquidity) 분석.
- **주요 로직**:
  - **Liquidity Matrix**: 지지/저항 대신 외부/내부 유동성 및 FVG, Order Blocks 식별.
  - **SMC Confluence Rule**: 최소 3가지 이상의 기술적 근거(Sweep, MSS, BPR 등)가 일치해야 진입 신호 생성.
  - **Time-Based Logic**: Killzone 및 Silver Bullet 윈도우 등의 시간적 우위 고려.
  - **정량적 점수화**: 10~100점 사이의 신뢰도 점수를 부여하여 분석의 객관성 확보.

### B. `traning_prompt.md` (심층 분석 및 브리핑)
- **핵심 가치**: 'Mastermind' 페르소나를 통한 기관급 트레이딩 데스크 브리핑.
- **주요 로직**:
  - **IPDA Cycle**: 가격뿐만 아니라 시간과 유동성의 3차원 행렬 분석.
  - **CISD & SMT**: 자산 간 다이버전스(SMT)와 가격 전달 상태의 변화(CISD)를 통한 세력 매집/분배 확인.
  - **출력 포맷**: [MARKET CONTEXT], [SETUP VALIDATION], [TRADE PLAN], [EXPERT WARNING]의 구조화된 보고서 형식 요구.

## 3. 통합 및 고도화 방향

- **동적 프롬프트 로딩**: 코드 내 하드코딩된 프롬프트를 제거하고, 외부 MD 파일을 읽어와 컨텍스트로 주입하는 구조로 변경하여 유지보수성을 향상시킵니다.
- **전략 결합 (Hybrid SMC/ICT)**: `traning_prompt.md`의 깊이 있는 논리 구조를 기반으로 하되, `SMC_prompt.md`의 엄격한 필터링 및 점수화 시스템을 결합하여 최상위 퀀트 전략을 구축합니다.
- **JSON 스키마 고도화**: AI가 분석한 브리핑 텍스트를 `insights` 배열에 구조화하여 저장하고, `entryPrice`, `stopLoss`, `targetPrice` 등의 거래 계획을 더욱 정밀하게 산출하도록 유도합니다.
- **데이터 보강**: 현재의 RSI/MACD 외에도 AI가 프롬프트 내에서 요구하는 유동성 지점(Swing High/Low) 데이터를 추가로 식별할 수 있는 로직 검토가 필요합니다.

## 4. 결론

제공된 두 프롬프트는 매우 전문적인 ICT/SMC 전략을 담고 있어, 이를 현재의 시스템에 성공적으로 통합할 경우 일반적인 기술적 분석을 뛰어넘는 기관급 투자 통찰력을 제공할 수 있을 것으로 판단됩니다. 특히 `Time is everything` 원칙에 따라 시간적 요소를 분석에 포함시키는 것이 핵심 과제가 될 것입니다.
