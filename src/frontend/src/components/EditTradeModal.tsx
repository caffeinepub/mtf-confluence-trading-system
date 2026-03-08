import type { Trade } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTrade } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

function calcPips(p1: number, p2: number, pair: string) {
  const m = PIP_MULTIPLIERS[pair] ?? 10000;
  return Math.abs(p1 - p2) * m;
}

interface EditTradeModalProps {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
}

export function EditTradeModal({ trade, open, onClose }: EditTradeModalProps) {
  const updateTrade = useUpdateTrade();

  const [result, setResult] = useState("Pending");
  const [pnl, setPnl] = useState("0");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [notes, setNotes] = useState("");
  const [rr, setRr] = useState(0);
  const [riskPips, setRiskPips] = useState(0);
  const [rewardPips, setRewardPips] = useState(0);

  // Populate when trade changes
  useEffect(() => {
    if (!trade) return;
    setResult(trade.result);
    setPnl(trade.pnl.toString());
    setEntry(trade.entry.toString());
    setSl(trade.sl.toString());
    setTp(trade.tp.toString());
    setNotes(trade.notes);
    setRr(trade.rr);
    setRiskPips(trade.riskPips);
    setRewardPips(trade.rewardPips);
  }, [trade]);

  // Recompute RR when prices change
  useEffect(() => {
    if (!trade?.pair) return;
    const e = Number.parseFloat(entry);
    const s = Number.parseFloat(sl);
    const t = Number.parseFloat(tp);
    if (Number.isNaN(e) || Number.isNaN(s) || Number.isNaN(t)) return;
    const risk = calcPips(e, s, trade.pair);
    const reward = calcPips(t, e, trade.pair);
    setRiskPips(Number.parseFloat(risk.toFixed(1)));
    setRewardPips(Number.parseFloat(reward.toFixed(1)));
    setRr(risk > 0 ? Number.parseFloat((reward / risk).toFixed(2)) : 0);
  }, [entry, sl, tp, trade?.pair]);

  async function handleSave() {
    if (!trade) return;
    try {
      await updateTrade.mutateAsync({
        id: trade.id,
        date: trade.date,
        pair: trade.pair,
        direction: trade.direction,
        marketStructureBias: trade.marketStructureBias,
        weeklyBias: trade.weeklyBias,
        dailyBias: trade.dailyBias,
        fourHBias: trade.fourHBias,
        aoiLevel: trade.aoiLevel,
        marketStage: trade.marketStage,
        pattern4H: trade.pattern4H,
        lowerTFSignal: trade.lowerTFSignal,
        candleType: trade.candleType,
        entry: Number.parseFloat(entry) || trade.entry,
        sl: Number.parseFloat(sl) || trade.sl,
        tp: Number.parseFloat(tp) || trade.tp,
        lotSize: trade.lotSize,
        riskPips,
        rewardPips,
        rr,
        pnl: Number.parseFloat(pnl) || 0,
        notes,
        confluenceScore: trade.confluenceScore,
        result,
      });
      toast.success("Trade updated successfully!");
      onClose();
    } catch {
      toast.error("Failed to update trade");
    }
  }

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg bg-card border-border"
        data-ocid="edit_trade.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            Edit Trade — {trade.pair}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Update result, P&L, prices, and notes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Result & P&L */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Result</Label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Win">
                    <span className="text-win font-semibold">Win</span>
                  </SelectItem>
                  <SelectItem value="Loss">
                    <span className="text-loss font-semibold">Loss</span>
                  </SelectItem>
                  <SelectItem value="Pending">
                    <span className="text-pending font-semibold">Pending</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>P&L ($)</Label>
              <Input
                type="number"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                className="font-mono"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Entry</Label>
              <Input
                type="number"
                step="0.00001"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stop Loss</Label>
              <Input
                type="number"
                step="0.00001"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Take Profit</Label>
              <Input
                type="number"
                step="0.00001"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          {/* Computed RR */}
          <div className="grid grid-cols-3 gap-3 bg-secondary/60 rounded-md p-3 text-center">
            {[
              { label: "Risk Pips", value: riskPips.toFixed(1) },
              { label: "Reward Pips", value: rewardPips.toFixed(1) },
              {
                label: "R:R",
                value: `1:${rr.toFixed(2)}`,
                cls: rr >= 2 ? "text-win" : "text-loss",
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "font-display font-bold font-mono text-lg",
                    item.cls ?? "text-foreground",
                  )}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {rr < 2 && rr > 0 && (
            <div className="flex items-center gap-2 text-xs text-loss bg-loss-subtle border border-loss/20 rounded p-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              R:R below 2.0 — strategy requires minimum 1:2
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
              placeholder="Trade notes..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="edit_trade.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateTrade.isPending}
            data-ocid="edit_trade.save_button"
          >
            {updateTrade.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
