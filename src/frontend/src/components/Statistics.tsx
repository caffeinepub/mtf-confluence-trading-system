import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStats, useGetTrades } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Award,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function Statistics() {
  const { data: stats, isLoading: statsLoading, isError } = useGetStats();
  const { data: trades, isLoading: tradesLoading } = useGetTrades();

  const isLoading = statsLoading || tradesLoading;

  // P&L over time (cumulative)
  const pnlData = useMemo(() => {
    if (!trades) return [];
    const sorted = [...trades]
      .filter((t) => t.result !== "Pending")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    return sorted.map((t) => {
      cumulative += t.pnl;
      return {
        date: t.date,
        pnl: Number.parseFloat(cumulative.toFixed(2)),
        trade: `${t.pair} ${t.direction}`,
      };
    });
  }, [trades]);

  // Trades by pair
  const pairData = useMemo(() => {
    if (!trades) return [];
    const map: Record<string, { pair: string; count: number; wins: number }> =
      {};
    for (const t of trades) {
      if (!map[t.pair]) map[t.pair] = { pair: t.pair, count: 0, wins: 0 };
      map[t.pair].count++;
      if (t.result === "Win") map[t.pair].wins++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [trades]);

  // Win rate donut
  const winRateData = useMemo(() => {
    if (!stats) return [];
    const wins = Number(stats.wins);
    const losses = Number(stats.losses);
    const pending = Number(stats.pending);
    return [
      { name: "Wins", value: wins },
      { name: "Losses", value: losses },
      { name: "Pending", value: pending },
    ].filter((d) => d.value > 0);
  }, [stats]);

  // Best and worst trade
  const { bestTrade, worstTrade } = useMemo(() => {
    if (!trades || trades.length === 0)
      return { bestTrade: null, worstTrade: null };
    const sorted = [...trades].sort((a, b) => b.pnl - a.pnl);
    return { bestTrade: sorted[0], worstTrade: sorted[sorted.length - 1] };
  }, [trades]);

  const PIE_COLORS = [
    "oklch(0.7 0.19 145)", // win
    "oklch(0.62 0.22 25)", // loss
    "oklch(0.78 0.16 88)", // pending
  ];

  if (isError) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3"
        data-ocid="statistics.error_state"
      >
        <AlertCircle className="w-4 h-4" />
        Failed to load statistics
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Statistics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Trading performance analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Trades",
            value: stats ? Number(stats.totalTrades) : 0,
            icon: Target,
            suffix: "",
            color: "text-foreground",
          },
          {
            label: "Win Rate",
            value: stats ? stats.winRate.toFixed(1) : "0",
            icon: TrendingUp,
            suffix: "%",
            color: stats && stats.winRate >= 50 ? "text-win" : "text-loss",
          },
          {
            label: "Total P&L",
            value: stats
              ? (stats.totalPnl >= 0 ? "+" : "") + stats.totalPnl.toFixed(2)
              : "0.00",
            icon: stats && stats.totalPnl >= 0 ? TrendingUp : TrendingDown,
            suffix: "",
            prefix: "$",
            color: stats && stats.totalPnl >= 0 ? "text-win" : "text-loss",
          },
          {
            label: "Avg R:R",
            value: stats ? `1:${stats.avgRR.toFixed(2)}` : "1:0",
            icon: Award,
            suffix: "",
            color: stats && stats.avgRR >= 2 ? "text-win" : "text-pending",
          },
        ].map((item) => (
          <Card key={item.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </p>
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p
                  className={cn(
                    "text-2xl font-display font-bold font-mono tabular-nums",
                    item.color,
                  )}
                >
                  {item.prefix ?? ""}
                  {item.value}
                  {item.suffix}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Win Rate Donut */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display font-semibold">
              Win Rate Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : winRateData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No trade data yet
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winRateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {winRateData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.19 0.02 250)",
                        border: "1px solid oklch(0.28 0.02 250)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "oklch(0.92 0.008 240)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trades by Pair */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display font-semibold">
              Trades by Pair
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : pairData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No trade data yet
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pairData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="pair"
                      tick={{ fontSize: 10, fill: "oklch(0.58 0.015 240)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "oklch(0.58 0.015 240)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.19 0.02 250)",
                        border: "1px solid oklch(0.28 0.02 250)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "oklch(0.92 0.008 240)",
                      }}
                      formatter={(value: number, name: string) => [
                        value,
                        name === "count" ? "Trades" : "Wins",
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      name="count"
                      fill="oklch(0.65 0.18 250)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="wins"
                      name="wins"
                      fill="oklch(0.7 0.19 145)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* P&L Over Time */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-semibold">
            Cumulative P&L Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : pnlData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No closed trade data yet
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={pnlData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "oklch(0.58 0.015 240)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "oklch(0.58 0.015 240)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.19 0.02 250)",
                      border: "1px solid oklch(0.28 0.02 250)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "oklch(0.92 0.008 240)",
                    }}
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      "Cumulative P&L",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="oklch(0.72 0.18 165)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "oklch(0.72 0.18 165)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best / Worst Trade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            label: "Best Trade",
            trade: bestTrade,
            color: "border-win/30 bg-win-subtle",
          },
          {
            label: "Worst Trade",
            trade: worstTrade,
            color: "border-loss/30 bg-loss-subtle",
          },
        ].map(({ label, trade, color }) => (
          <Card key={label} className={cn("border", color)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : !trade ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-lg">
                      {trade.pair}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {trade.direction} · {trade.date} · R:R 1:
                      {trade.rr.toFixed(2)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-2xl font-display font-bold font-mono",
                      trade.pnl >= 0 ? "text-win" : "text-loss",
                    )}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* W/L/P Summary */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Wins",
              value: Number(stats.wins),
              color: "text-win",
              bg: "bg-win-subtle",
            },
            {
              label: "Losses",
              value: Number(stats.losses),
              color: "text-loss",
              bg: "bg-loss-subtle",
            },
            {
              label: "Pending",
              value: Number(stats.pending),
              color: "text-pending",
              bg: "bg-pending-subtle",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn("rounded-md p-4 text-center", item.bg)}
            >
              <p
                className={cn(
                  "text-3xl font-display font-bold font-mono",
                  item.color,
                )}
              >
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
