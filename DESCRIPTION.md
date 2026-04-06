# Investment Platform

## 프로젝트 개요 (Overview)
**Investment Platform**은 특정 금융 키워드나 종목명으로 웹 뉴스와 RSS 피드를 동적으로 크롤링하고, 수집된 데이터를 대시보드 형태로 제공하는 웹 애플리케이션입니다.
Next.js의 서버 사이드 리소스와 Cheerio를 활용하여 데이터를 스크래핑한 뒤, 클라이언트 영역에서 경량화된 차트 라이브러리를 통해 시계열 데이터 및 분석 결과를 직관적으로 시각화하는 데 중점을 두었습니다.

## 핵심 파이프라인 (Core Pipeline)
1. **데이터 수집 (Scraping & Crawling)**
   - `cheerio`를 활용하여 대상 웹페이지나 검색 결과(예: 네이버 검색 모바일/PC 버전)의 HTML DOM을 파싱하여 정형화된 뉴스 데이터로 추출합니다.
   - 런타임 환경에서 API 라우트를 통해 크롤러 스크립트(`src/lib/crawler`, `test-crawler.ts`)를 비동기로 실행하여 최신 데이터를 패치합니다.
2. **AI 데이터 분석 (Processing)**
   - `@google/generative-ai` (Gemini API)를 연동하여 단순한 헤드라인 추출을 넘어서, 금융 뉴스의 맥락을 파악하고 투자자 관점의 의미 있는 데이터로 정제/요약합니다.
3. **데이터 시각화 (Visualization)**
   - 수집 및 분석된 데이터를 `lightweight-charts`와 `recharts`를 사용하여 대시보드의 캔버스 및 SVG 차트로 렌더링합니다.

## 프로젝트 구조 (Project Structure)
```text
investment-platform/
├── src/
│   ├── app/                # Next.js 16 App Router 구조
│   │   ├── api/            # 외부 API 또는 크롤러를 실행하는 서버사이드 엔드포인트
│   │   └── search/         # 특정 키워드/종목 검색결과 및 차트 대시보드 뷰
│   └── lib/                # 비즈니스/크롤러 모듈 디렉토리
├── test-crawler.ts         # 로컬 환경 크롤러 유닛 테스트 스크립트
├── crawler-log.txt         # 크롤링 에러/성공 상태를 담은 로그 기록
└── gstack-sketch.html/png  # 초기 퍼블리싱 UI 프로토타입 설계 파일
```

## 상세 기능 구현 (Technical Implementation)
- **우회적 크롤링 파이프라인 컴포넌트화**
  동적으로 변화하는 타겟 사이트(예: 포털 검색)의 HTML 구조에 대응하기 위해 데이터를 패치(`test-rss.ts`, `dump-mobile.ts`)하고 Cheerio 셀렉터를 모듈화하여, 유지보수 비용을 낮추는 스크래핑 아키텍처를 설계했습니다.
- **성능 중심의 데이터 바인딩**
  빠른 차트 렌더링을 위해 TradingView의 `lightweight-charts`를 WebGL 캔버스 위에서 구동하여 수많은 시점에서 발생하는 데이터 틱(tick)의 브라우저 리플로우(Reflow)를 최소화했습니다.

## 사용 기술 및 라이브러리 (Tech Stack)
- **Frontend Core**: Next.js 16.1.6 (App Router), React 19
- **Data Fetching/Scraping**: `axios`, `cheerio` (HTML DOM Parser)
- **Data Visualization**: `lightweight-charts`, `recharts`
- **AI Processing**: `@google/generative-ai` (Gemini)
- **Styling**: `clsx`, `lucide-react`
