import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddTrade } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Info,
  Loader2,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TradeFormProps {
  onNavigate: (view: string) => void;
}

// ─── Pip Multipliers ─────────────────────────────────────────────────────────
const PIP_MULTIPLIERS: Record<string, number> = {
  USDJPY: 100,
  GBPJPY: 100,
  EURJPY: 100,
  XAUUSD: 10,
  EURUSD: 10000,
  GBPUSD: 10000,
  AUDUSD: 10000,
  USDCAD: 10000,
  USDCHF: 10000,
  NZDUSD: 10000,
};

const PIP_VALUES: Record<string, number> = {
  USDJPY: 0.01,
  GBPJPY: 0.01,
  EURJPY: 0.01,
  XAUUSD: 0.1,
  EURUSD: 0.0001,
  GBPUSD: 0.0001,
  AUDUSD: 0.0001,
  USDCAD: 0.0001,
  USDCHF: 0.0001,
  NZDUSD: 0.0001,
};

// ─── Step Weights ─────────────────────────────────────────────────────────────
const STEP_WEIGHTS = [25, 20, 20, 20, 15];
const STEP_TITLES = [
  "Market Structure",
  "AOI & Market Stage",
  "4H Pattern",
  "Lower TF Confirmation",
  "Risk Management & Review",
];

function calcPips(price1: number, price2: number, pair: string): number {
  const multiplier = PIP_MULTIPLIERS[pair] ?? 10000;
  return Math.abs(price1 - price2) * multiplier;
}

