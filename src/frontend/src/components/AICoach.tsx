import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart2,
  BookOpen,
  Clock,
  MapPin,
  Shield,
  TrendingUp,
} from "lucide-react";

const RULES = [
  {
    number: 1,
    icon: BarChart2,
    title: "Market Structure",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    body: "Confirm Weekly → Daily → 4H alignment before any entry. All three must agree on direction.",
    tags: ["Weekly", "Daily", "4H"],
  },
  {
    number: 2,
    icon: MapPin,
    title: "AOI Marking",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    body: "Mark key Areas of Interest on Weekly, then refine on Daily. Only trade FROM these zones.",
    tags: ["Weekly AOI", "Daily Refinement", "Zone Trading"],
  },
  {
    number: 3,
    icon: TrendingUp,
    title: "Market Stage",
    color: "text-pending",
    bg: "bg-pending-subtle",
    border: "border-pending/20",
    body: "Stage 1 (Accumulation) = wait. Stage 2 (Markup/Markdown) = trade with trend. Stage 3 (Distribution) = wait or counter-trend only.",
    tags: ["Stage 1", "Stage 2", "Stage 3"],
  },
  {
    number: 4,
    icon: BookOpen,
    title: "4H Pattern",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    body: "Look for HL in uptrend or LH in downtrend on 4H to confirm continuation. No pattern = no trade.",
    tags: ["HL", "LH", "Continuation"],
  },
  {
    number: 5,
    icon: Clock,
    title: "Lower TF Entry",
    color: "text-win",
    bg: "bg-win-subtle",
    border: "border-win/20",
    body: "Drop to 15m/30m/1H for entry confirmation. Wait for engulfing or doji candle at AOI.",
    tags: ["15m", "30m", "1H", "Candle Confirm"],
  },
  {
    number: 6,
    icon: Shield,
    title: "Risk Management",
    color: "text-loss",
    bg: "bg-loss-subtle",
    border: "border-loss/20",
    body: "Always use 5-7 pip buffer beyond structure for SL. TP at next HH (uptrend) or LL (downtrend). Minimum 1:2 R:R.",
    tags: ["5-7 pip buffer", "1:2 R:R", "HH/LL TP"],
  },
];

export function AICoach() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          AI Strategy Coach
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          MTF Confluence Strategy — Reference Guide
        </p>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground">
                Multi-Timeframe Confluence Strategy
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                A systematic top-down analysis approach using market structure,
                AOI zones, market stages, and multi-timeframe confirmation for
                high-probability entries.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  "90%+ Score Required",
                  "1:2 Minimum R:R",
                  "5-Step Checklist",
                  "3-TF Alignment",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-primary/30 text-primary bg-primary/10"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RULES.map((rule) => (
          <Card
            key={rule.number}
            className={`bg-card border ${rule.border} transition-all hover:shadow-card`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-md ${rule.bg} border ${rule.border} flex items-center justify-center flex-shrink-0`}
                >
                  <rule.icon className={`w-4.5 h-4.5 ${rule.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold ${rule.color} opacity-70`}
                    >
                      RULE {String(rule.number).padStart(2, "0")}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-display font-bold mt-0.5">
                    {rule.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rule.body}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {rule.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-[11px] px-2 py-0.5 ${rule.bg} ${rule.color} border ${rule.border}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategy Flow */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display font-semibold">
            Strategy Entry Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {[
              {
                step: "1",
                label: "Weekly Chart Analysis",
                sub: "Identify trend direction & key AOIs",
              },
              {
                step: "2",
                label: "Daily Chart Refinement",
                sub: "Confirm bias, refine AOI zones",
              },
              {
                step: "3",
                label: "4H Structure Check",
                sub: "HL in uptrend / LH in downtrend",
              },
              {
                step: "4",
                label: "Lower TF Confirmation",
                sub: "15m/30m/1H entry signal at AOI",
              },
              {
                step: "5",
                label: "Risk Management",
                sub: "5-7 pip buffer SL, 1:2+ R:R, position size",
              },
            ].map((item, idx) => (
              <div key={item.step} className="flex gap-4 mb-3 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {item.step}
                  </div>
                  {idx < 4 && (
                    <div className="w-px flex-1 bg-border mt-1.5 min-h-4" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="font-display font-semibold text-sm text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
