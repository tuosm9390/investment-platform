## Context

현재 애플리케이션은 종목별 뉴스를 수집할 때, 단순히 뉴스 제목에 종목명이나 코인 정보가 포함되어 있는지를 확인하는 기초적인 방식(키워드 매칭)을 사용하고 있습니다. 이는 가비지 데이터나 관련성이 떨어지는 기사까지 무분별하게 수집하게 만들어 데이터 품질 저하를 유발합니다. 이를 개선하기 위해 investing.com과 같은 전문 금융 포털에서 관련 뉴스를 직접 크롤링하여 품질 높은 데이터를 확보하고자 합니다.

## Goals / Non-Goals

**Goals:**
- investing.com에서 특정 종목(주식, 암호화폐 등)과 매칭되는 뉴스 기사를 크롤링
- 크롤링한 데이터를 애플리케이션 내부 뉴스 데이터 포맷으로 일관되게 파싱 및 정규화
- 기존의 불필요한 키워드 매칭 기반 수집 로직 제거

**Non-Goals:**
- 뉴스 본문 전체에 대한 심층 NLP 분석 (요약이나 감성 분석 등은 기존 로직 활용 또는 추후 구현)
- investing.com 외의 다른 뉴스 소스 추가 (현재는 investing.com으로만 한정)

## Decisions

- **크롤링 도구:** Cheerio vs Puppeteer
  - *결정:* Cheerio를 우선적으로 사용하며, investing.com이 정적 HTML로 뉴스를 제공하거나 API 엔드포인트가 노출되어 있는 경우 HTTP 요청(fetch/axios) + Cheerio 파싱을 사용합니다. 만약 Cloudflare 등 안티봇 시스템이나 CSR(Client Side Rendering)로 인해 동적 렌더링이 필수적인 경우 Puppeteer로 전환합니다.
  - *이유:* 속도와 리소스 효율성을 위해 가벼운 Cheerio를 선호합니다.
- **안티봇 우회:** User-Agent 랜덤화 및 딜레이 추가
  - *결정:* investing.com의 크롤링 차단을 피하기 위해 요청 시 브라우저와 유사한 User-Agent 헤더를 포함하고, 다수의 요청을 보낼 때는 딜레이를 둡니다.
- **기존 로직 대체:** `src/lib/crawler.ts`의 뉴스 수집 로직 교체
  - *결정:* 이전 로직을 완전히 제거하고 새로운 `fetchInvestingNews` (또는 기존 함수 교체) 로직을 통합합니다.

## Risks / Trade-offs

- [Risk] investing.com의 사이트 구조 변경 → 사이트 UI/DOM 구조가 바뀌면 크롤러가 작동하지 않을 수 있습니다.
  - *Mitigation:* DOM 셀렉터 의존성을 최소화하고, 크롤링 실패 시 적절한 폴백(빈 배열 반환 및 에러 로깅)과 알림을 구현합니다.
- [Risk] 안티봇/IP 차단 (Cloudflare 등) → 과도한 요청 시 IP가 차단될 수 있습니다.
  - *Mitigation:* 요청 간 딜레이를 적용하고, 필요 시 프록시 로테이션을 도입할 수 있도록 확장성을 고려해 설계합니다.