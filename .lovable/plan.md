# TEMPO watchlist onboarding

## Build
- Expand the single simulated asset source to 50 cryptocurrencies and 50 forex pairs, each with price, 24-hour change, category, sparkline points, sentiment metrics, explanation, and evidence.
- Add a responsive `MarketWatchlist` selector using existing TEMPO tokens, shadcn buttons, and Lucide icons.
- Open `/playground` on the selector first, with search, crypto/forex filters, add/remove controls, selected-count feedback, and a clear action into the terminal.
- Restrict the terminal asset tabs and search to the chosen watchlist, while allowing users to return and customize it.

## Interaction details
- Start with a small suggested set so the flow is immediately usable, but require the user to continue from the selection screen.
- Prevent continuing with an empty selection and keep controls usable on mobile and desktop.
- Animate the selector-to-terminal transition without changing the existing home-page entrance.

## Validation
- Verify the selector, search, filters, add/remove behavior, terminal transition, and watchlist editing in the live preview.
- Check desktop and mobile layouts, console errors, and the latest build status.

## Technical notes
- Keep all data client-side in the existing TEMPO fixture module; no cloud storage or accounts.
- Preserve TanStack route IDs and route-specific metadata.
