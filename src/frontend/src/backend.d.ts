import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Trade {
    id: bigint;
    rr: number;
    sl: number;
    tp: number;
    pnl: number;
    result: string;
    fourHBias: string;
    direction: string;
    dailyBias: string;
    owner: Principal;
    date: string;
    createdAt: bigint;
    pair: string;
    riskPips: number;
    entry: number;
    marketStage: string;
    rewardPips: number;
    weeklyBias: string;
    notes: string;
    pattern4H: string;
    candleType: string;
    lowerTFSignal: string;
    aoiLevel: string;
    confluenceScore: number;
    marketStructureBias: string;
    lotSize: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTrade(date: string, pair: string, direction: string, marketStructureBias: string, weeklyBias: string, dailyBias: string, fourHBias: string, aoiLevel: string, marketStage: string, pattern4H: string, lowerTFSignal: string, candleType: string, entry: number, sl: number, tp: number, lotSize: number, riskPips: number, rewardPips: number, rr: number, pnl: number, notes: string, confluenceScore: number, result: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTrade(id: bigint): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    getStats(): Promise<{
        totalTrades: bigint;
        avgRR: number;
        pending: bigint;
        wins: bigint;
        losses: bigint;
        totalPnl: number;
        winRate: number;
    }>;
    getTradeById(id: bigint): Promise<Trade | null>;
    getTrades(): Promise<Array<Trade>>;
    isCallerAdmin(): Promise<boolean>;
    updateTrade(id: bigint, date: string, pair: string, direction: string, marketStructureBias: string, weeklyBias: string, dailyBias: string, fourHBias: string, aoiLevel: string, marketStage: string, pattern4H: string, lowerTFSignal: string, candleType: string, entry: number, sl: number, tp: number, lotSize: number, riskPips: number, rewardPips: number, rr: number, pnl: number, notes: string, confluenceScore: number, result: string): Promise<boolean>;
}
