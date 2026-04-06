## Why

The current project lacks a cohesive, professional design tailored for serious investors and developers. It feels "AI-generated" and doesn't provide structured, quickly digestible market data or personal investment tracking. This change is needed to elevate the platform into a serious investment tool with a professional aesthetic, comprehensive coin sector tracking, and personalized dashboards.

## What Changes

- Complete UI/UX redesign to ensure a professional, developer/investor-focused aesthetic, explicitly moving away from an "AI-generated" look.
- **Main Page Redesign**:
  - Implement a vertical list of coins divided into sectors: 24h Highest Volume, Top Gainers, Top Losers, and Newly Listed.
  - Add sorting capabilities (ascending/descending) for each sector.
  - Apply dynamic text coloring based on value ranges to facilitate quick visual parsing of market movements.
- **Trending News Section**:
  - Add a dedicated section at the bottom of the main page for trending news.
  - Make news items clickable, linking directly to the original articles.
  - Introduce impact tags on news items to show which specific coins are affected.
- **Dashboard Page**:
  - Create a new dashboard page dedicated to tracking the user's personal investment status and portfolio.

## Capabilities

### New Capabilities

- `coin-market-data`: Manages and displays the vertical coin lists divided by sectors (Volume, Gainers, Losers, New), including sorting and dynamic value-based coloring.
- `trending-news`: Fetches and displays trending news with original article links and coin impact tags.
- `investment-dashboard`: Provides the user interface and logic for tracking personal investment portfolios.
- `professional-ui`: Establishes the new, professional (non-AI-generated) design system and layout components across the application.

### Modified Capabilities

- `investing-news-crawler`: Ensure it can provide the necessary trending news and identify affected coins for the `trending-news` capability (if applicable).

## Impact

- **UI/UX**: Complete overhaul of the frontend design system (`src/styles`, `src/components`, `src/app`).
- **Routing**: Addition of a new `/dashboard` route.
- **Components**: Major refactoring or replacement of `MarketDashboard`, `NewsFeed`, and creation of new sector-based coin list components.
- **Data Fetching**: Updates to API routes or data fetching logic to support the new sorting, sector categorization, and news impact tags.
