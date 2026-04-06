## Context

The current `Home` component in `src/app/page.tsx` fetches news data using `crawlNews` from `src/lib/crawler.ts`. This function uses Puppeteer, which is resource-intensive and slow, leading to a long TTFB (Time to First Byte) and poor user experience.

## Goals / Non-Goals

**Goals:**
- Implement a server-side cache for news data to avoid repeated crawling.
- Create an API endpoint for news fetching.
- Update the frontend to load news asynchronously.
- Provide a responsive UI with loading states.

**Non-Goals:**
- Changing the crawling logic itself (e.g., switching to another site).
- Implementing a persistent database for news (memory-based or file-based cache is sufficient for now).

## Decisions

- **Caching Strategy**: Implement a simple in-memory cache in `src/lib/crawler.ts`. The cache will store the results of `crawlNews` for a specific topic for 30 minutes.
- **API Route**: Create `src/app/api/news/route.ts` that handles `GET` requests with a `topic` query parameter and calls the cached `crawlNews` function.
- **Asynchronous Loading**:
    - Convert `TrendingNews.tsx` or create a new client component `NewsSection.tsx` that fetches data from the new API endpoint.
    - Use `useEffect` and `useState` to manage loading and data states.
- **UI Enhancement**: Use a skeleton loader or a spinner in the `TrendingNews` section while data is being fetched.

## Risks / Trade-offs

- **[Risk] Cache Invalidation**: News might be slightly outdated (up to 30 minutes).
    - **Mitigation**: 30 minutes is generally acceptable for "trending" news. We can add a manual refresh if needed later.
- **[Risk] Server Load**: Puppeteer still runs on the server when the cache expires.
    - **Mitigation**: Caching significantly reduces the number of Puppeteer instances running.

<!--
## 한글 번역 (Full Translation)

## 컨텍스트 (Context)
현재 `src/app/page.tsx`의 `Home` 컴포넌트는 `src/lib/crawler.ts`의 `crawlNews`를 사용하여 뉴스 데이터를 가져옵니다. 이 함수는 Puppeteer를 사용하는데, 이는 리소스를 많이 사용하고 느려서 TTFB(첫 바이트 수신 시간)가 길어지고 사용자 경험이 저하됩니다.

## 목표 / 비목표 (Goals / Non-Goals)

**목표 (Goals):**
- 반복적인 크롤링을 방지하기 위해 뉴스 데이터에 대한 서버측 캐시를 구현합니다.
- 뉴스 페칭을 위한 API 엔드포인트를 생성합니다.
- 뉴스를 비동기로 로드하도록 프론트엔드를 업데이트합니다.
- 로딩 상태가 포함된 반응형 UI를 제공합니다.

**비목표 (Non-Goals):**
- 크롤링 로직 자체를 변경하는 것 (예: 다른 사이트로 전환).
- 뉴스에 대한 영구 데이터베이스 구현 (현재는 메모리 기반 또는 파일 기반 캐시로 충분함).

## 결정 사항 (Decisions)

- **캐싱 전략**: `src/lib/crawler.ts`에 간단한 인메모리 캐시를 구현합니다. 캐시는 특정 주제에 대한 `crawlNews` 결과를 30분 동안 저장합니다.
- **API 라우트**: `topic` 쿼리 파라미터를 받아 캐시된 `crawlNews` 함수를 호출하는 `src/app/api/news/route.ts`를 생성합니다.
- **비동기 로딩**:
    - `TrendingNews.tsx`를 변환하거나 새로운 클라이언트 컴포넌트 `NewsSection.tsx`를 생성하여 새 API 엔드포인트에서 데이터를 가져옵니다.
    - `useEffect`와 `useState`를 사용하여 로딩 및 데이터 상태를 관리합니다.
- **UI 강화**: 데이터를 가져오는 동안 `TrendingNews` 섹션에 스켈레톤 로더 또는 스피너를 사용합니다.

## 리스크 / 트레이드오프 (Risks / Trade-offs)

- **[리스크] 캐시 무효화**: 뉴스가 약간 오래되었을 수 있습니다 (최대 30분).
    - **완화**: "트렌딩" 뉴스의 경우 30분은 일반적으로 허용 가능한 수준입니다. 나중에 필요하면 수동 새로고침을 추가할 수 있습니다.
- **[리스크] 서버 부하**: 캐시가 만료되면 여전히 서버에서 Puppeteer가 실행됩니다.
    - **완화**: 캐싱은 실행되는 Puppeteer 인스턴스 수를 크게 줄여줍니다.
-->
