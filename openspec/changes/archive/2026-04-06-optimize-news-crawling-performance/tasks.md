## 1. Backend Caching and API

- [x] 1.1 Implement in-memory cache in `src/lib/crawler.ts` with expiration logic.
- [x] 1.2 Create API route `src/app/api/news/route.ts` to fetch news data for a given topic.
- [x] 1.3 Verify API endpoint using a browser or curl (e.g., `GET /api/news?topic=crypto`).

## 2. Frontend Asynchronous Loading

- [x] 2.1 Convert `src/components/TrendingNews.tsx` to a Client Component or create a wrapper.
- [x] 2.2 Implement `useEffect` to fetch news data from `/api/news`.
- [x] 2.3 Add loading states (e.g., spinner or skeleton component) to the news section.
- [x] 2.4 Update `src/app/page.tsx` to remove the blocking `crawlNews` call and use the new async component.

## 3. Verification and Polishing

- [x] 3.1 Verify that the initial page load is faster (less than 1 second).
- [x] 3.2 Ensure news data is correctly cached and refreshed after 30 minutes.
- [x] 3.3 Polish the loading UI for a smooth user experience.

<!--
## 한글 번역 (Full Translation)

## 1. 백엔드 캐싱 및 API
- [x] 1.1 만료 로직을 포함한 인메모리 캐시를 `src/lib/crawler.ts`에 구현합니다.
- [x] 1.2 주어진 주제에 대한 뉴스 데이터를 가져오는 API 라우트 `src/app/api/news/route.ts`를 생성합니다.
- [x] 1.3 브라우저나 curl을 사용하여 API 엔드포인트를 검증합니다 (예: `GET /api/news?topic=crypto`).

## 2. 프론트엔드 비동기 로딩
- [x] 2.1 `src/components/TrendingNews.tsx`를 클라이언트 컴포넌트로 변환하거나 래퍼를 생성합니다.
- [x] 2.2 `/api/news`에서 뉴스 데이터를 가져오도록 `useEffect`를 구현합니다.
- [x] 2.3 뉴스 섹션에 로딩 상태(예: 스피너 또는 스켈레톤 컴포넌트)를 추가합니다.
- [x] 2.4 `src/app/page.tsx`에서 차단형 `crawlNews` 호출을 제거하고 새로운 비동기 컴포넌트를 사용하도록 업데이트합니다.

## 3. 검증 및 다듬기
- [x] 3.1 초기 페이지 로딩이 더 빨라졌는지 확인합니다 (1초 미만).
- [x] 3.2 뉴스 데이터가 올바르게 캐싱되고 30분 후 새로고침되는지 확인합니다.
- [x] 3.3 매끄러운 사용자 경험을 위해 로딩 UI를 다듬습니다.
-->
