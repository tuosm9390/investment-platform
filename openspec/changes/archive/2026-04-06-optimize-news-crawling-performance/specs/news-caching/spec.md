## ADDED Requirements

### Requirement: News Caching Mechanism
The system SHALL implement an in-memory cache for crawled news data to reduce external requests and improve performance.

#### Scenario: Retrieval from Cache
- **WHEN** a request for news on a specific topic is received and the data exists in the cache and is not expired
- **THEN** the system SHALL return the cached data immediately without running the crawler.

#### Scenario: Cache Expiration
- **WHEN** a request for news is received and the cached data is older than 30 minutes
- **THEN** the system SHALL run the crawler, update the cache with new data, and return the fresh data.

### Requirement: News API Endpoint
The system SHALL provide an API endpoint to fetch news data for a given topic.

#### Scenario: Successful News Fetching
- **WHEN** a GET request is made to `/api/news?topic=crypto`
- **THEN** the system SHALL return a JSON response containing an array of news items.

### Requirement: Asynchronous Frontend Loading
The frontend SHALL load news data asynchronously to prevent blocking the main page render.

#### Scenario: Loading State Display
- **WHEN** the news section is initialized and data is being fetched from the API
- **THEN** the system SHALL display a loading indicator (e.g., spinner or skeleton).

<!--
## 한글 번역 (Full Translation)

## 추가된 요구사항 (ADDED Requirements)

### 요구사항: 뉴스 캐싱 메커니즘
시스템은 외부 요청을 줄이고 성능을 향상시키기 위해 크롤링된 뉴스 데이터에 대한 인메모리 캐시를 구현해야 한다.

#### 시나리오: 캐시에서 검색
- **WHEN** 특정 주제에 대한 뉴스 요청이 수신되고 데이터가 캐시에 존재하며 만료되지 않았을 때
- **THEN** 시스템은 크롤러를 실행하지 않고 즉시 캐시된 데이터를 반환해야 한다.

#### 시나리오: 캐시 만료
- **WHEN** 뉴스 요청이 수신되고 캐시된 데이터가 30분보다 오래되었을 때
- **THEN** 시스템은 크롤러를 실행하고, 캐시를 새로운 데이터로 업데이트하며, 신선한 데이터를 반환해야 한다.

### 요구사항: 뉴스 API 엔드포인트
시스템은 주어진 주제에 대한 뉴스 데이터를 가져오기 위한 API 엔드포인트를 제공해야 한다.

#### 시나리오: 성공적인 뉴스 페칭
- **WHEN** `/api/news?topic=crypto`로 GET 요청이 발생했을 때
- **THEN** 시스템은 뉴스 항목 배열을 포함하는 JSON 응답을 반환해야 한다.

### 요구사항: 비동기 프론트엔드 로딩
프론트엔드는 메인 페이지 렌더링을 차단하지 않도록 뉴스 데이터를 비동기로 로드해야 한다.

#### 시나리오: 로딩 상태 표시
- **WHEN** 뉴스 섹션이 초기화되고 API에서 데이터를 가져오는 중일 때
- **THEN** 시스템은 로딩 인디케이터(예: 스피너 또는 스켈레톤)를 표시해야 한다.
-->
