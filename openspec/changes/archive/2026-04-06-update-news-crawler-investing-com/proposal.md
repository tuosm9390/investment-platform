## Why

현재 뉴스 크롤링 로직은 제목에 단순히 종목이나 코인 정보가 포함되어 있는지 여부만을 기준으로 모든 기사를 수집하고 있어 관련성이 떨어지거나 품질이 낮은 뉴스가 다수 포함되는 문제가 있습니다. 이를 해결하고 양질의 관련 정보를 제공하기 위해, 금융 및 투자 전문 포털인 investing.com에서 직접적으로 관련된 뉴스를 크롤링하는 방식으로 로직을 개선하고자 합니다.

## What Changes

- 기존 단순 키워드 매칭(제목에 종목명 포함) 기반 뉴스 수집 로직 제거
- investing.com 플랫폼을 타겟으로 특정 종목(코인, 주식 등)의 관련 뉴스를 추출하는 새로운 크롤러 구현
- 가져온 investing.com 뉴스 데이터를 기존 서비스의 뉴스 포맷에 맞게 매핑

## Capabilities

### New Capabilities
- `investing-news-crawler`: investing.com 사이트에서 특정 종목에 대한 뉴스를 검색 및 추출하는 크롤링 기능.

### Modified Capabilities


## Impact

- `src/lib/crawler.ts` 또는 유사한 기존 뉴스 크롤링 관련 모듈의 로직 수정
- 외부 사이트(investing.com) 요청에 따른 추가 패키지(예: Puppeteer, Cheerio 혹은 DOM 파서 등) 의존성 검토 및 사용
- 크롤링 차단 대응(User-Agent 변경, Request Delay 등) 로직 필요
