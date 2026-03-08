import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStats, useGetTrades } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  BarChart2,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ResultBadge } from "./ResultBadge";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetStats();
  const { data: trades, isLoading: tradesLoading } = useGetTrades();

  const recentTrades = trades
    ? [...trades]
        .sort((a, b) => {
          const aTime =
            typeof a.createdAt === "bigint" ? Number(a.createdAt) : 0;
          const bTime =
            typeof b.createdAt === "bigint" ? Number(b.createdAt) : 0;
          return bTime - aTime;
        })
        .slice(0, 5)
    : [];

  const statCards = [
    {
      label: "Total Trades",
      value: statsLoading
        ? null
        : stats
          ? Number(stats.totalTrades).toString()
          : "0",
      icon: Activity,
      color: "text-foreground",
      bg: "bg-card",
      sub: "All time",
    },
    {
      label: "Win Rate",
      value: statsLoading
        ? null
        : stats
          ? `${stats.winRate.toFixed(1)}%`
          : "0%",
      icon: TrendingUp,
      color: stats && stats.winRate >= 50 ? "text-win" : "text-loss",
      bg: "bg-card",
      sub: stats ? `${Number(stats.wins)}W / ${Number(stats.losses)}L` : "–",
    },
    {
      label: "Total P&L",
      value: statsLoading
        ? null
        : stats
          ? `$${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)}`
          : "$0.00",
      icon: stats && stats.totalPnl >= 0 ? TrendingUp : TrendingDown,
      color: stats && stats.totalPnl >= 0 ? "text-win" : "text-loss",
      bg: "bg-card",
      sub: "USD",
    },
    {
      label: "Avg R:R",
      value: statsLoading
        ? null
        : stats
          ? `1:${stats.avgRR.toFixed(2)}`
          : "1:0",
      icon: BarChart2,
      color: stats && stats.avgRR >= 2 ? "text-win" : "text-pending",
      bg: "bg-card",
      sub: "Target: 1:2",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            MTF Confluence System Overview
          </p>
        </div>
        <Button
          onClick={() => onNavigate("new-trade")}
          className="gap-2 font-semibold"
          data-ocid="dashboard.new_trade_button"
        >
          <Plus className="w-4 h-4" />
          New Trade
        </Button>
      </div>

      {/* Stats Grid */}
      {statsError && (
        <div
          className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
          data-ocid="dashboard.error_state"
        >
          <AlertCircle className="w-4 h-4" />
          Failed to load statistics. Please try again.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </p>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              {card.value === null ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p
                  className={cn(
                    "text-2xl font-display font-bold font-mono tabular-nums",
                    card.color,
                  )}
                >
                  {card.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Trades */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-semibold">
              Recent Trades
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate("journal")}
            >
              View all →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tradesLoading ? (
            <div className="space-y-3" data-ocid="dashboard.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentTrades.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="dashboard.empty_state"
            >
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No trades yet.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onNavigate("new-trade")}
              >
                Add your first trade
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_100px_70px_80px] gap-2 px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Pair / Direction</span>
                <span>Date</span>
                <span>Confluence</span>
                <span>Result</span>
                <span className="text-right">P&L</span>
              </div>
              <div className="h-px bg-border" />
              {recentTrades.map((trade) => (
                <div
                  key={trade.id.toString()}
                  className="grid grid-cols-[1fr_80px_100px_70px_80px] gap-2 items-center px-3 py-2.5 rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <span className="font-display font-semibold text-sm text-foreground">
                      {trade.pair}
                    </span>
                    <span
                      className={cn(
                        "ml-2 text-xs font-mono font-semibold",
                        trade.direction === "Buy" ? "text-win" : "text-loss",
                      )}
                    >
                      {trade.direction.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {trade.date}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(trade.confluenceScore, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                      {trade.confluenceScore}%
                    </span>
                  </div>
                  <ResultBadge
                    result={trade.result}
                    className="text-[11px] px-1.5 py-0"
                  />
                  <span
                    className={cn(
                      "text-right text-sm font-mono font-semibold",
                      trade.pnl > 0
                        ? "text-win"
                        : trade.pnl < 0
                          ? "text-loss"
                          : "text-muted-foreground",
                    )}
                  >
                    {trade.pnl !== 0
                      ? `${trade.pnl > 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`
                      : "–"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Footer */}
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
                  "text-2xl font-display font-bold font-mono",
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
