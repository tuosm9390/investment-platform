## Why

The current real-time trend news crawling process is slow, causing significant delays in initial page load. Implementing caching and asynchronous data fetching will provide immediate feedback to users and improve the overall perceived performance of the platform.

## What Changes

- **News Caching Layer**: Implement a server-side caching mechanism for crawled news data.
- **Asynchronous Data Fetching**: Modify the frontend to fetch news data asynchronously, allowing the rest of the dashboard to load independently.
- **Immediate Feedback UI**: Add loading states or placeholder components for the news feed while data is being fetched.
- **Background Refresh**: Implement a strategy to refresh the cache in the background.

## Capabilities

### New Capabilities
- `news-caching`: A mechanism to store and retrieve previously crawled news data from a cache (e.g., memory or file-based).
- `async-news-loading`: Frontend capability to load news content after the initial page layout is rendered.

### Modified Capabilities
- `news-feed`: Update the existing news feed capability to support asynchronous states and cached data display.

## Impact

- `src/lib/news.ts`: Update crawling logic to integrate with the caching layer.
- `src/components/NewsFeed.tsx`: Update to support async loading and display loading indicators.
- API Routes: Potential need for a dedicated API endpoint to fetch news if not already present.

<!--
## 한글 번역 (Full Translation)

## 왜 (Why)
현재 실시간 트렌드 뉴스 크롤링 과정이 느려 초기 페이지 로딩에 상당한 지연이 발생합니다. 캐싱과 비동기 데이터 페칭을 구현하면 사용자에게 즉각적인 피드백을 제공하고 플랫폼의 전반적인 체감 성능을 향상시킬 수 있습니다.

## 무엇이 변하는가 (What Changes)
- **뉴스 캐싱 레이어**: 크롤링된 뉴스 데이터에 대해 서버측 캐싱 메커니즘을 구현합니다.
- **비동기 데이터 페칭**: 뉴스를 비동기로 가져오도록 프론트엔드를 수정하여, 대시보드의 나머지 부분이 독립적으로 로드될 수 있도록 합니다.
- **즉각적 피드백 UI**: 데이터를 가져오는 동안 뉴스 피드에 로딩 상태나 플레이스홀더 컴포넌트를 추가합니다.
- **백그라운드 갱신**: 백그라운드에서 캐시를 갱신하는 전략을 구현합니다.

## 역량 (Capabilities)

### 새로운 역량 (New Capabilities)
- `news-caching`: 캐시(예: 메모리 또는 파일 기반)에서 이전에 크롤링된 뉴스 데이터를 저장하고 검색하는 메커니즘입니다.
- `async-news-loading`: 초기 페이지 레이아웃이 렌더링된 후 뉴스 콘텐츠를 로드하는 프론트엔드 역량입니다.

### 수정된 역량 (Modified Capabilities)
- `news-feed`: 비동기 상태 및 캐시된 데이터 표시를 지원하도록 기존 뉴스 피드 역량을 업데이트합니다.

## 영향 (Impact)
- `src/lib/news.ts`: 캐싱 레이어와 통합되도록 크롤링 로직을 업데이트합니다.
- `src/components/NewsFeed.tsx`: 비동기 로딩을 지원하고 로딩 인디케이터를 표시하도록 업데이트합니다.
- API 라우트: 뉴스를 가져오기 위한 전용 API 엔드포인트가 아직 없다면 필요할 수 있습니다.
-->
