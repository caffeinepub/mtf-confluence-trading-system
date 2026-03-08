# MTF Confluence Trading System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full MTF Confluence trading journal application
- Sidebar with responsive navigation (hamburger on mobile): Dashboard, New Trade, Journal, Calendar, Statistics, AI Coach
- Dashboard: overview stats (total trades, win rate, total P&L, avg R:R)
- TradeForm: 5-step sequential confluence checklist
  - Step 1: Market Structure (Weekly/Daily/4H bias, trend direction)
  - Step 2: AOI & Market Stage (AOI marking, Market Stage 1/2/3)
  - Step 3: 4H Pattern (HL/LH confirmation, pattern type)
  - Step 4: Lower TF Confirmation (15m/30m/1H entry signal, candle type: engulfing/doji)
  - Step 5: Risk Management (pair, entry/SL/TP prices, account balance, position size calc, 1:2 R:R validation)
  - Confluence score displayed visually; submit only enabled at 90%+
  - Each step unlocks only when the previous is complete; completed steps show green
- Risk Calculator embedded in Step 5: auto-calculates position size using pip values per pair, enforces 1:2 R:R
- TradeJournal: list of all saved trades with search, filter by pair/result, sort, edit, delete
- EditTradeModal: edit any trade field, auto-recalculate P&L on save
- CalendarView: trades shown on a monthly calendar by date
- Statistics: win rate chart, P&L over time, avg R:R, breakdown by pair
- AICoach: static display of the 6 MTF strategy rules (cosmetic only, no logic)
- All trade data persisted to backend canister (stable storage)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Motoko backend: Trade data type (id, date, pair, direction, marketStructure, aoi, marketStage, pattern4H, lowerTFConfirm, candleType, entry, sl, tp, lotSize, riskPips, rewardPips, rr, pnl, notes, confluenceScore, result), CRUD operations (addTrade, getTrades, updateTrade, deleteTrade), stable var for persistence
2. Frontend: App shell with sidebar routing, Dashboard, TradeForm (5-step with validation + scoring), TradeJournal (filter/search/sort), EditTradeModal, CalendarView, Statistics, AICoach
3. Wire frontend to backend actor for all trade CRUD
4. Responsive layout: sidebar collapses to hamburger on mobile
