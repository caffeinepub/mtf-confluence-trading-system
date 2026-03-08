import type { Trade } from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteTrade, useGetTrades } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Pencil,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EditTradeModal } from "./EditTradeModal";
import { ResultBadge } from "./ResultBadge";

export function TradeJournal() {
  const { data: trades, isLoading, isError } = useGetTrades();
  const deleteTrade = useDeleteTrade();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!trades) return [];
    let result = [...trades];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter((t) => t.pair.toLowerCase().includes(s));
    }
    if (filter !== "All") {
      result = result.filter((t) => t.result === filter);
    }
    result.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return result;
  }, [trades, search, filter]);

  async function handleDelete(id: bigint) {
    try {
      await deleteTrade.mutateAsync(id);
      toast.success("Trade deleted");
    } catch {
      toast.error("Failed to delete trade");
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Trade Journal
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {trades ? `${trades.length} trades recorded` : "Loading..."}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by pair..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="journal.search_input"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36" data-ocid="journal.filter_select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Results</SelectItem>
            <SelectItem value="Win">
              <span className="text-win font-semibold">Wins</span>
            </SelectItem>
            <SelectItem value="Loss">
              <span className="text-loss font-semibold">Losses</span>
            </SelectItem>
            <SelectItem value="Pending">
              <span className="text-pending font-semibold">Pending</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">
            {filter === "All" ? "All Trades" : `${filter}s`} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isError && (
            <div
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3 m-4"
              data-ocid="journal.error_state"
            >
              <AlertCircle className="w-4 h-4" />
              Failed to load trades
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3 p-4" data-ocid="journal.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="journal.empty_state"
            >
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No trades yet.</p>
              <p className="text-xs mt-1">Start by adding your first trade.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Pair
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Dir
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                      Entry
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                      SL
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                      TP
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      R:R
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Score
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      P&L
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Result
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((trade, i) => (
                    <TableRow
                      key={trade.id.toString()}
                      data-ocid={`journal.item.${i + 1}`}
                      className="border-border hover:bg-accent/30 transition-colors"
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {trade.date}
                      </TableCell>
                      <TableCell className="font-display font-semibold text-sm">
                        {trade.pair}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs font-mono font-bold flex items-center gap-1",
                            trade.direction === "Buy"
                              ? "text-win"
                              : "text-loss",
                          )}
                        >
                          {trade.direction === "Buy" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {trade.direction}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {trade.entry.toFixed(5)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-loss">
                        {trade.sl.toFixed(5)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-win">
                        {trade.tp.toFixed(5)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-mono text-xs font-semibold",
                            trade.rr >= 2 ? "text-win" : "text-loss",
                          )}
                        >
                          1:{trade.rr.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 w-20">
                          <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.min(trade.confluenceScore, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {trade.confluenceScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-mono text-xs font-semibold",
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
                      </TableCell>
                      <TableCell>
                        <ResultBadge result={trade.result} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditTrade(trade);
                              setEditOpen(true);
                            }}
                            data-ocid={`journal.edit_button.${i + 1}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                data-ocid={`journal.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Trade
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete {trade.pair} {trade.direction} trade
                                  from {trade.date}? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="journal.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(trade.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-ocid="journal.confirm_button"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditTradeModal
        trade={editTrade}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditTrade(null);
        }}
      />
    </div>
  );
}
