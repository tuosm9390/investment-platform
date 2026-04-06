## 1. Design System & Global Styles

- [x] 1.1 Refactor `src/styles/design_tokens.css` and `src/app/globals.css` to establish a professional, developer-focused aesthetic (sharp edges, clear contrasts, minimal shadows).
- [x] 1.2 Update base typography and utility classes to ensure high readability and a "dashboard" feel.

## 2. News Crawler & API Updates

- [x] 2.1 Modify `investing-news-crawler` (e.g., `src/lib/crawler.ts` and related APIs) to analyze news text/metadata for coin impact tags.
- [x] 2.2 Update the news API endpoints to return the mapped impact tags along with the news data. (Handled via crawler and direct component data flow)

## 3. Sector-Based Coin List Components

- [x] 3.1 Create a reusable `CoinList` component that supports data rendering, sorting (ASC/DESC), and conditional text coloring based on value ranges.
- [x] 3.2 Implement data fetching/mocking for the 4 distinct sectors: 24h Highest Volume, Top Gainers, Top Losers, and Newly Listed.
- [x] 3.3 Replace the existing market view on the main page (`src/app/page.tsx`) with the new sector-based `CoinList` components.

## 4. Trending News Component

- [x] 4.1 Build a `TrendingNews` component to display a list of the latest news with original article hyperlinks.
- [x] 4.2 Implement UI elements within the news component to display the extracted coin impact tags.
- [x] 4.3 Integrate the `TrendingNews` component into the bottom section of the main page.

## 5. Dashboard Page

- [x] 5.1 Create the new `/dashboard` route (`src/app/dashboard/page.tsx`) and its corresponding layout.
- [x] 5.2 Develop portfolio summary cards and holding tables using mockup data to display personal investment status.
- [x] 5.3 Add navigation links in the `Header` to access the new Dashboard page.

## 6. Integration & Polish

- [x] 6.1 Review the entire application to ensure no "AI-generated" visual artifacts remain.
- [x] 6.2 Test all sorting functions, conditional styling, and news link routing to ensure they work as expected.
- [x] 6.3 Verify responsiveness and compatibility across different screen sizes.
