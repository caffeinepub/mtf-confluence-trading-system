import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Trade } from "../backend.d";
import { useActor } from "./useActor";

// ─── Queries ────────────────────────────────────────────────────────────────

export function useGetTrades() {
  const { actor, isFetching } = useActor();
  return useQuery<Trade[]>({
    queryKey: ["trades"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrades();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalTrades: BigInt(0),
          wins: BigInt(0),
          losses: BigInt(0),
          pending: BigInt(0),
          totalPnl: 0,
          winRate: 0,
          avgRR: 0,
        };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useAddTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trade: {
      date: string;
      pair: string;
      direction: string;
      marketStructureBias: string;
      weeklyBias: string;
      dailyBias: string;
      fourHBias: string;
      aoiLevel: string;
      marketStage: string;
      pattern4H: string;
      lowerTFSignal: string;
      candleType: string;
      entry: number;
      sl: number;
      tp: number;
      lotSize: number;
      riskPips: number;
      rewardPips: number;
      rr: number;
      pnl: number;
      notes: string;
      confluenceScore: number;
      result: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.addTrade(
        trade.date,
        trade.pair,
        trade.direction,
        trade.marketStructureBias,
        trade.weeklyBias,
        trade.dailyBias,
        trade.fourHBias,
        trade.aoiLevel,
        trade.marketStage,
        trade.pattern4H,
        trade.lowerTFSignal,
        trade.candleType,
        trade.entry,
        trade.sl,
        trade.tp,
        trade.lotSize,
        trade.riskPips,
        trade.rewardPips,
        trade.rr,
        trade.pnl,
        trade.notes,
        trade.confluenceScore,
        trade.result,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trade: {
      id: bigint;
      date: string;
      pair: string;
      direction: string;
      marketStructureBias: string;
      weeklyBias: string;
      dailyBias: string;
      fourHBias: string;
      aoiLevel: string;
      marketStage: string;
      pattern4H: string;
      lowerTFSignal: string;
      candleType: string;
      entry: number;
      sl: number;
      tp: number;
      lotSize: number;
      riskPips: number;
      rewardPips: number;
      rr: number;
      pnl: number;
      notes: string;
      confluenceScore: number;
      result: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.updateTrade(
        trade.id,
        trade.date,
        trade.pair,
        trade.direction,
        trade.marketStructureBias,
        trade.weeklyBias,
        trade.dailyBias,
        trade.fourHBias,
        trade.aoiLevel,
        trade.marketStage,
        trade.pattern4H,
        trade.lowerTFSignal,
        trade.candleType,
        trade.entry,
        trade.sl,
        trade.tp,
        trade.lotSize,
        trade.riskPips,
        trade.rewardPips,
        trade.rr,
        trade.pnl,
        trade.notes,
        trade.confluenceScore,
        trade.result,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.deleteTrade(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