export function TradeForm({ onNavigate }: TradeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Step 1
  const [weeklyBias, setWeeklyBias] = useState("");
  const [dailyBias, setDailyBias] = useState("");
  const [fourHBias, setFourHBias] = useState("");
  const [marketStructureBias, setMarketStructureBias] = useState("");

  // Step 2
  const [aoiLevel, setAoiLevel] = useState("");
  const [marketStage, setMarketStage] = useState("");

  // Step 3
  const [pattern4H, setPattern4H] = useState("");
  const [patternNotes, setPatternNotes] = useState("");

  // Step 4
  const [timeframe, setTimeframe] = useState("");
  const [lowerTFSignal, setLowerTFSignal] = useState("");
  const [candleType, setCandleType] = useState("");

  // Step 5
  const [pair, setPair] = useState("");
  const [direction, setDirection] = useState("");
  const [tradeDate, setTradeDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [notes, setNotes] = useState("");

  // Computed risk values
  const [riskPips, setRiskPips] = useState(0);
  const [rewardPips, setRewardPips] = useState(0);
  const [rr, setRr] = useState(0);
  const [lotSize, setLotSize] = useState(0);

  const addTrade = useAddTrade();

  // ─── Auto-compute market structure bias ───────────────────────────────────
  useEffect(() => {
    if (weeklyBias && dailyBias && fourHBias) {
      const biases = [weeklyBias, dailyBias, fourHBias];
      const bullishCount = biases.filter((b) => b === "Bullish").length;
      const bearishCount = biases.filter((b) => b === "Bearish").length;
      if (bullishCount >= 2) setMarketStructureBias("Bullish Confluence");
      else if (bearishCount >= 2) setMarketStructureBias("Bearish Confluence");
      else setMarketStructureBias("Mixed / No Confluence");
    }
  }, [weeklyBias, dailyBias, fourHBias]);

  // ─── Compute risk metrics ─────────────────────────────────────────────────
  useEffect(() => {
    const e = Number.parseFloat(entry);
    const s = Number.parseFloat(sl);
    const t = Number.parseFloat(tp);
    const bal = Number.parseFloat(accountBalance);

    if (!pair || Number.isNaN(e) || Number.isNaN(s) || Number.isNaN(t)) {
      setRiskPips(0);
      setRewardPips(0);
      setRr(0);
      setLotSize(0);
      return;
    }

    const risk = calcPips(e, s, pair);
    const reward = calcPips(t, e, pair);
    const ratio = risk > 0 ? reward / risk : 0;

    setRiskPips(Number.parseFloat(risk.toFixed(1)));
    setRewardPips(Number.parseFloat(reward.toFixed(1)));
    setRr(Number.parseFloat(ratio.toFixed(2)));

    if (!Number.isNaN(bal) && bal > 0 && risk > 0) {
      const pipValue = PIP_VALUES[pair] ?? 0.0001;
      const riskAmount = bal * 0.01;
      const lots = riskAmount / (risk * pipValue * 100000);
      setLotSize(Number.parseFloat(lots.toFixed(2)));
    }
  }, [entry, sl, tp, pair, accountBalance]);

  // ─── Step Validation ──────────────────────────────────────────────────────
  const isStep1Valid = !!weeklyBias && !!dailyBias && !!fourHBias;
  const isStep2Valid = !!aoiLevel.trim() && !!marketStage;
  const isStep3Valid = !!pattern4H;
  const isStep4Valid = !!timeframe && !!lowerTFSignal && !!candleType;
  const isStep5Valid =
    !!pair &&
    !!direction &&
    !!tradeDate &&
    !!entry &&
    !!sl &&
    !!tp &&
    !!accountBalance &&
    rr >= 2.0;

  const stepValid = [
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isStep5Valid,
  ];

  const confluenceScore = STEP_WEIGHTS.reduce((acc, weight, i) => {
    return acc + (completedSteps[i] ? weight : 0);
  }, 0);

  const canSubmit = confluenceScore >= 90;

  function handleCompleteStep(stepIndex: number) {
    if (!stepValid[stepIndex]) return;
    const updated = [...completedSteps];
    updated[stepIndex] = true;
    setCompletedSteps(updated);
    if (stepIndex < 4) setCurrentStep(stepIndex + 1);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await addTrade.mutateAsync({
        date: tradeDate,
        pair,
        direction,
        marketStructureBias,
        weeklyBias,
        dailyBias,
        fourHBias,
        aoiLevel,
        marketStage,
        pattern4H: pattern4H + (patternNotes ? ` (${patternNotes})` : ""),
        lowerTFSignal: `${timeframe} ${lowerTFSignal}`,
        candleType,
        entry: Number.parseFloat(entry),
        sl: Number.parseFloat(sl),
        tp: Number.parseFloat(tp),
        lotSize,
        riskPips,
        rewardPips,
        rr,
        pnl: 0,
        notes,
        confluenceScore,
        result: "Pending",
      });
      toast.success("Trade saved successfully!");
      onNavigate("journal");
    } catch (_err) {
      toast.error("Failed to save trade. Please try again.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          New Trade
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete all steps to qualify your trade entry
        </p>
      </div>

      {/* Confluence Score Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Confluence Score
            </span>
            <span
              className={cn(
                "text-lg font-display font-bold font-mono tabular-nums",
                confluenceScore >= 90
                  ? "text-win"
                  : confluenceScore >= 60
                    ? "text-pending"
                    : "text-loss",
              )}
            >
              {confluenceScore}%
            </span>
          </div>
          <Progress
            value={confluenceScore}
            className={cn(
              "h-2.5",
              confluenceScore >= 90
                ? "[&>div]:bg-win"
                : confluenceScore >= 60
                  ? "[&>div]:bg-pending"
                  : "[&>div]:bg-loss",
            )}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {confluenceScore >= 90
              ? "✓ Ready to submit — minimum 90% reached"
              : `${90 - confluenceScore}% more needed to unlock submission`}
          </p>
        </CardContent>
      </Card>

      {/* Step Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STEP_TITLES.map((title, idx) => {
          const isComplete = completedSteps[idx];
          const isCurrent = currentStep === idx;
          const isLocked = idx > 0 && !completedSteps[idx - 1] && !isCurrent;

          return (
            <button
              type="button"
              key={STEP_TITLES[idx]}
              data-ocid={`trade_form.step${idx + 1}_button`}
              onClick={() => {
                if (!isLocked) setCurrentStep(idx);
              }}
              disabled={isLocked}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all",
                isComplete
                  ? "bg-win-subtle text-win border border-win/30"
                  : isCurrent
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : isLocked
                      ? "opacity-40 bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  isComplete
                    ? "bg-win text-primary-foreground"
                    : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="w-3 h-3" />
                ) : isLocked ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : (
                  idx + 1
                )}
              </span>
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">S{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      {/* STEP 1 */}
      {currentStep === 0 && (
        <StepCard
          step={1}
          title="Market Structure"
          weight={STEP_WEIGHTS[0]}
          isComplete={completedSteps[0]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Weekly Bias</Label>
              <Select value={weeklyBias} onValueChange={setWeeklyBias}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select bias" />
                </SelectTrigger>
                <SelectContent>
                  {["Bullish", "Bearish", "Ranging"].map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Daily Bias</Label>
              <Select value={dailyBias} onValueChange={setDailyBias}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select bias" />
                </SelectTrigger>
                <SelectContent>
                  {["Bullish", "Bearish", "Ranging"].map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>4H Bias</Label>
              <Select value={fourHBias} onValueChange={setFourHBias}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select bias" />
                </SelectTrigger>
                <SelectContent>
                  {["Bullish", "Bearish", "Ranging"].map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {marketStructureBias && (
            <div className="mt-3 p-3 bg-accent/30 rounded-md border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Overall Bias
              </p>
              <p
                className={cn(
                  "font-display font-semibold",
                  marketStructureBias.includes("Bullish")
                    ? "text-win"
                    : marketStructureBias.includes("Bearish")
                      ? "text-loss"
                      : "text-pending",
                )}
              >
                {marketStructureBias}
              </p>
            </div>
          )}
          <StepFooter
            isValid={isStep1Valid}
            isComplete={completedSteps[0]}
            onComplete={() => handleCompleteStep(0)}
          />
        </StepCard>
      )}

      {/* STEP 2 */}
      {currentStep === 1 && (
        <StepCard
          step={2}
          title="AOI & Market Stage"
          weight={STEP_WEIGHTS[1]}
          isComplete={completedSteps[1]}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>AOI Level</Label>
              <Input
                placeholder="e.g. 1.2850 - 1.2880"
                value={aoiLevel}
                onChange={(e) => setAoiLevel(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Mark the key zone where price should react
              </p>
            </div>
            <div className="space-y-2">
              <Label>Market Stage</Label>
              <RadioGroup
                value={marketStage}
                onValueChange={setMarketStage}
                className="space-y-2"
              >
                {[
                  {
                    value: "Stage 1 - Accumulation",
                    label: "Stage 1 — Accumulation",
                    desc: "Wait for confirmation",
                    color: "text-pending",
                  },
                  {
                    value: "Stage 2 - Markup",
                    label: "Stage 2 — Markup/Markdown",
                    desc: "Trade with trend",
                    color: "text-win",
                  },
                  {
                    value: "Stage 3 - Distribution",
                    label: "Stage 3 — Distribution",
                    desc: "Wait or counter-trend only",
                    color: "text-loss",
                  },
                ].map((stage) => (
                  <label
                    key={stage.value}
                    htmlFor={`stage-${stage.value}`}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all",
                      marketStage === stage.value
                        ? "border-primary/50 bg-primary/10"
                        : "border-border hover:border-muted-foreground/40",
                    )}
                  >
                    <RadioGroupItem
                      id={`stage-${stage.value}`}
                      value={stage.value}
                      className="mt-0.5"
                    />
                    <div>
                      <p className={cn("font-semibold text-sm", stage.color)}>
                        {stage.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stage.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
          <StepFooter
            isValid={isStep2Valid}
            isComplete={completedSteps[1]}
            onComplete={() => handleCompleteStep(1)}
          />
        </StepCard>
      )}

      {/* STEP 3 */}
      {currentStep === 2 && (
        <StepCard
          step={3}
          title="4H Pattern"
          weight={STEP_WEIGHTS[2]}
          isComplete={completedSteps[2]}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Pattern Type <span className="text-destructive">*</span>
              </Label>
              <Select value={pattern4H} onValueChange={setPattern4H}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Higher Low (HL)",
                    "Lower High (LH)",
                    "Double Bottom",
                    "Double Top",
                    "Other",
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Pattern Notes{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                placeholder="Describe the pattern formation..."
                value={patternNotes}
                onChange={(e) => setPatternNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <StepFooter
            isValid={isStep3Valid}
            isComplete={completedSteps[2]}
            onComplete={() => handleCompleteStep(2)}
          />
        </StepCard>
      )}

      {/* STEP 4 */}
      {currentStep === 3 && (
        <StepCard
          step={4}
          title="Lower TF Confirmation"
          weight={STEP_WEIGHTS[3]}
          isComplete={completedSteps[3]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>
                Timeframe <span className="text-destructive">*</span>
              </Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select TF" />
                </SelectTrigger>
                <SelectContent>
                  {["15m", "30m", "1H"].map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Signal <span className="text-destructive">*</span>
              </Label>
              <Select value={lowerTFSignal} onValueChange={setLowerTFSignal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select signal" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Break of Structure",
                    "Inducement",
                    "Liquidity Grab",
                    "Fair Value Gap",
                    "Other",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Candle Type <span className="text-destructive">*</span>
              </Label>
              <Select value={candleType} onValueChange={setCandleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select candle" />
                </SelectTrigger>
                <SelectContent>
                  {["Engulfing", "Doji", "Pin Bar", "Inside Bar", "Other"].map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <StepFooter
            isValid={isStep4Valid}
            isComplete={completedSteps[3]}
            onComplete={() => handleCompleteStep(3)}
          />
        </StepCard>
      )}

      {/* STEP 5 */}
      {currentStep === 4 && (
        <StepCard
          step={5}
          title="Risk Management & Review"
          weight={STEP_WEIGHTS[4]}
          isComplete={completedSteps[4]}
        >
          <div className="space-y-5">
            {/* Trade Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Currency Pair <span className="text-destructive">*</span>
                </Label>
                <Select value={pair} onValueChange={setPair}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "EURUSD",
                      "GBPUSD",
                      "USDJPY",
                      "AUDUSD",
                      "USDCAD",
                      "USDCHF",
                      "NZDUSD",
                      "GBPJPY",
                      "EURJPY",
                      "XAUUSD",
                    ].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Direction <span className="text-destructive">*</span>
                </Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buy / Sell" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">
                      <span className="text-win font-semibold">Buy (Long)</span>
                    </SelectItem>
                    <SelectItem value="Sell">
                      <span className="text-loss font-semibold">
                        Sell (Short)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Trade Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={tradeDate}
                  onChange={(e) => setTradeDate(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Price Levels */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Entry Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="0.00000"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Stop Loss <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="0.00000"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Take Profit <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="0.00000"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Account Balance */}
            <div className="space-y-1.5">
              <Label>
                Account Balance ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="10000"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className="font-mono w-full sm:w-48"
              />
            </div>

            {/* Risk Calculator Results */}
            {pair && entry && sl && tp && (
              <div className="bg-secondary/60 rounded-md border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Risk Calculator
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Risk Pips",
                      value: riskPips.toString(),
                      unit: "pips",
                    },
                    {
                      label: "Reward Pips",
                      value: rewardPips.toString(),
                      unit: "pips",
                    },
                    {
                      label: "R:R Ratio",
                      value: `1:${rr.toFixed(2)}`,
                      unit: "",
                      highlight: rr >= 2 ? "text-win" : "text-loss",
                    },
                    {
                      label: "Position Size",
                      value: lotSize.toFixed(2),
                      unit: "lots",
                    },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p
                        className={cn(
                          "text-xl font-display font-bold font-mono mt-0.5",
                          item.highlight ?? "text-foreground",
                        )}
                      >
                        {item.value}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          {item.unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                {rr < 2 && (riskPips > 0 || rewardPips > 0) && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-loss bg-loss-subtle border border-loss/20 rounded-md p-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    R:R ratio must be ≥ 2.0 to submit this trade
                  </div>
                )}

                <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Use 5-7 pip buffer beyond structure for Stop Loss placement
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Trade Notes</Label>
              <Textarea
                placeholder="Trade rationale, confluences, emotional state..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <StepFooter
              isValid={isStep5Valid}
              isComplete={completedSteps[4]}
              onComplete={() => handleCompleteStep(4)}
              customMessage={
                !isStep5Valid && rr > 0 && rr < 2
                  ? "R:R must be ≥ 2.0"
                  : undefined
              }
            />
          </div>
        </StepCard>
      )}

      {/* Submit */}
      {confluenceScore > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p
            className={cn(
              "text-sm",
              canSubmit ? "text-win" : "text-muted-foreground",
            )}
          >
            {canSubmit
              ? "All requirements met — ready to submit"
              : `Complete all steps to reach 90% (currently ${confluenceScore}%)`}
          </p>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit || addTrade.isPending}
            className={cn("font-semibold gap-2", canSubmit && "shadow-glow")}
            data-ocid="trade_form.submit_button"
          >
            {addTrade.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Submit Trade
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  weight,
  isComplete,
  children,
}: {
  step: number;
  title: string;
  weight: number;
  isComplete: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "border-border transition-all",
        isComplete ? "step-complete" : "step-active",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                isComplete
                  ? "bg-win text-primary-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {isComplete ? <Check className="w-3.5 h-3.5" /> : step}
            </span>
            <CardTitle className="text-base font-display">{title}</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            +{weight}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function StepFooter({
  isValid,
  isComplete,
  onComplete,
  customMessage,
}: {
  isValid: boolean;
  isComplete: boolean;
  onComplete: () => void;
  customMessage?: string;
}) {
  if (isComplete) {
    return (
      <div className="flex items-center gap-2 text-sm text-win pt-2 border-t border-border">
        <Check className="w-4 h-4" />
        Step completed
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border">
      {!isValid && (
        <p className="text-xs text-muted-foreground">
          {customMessage ?? "Fill all required fields to continue"}
        </p>
      )}
      <Button
        size="sm"
        onClick={onComplete}
        disabled={!isValid}
        className="ml-auto gap-1.5"
      >
        Complete Step <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
