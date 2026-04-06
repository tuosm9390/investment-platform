## Context

The current investment platform lacks a professional layout suitable for serious developers and investors. It currently relies on an "AI-generated" visual style that reduces user trust and usability. Additionally, the platform lacks a consolidated view for market sectors, trending news mapping to specific coins, and a personalized investment dashboard.

## Goals / Non-Goals

**Goals:**

- Redesign the entire application to use a structured, professional layout free of generic "AI" aesthetics.
- Build a vertical coin list on the main page divided into specific market sectors (Highest Volume, Top Gainers, Top Losers, Newly Listed).
- Add robust sorting features (Ascending/Descending) to the sector lists.
- Implement conditional styling for coin values (e.g., green for positive, red for negative).
- Introduce a Trending News section that links out to original articles and displays impact tags (which coins are affected).
- Develop a Dashboard page for personal portfolio tracking.

**Non-Goals:**

- Implementing real-time WebSocket connections for live price updates (we will rely on existing polling/fetch mechanisms unless refactoring is strictly necessary).
- Executing actual trades or connecting to exchange APIs for executing orders (the dashboard is for tracking, not executing).

## Decisions

- **UI Framework/Styling**: We will utilize custom CSS modules or vanilla CSS alongside a rigorous design system to achieve the "professional developer/investor" aesthetic. We will avoid over-reliance on generic pre-built UI library defaults that contribute to an AI-generated feel.
- **State Management**: We will use React state/context or specialized hooks (like SWR/React Query if already in the project) for managing the sorting state of the coin lists on the main page.
- **News Mapping**: The news crawler will be updated to extract or infer which coins are discussed in the articles to populate the impact tags on the frontend.
- **Dashboard Layout**: The `/dashboard` route will use a grid layout designed for data density, favoring tables and clear summary cards over large illustrations or empty space.

## Risks / Trade-offs

- **Risk**: The news crawler may not easily identify affected coins from the raw text.
  - Mitigation: Use simple keyword matching against known coin symbols/names as a v1 solution for generating impact tags.
- **Trade-off**: Building a highly custom, professional UI takes more time than using a pre-built component library.
  - Rationale: The core requirement is to shed the "AI-generated" look, which is paramount for user trust in financial applications.
