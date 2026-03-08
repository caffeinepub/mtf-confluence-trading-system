import type { Trade } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTrades } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ResultBadge } from "./ResultBadge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarView() {
  const { data: trades, isLoading } = useGetTrades();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }

  // Build calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group trades by date
  const tradesByDate = useMemo(() => {
    const map: Record<string, Trade[]> = {};
    if (!trades) return map;
    for (const trade of trades) {
      if (!map[trade.date]) map[trade.date] = [];
      map[trade.date].push(trade);
    }
    return map;
  }, [trades]);

  const selectedTrades = selectedDay ? (tradesByDate[selectedDay] ?? []) : [];

  function formatDate(day: number): string {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Trade activity by date
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Calendar Grid */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display font-semibold">
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7"
                  onClick={nextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-[11px] text-muted-foreground font-semibold uppercase py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {/* Empty cells for first day offset */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static empty cells
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = formatDate(day);
                    const dayTrades = tradesByDate[dateStr] ?? [];
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDay;
                    const hasWin = dayTrades.some((t) => t.result === "Win");
                    const hasLoss = dayTrades.some((t) => t.result === "Loss");
                    const hasPending = dayTrades.some(
                      (t) => t.result === "Pending",
                    );

                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() =>
                          setSelectedDay(isSelected ? null : dateStr)
                        }
                        className={cn(
                          "aspect-square rounded-md flex flex-col items-center justify-start p-1 transition-all hover:bg-accent",
                          isSelected && "ring-1 ring-primary bg-primary/10",
                          isToday && !isSelected && "ring-1 ring-border",
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-mono",
                            isToday
                              ? "text-primary font-bold"
                              : "text-foreground",
                            dayTrades.length === 0 && "text-muted-foreground",
                          )}
                        >
                          {day}
                        </span>
                        {dayTrades.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                            {hasWin && (
                              <span className="w-1.5 h-1.5 rounded-full bg-win" />
                            )}
                            {hasLoss && (
                              <span className="w-1.5 h-1.5 rounded-full bg-loss" />
                            )}
                            {hasPending && (
                              <span className="w-1.5 h-1.5 rounded-full bg-pending" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-win" />
                Win
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-loss" />
                Loss
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pending" />
                Pending
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Panel */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display font-semibold text-muted-foreground">
                {selectedDay
                  ? new Date(`${selectedDay}T12:00:00`).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      },
                    )
                  : "Select a day"}
              </CardTitle>
              {selectedDay && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => setSelectedDay(null)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-xs text-muted-foreground">
                Click a day on the calendar to see trades for that day.
              </p>
            ) : selectedTrades.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No trades on this day.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedTrades.map((trade) => (
                  <div
                    key={trade.id.toString()}
                    className="p-3 bg-secondary/60 rounded-md border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-sm">
                        {trade.pair}
                      </span>
                      <ResultBadge
                        result={trade.result}
                        className="text-[11px] px-1.5 py-0"
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span
                        className={
                          trade.direction === "Buy" ? "text-win" : "text-loss"
                        }
                      >
                        {trade.direction}
                      </span>
                      <span>R:R 1:{trade.rr.toFixed(2)}</span>
                      <span
                        className={cn(
                          "font-semibold",
                          trade.pnl > 0
                            ? "text-win"
                            : trade.pnl < 0
                              ? "text-loss"
                              : "text-muted-foreground",
                        )}
                      >
                        {trade.pnl !== 0
                          ? `${trade.pnl > 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`
                          : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(trade.confluenceScore, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {trade.confluenceScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
