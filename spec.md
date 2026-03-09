# MTF Confluence Trading System

## Current State
A 5-step trade form with backend-persisted trades, journal, calendar, stats, AI coach, and risk calculator. The form has:
- Step 2: "AOI Level" (text input) + Market Stage (3 radio options with accumulation/markup/distribution labels)
- Step 3: 4H Pattern dropdown with: Higher Low (HL), Lower High (LH), Double Bottom, Double Top, Other
- Step 4: Lower TF Confirmation with Timeframe + Signal + Candle Type
- Step 5: R:R validation requires ≥ 2.0; no screenshot upload fields
- EditTradeModal: R:R warning also uses ≥ 2.0 threshold

## Requested Changes (Diff)

### Add
- Before Trade screenshot upload field in Step 5 (Risk Management & Review)
- After Trade screenshot upload field in Step 5
- "Head and Shoulders" option in the 4H Pattern dropdown (Step 3)

### Modify
- Step 2: Rename "AOI Level" label → "Round Psychological Level"
- Step 2: Market Stage options:
  - Stage 1 → "Top" (was "Accumulation")
  - Stage 2 → "On The Way (OTW)" (was "Markup/Markdown")
  - Stage 3 → "Area Of Interest (AOI)" (was "Distribution")
- Step 4: Remove the "Signal" field entirely; update validation so only Timeframe + Candle Type are required; update lowerTFSignal submitted value to just use timeframe
- Step 5: Change R:R minimum from 2.0 to 1.5 everywhere (validation, warning messages, highlight color threshold)
- EditTradeModal: Update R:R warning threshold from 2.0 to 1.5

### Remove
- Signal select dropdown from Step 4 (Lower TF Confirmation)

## Implementation Plan
1. In TradeForm.tsx:
   - Rename "AOI Level" label to "Round Psychological Level" and update placeholder
   - Update Market Stage radio values/labels: Stage 1=Top, Stage 2=On The Way (OTW), Stage 3=Area Of Interest (AOI)
   - Add "Head and Shoulders" to the 4H Pattern dropdown options
   - Remove Signal field from Step 4; update isStep4Valid to only require timeframe + candleType; update lowerTFSignal in handleSubmit to just be timeframe
   - Change R:R threshold from 2.0 to 1.5 in isStep5Valid, warning messages, and highlight color
   - Add before/after screenshot upload fields in Step 5 (stored as base64 or object URL in state, submitted as notes or stored locally since backend doesn't have image fields)
2. In EditTradeModal.tsx:
   - Update R:R warning threshold from 2.0 to 1.5
