"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Users,
    TrendingUp,
    Check,
    Search,
    Lock,
    EyeOff,
    Shield,
    Vault
} from "lucide-react";

// Production: Trader rankings require off-chain performance indexer
// This will be populated from an API that aggregates on-chain position data
// For now, show empty state to indicate no mock data
type Trader = {
    id: number;
    traderId: string;
    copiers: number;
    winRate: number | null;
    returns30d: number | null;
    sharpe: number | null;
    maxDrawdown: number | null;
    vaultAUM: number;
    isPrivate: boolean;
    hasVault: boolean;
};

const traders: Trader[] = [];

const timeFilters = ["7d", "30d", "90d", "All"];
const sortOptions = ["Returns", "Sharpe", "Win Rate", "AUM"];

import { useVaults } from "@/hooks/useVaults";

export default function LeaderboardPage() {
    const [selectedTime, setSelectedTime] = useState("30d");
    const [selectedSort, setSelectedSort] = useState("Returns");
    const [searchQuery, setSearchQuery] = useState("");

    const { vaults, loading: vaultsLoading } = useVaults();

    // Calculate real stats from vaults
    const totalVaultTVL = vaults.reduce((sum, v) => sum + v.totalAssets, 0);
    const activeVaultsCount = vaults.length;

    const filteredTraders = traders.filter(t =>
        t.traderId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-primary">Private Leaderboard</h1>
                    <p className="text-secondary">Verified performance, hidden strategies</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">On-chain verified, positions hidden</span>
                </div>
            </motion.div>

            {/* Privacy Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary mb-1">Privacy-First Rankings</h3>
                        <p className="text-secondary text-sm">
                            Performance is verified on-chain via cryptographic proofs. Trader identities are masked,
                            positions are encrypted, and strategies remain confidential. You see returns - never trades.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Verified Traders
                    </div>
                    <div className="text-xl font-bold text-primary">{traders.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Vault className="w-4 h-4" />
                        Active Vaults
                    </div>
                    <div className="text-xl font-bold text-primary">
                        {vaultsLoading ? "..." : activeVaultsCount}
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Lock className="w-4 h-4" />
                        Vault TVL
                    </div>
                    <div className="text-xl font-bold text-primary">
                        {vaultsLoading ? "..." : `$${(totalVaultTVL / 1000).toFixed(0)}K`}
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Avg Return (30d)</div>
                    <div className="text-xl font-bold text-secondary">--</div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Trader ID..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border focus:border-accent focus:outline-none text-primary placeholder:text-secondary/50"
                    />
                </div>

                {/* Time Filter */}
                <div className="flex gap-2">
                    {timeFilters.map((time) => (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                                ? 'bg-accent text-white'
                                : 'bg-surface text-secondary hover:text-white'
                                }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Traders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-surface border border-border overflow-hidden"
            >
                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 p-4 border-b border-white/5 text-sm font-medium text-secondary">
                    <div>Rank</div>
                    <div>Trader</div>
                    <div className="text-center">Return</div>
                    <div className="text-center">Sharpe</div>
                    <div className="text-center">Win Rate</div>
                    <div className="text-center">Drawdown</div>
                    <div className="text-right">Vault</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/5">
                    {filteredTraders.length === 0 ? (
                        <div className="text-center py-12">
                            <Lock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                            <p className="text-secondary text-sm">No verified traders yet.</p>
                            <p className="text-secondary text-xs mt-2">
                                Trader rankings will appear once the performance indexer is live.
                            </p>
                        </div>
                    ) : (
                        filteredTraders.map((trader, index) => (
                            <motion.div
                                key={trader.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className="grid grid-cols-7 gap-4 p-4 items-center hover:bg-background/50 transition-colors cursor-pointer"
                            >
                                {/* Rank */}
                                <div className={`text-lg font-bold ${index < 3 ? 'text-accent' : 'text-secondary'
                                    }`}>
                                    #{index + 1}
                                </div>

                                {/* Trader */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-primary">{trader.traderId}</div>
                                        <div className="text-xs text-secondary flex items-center gap-1">
                                            <EyeOff className="w-3 h-3" />
                                            {trader.copiers} copiers
                                        </div>
                                    </div>
                                </div>

                                {/* Return */}
                                <div className={`text-center font-semibold ${(trader.returns30d ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {trader.returns30d !== null ? `${trader.returns30d >= 0 ? '+' : ''}${trader.returns30d}%` : '--'}
                                </div>

                                {/* Sharpe */}
                                <div className="text-center text-primary font-medium">
                                    {trader.sharpe !== null ? trader.sharpe.toFixed(1) : '--'}
                                </div>

                                {/* Win Rate */}
                                <div className="text-center text-primary font-medium">
                                    {trader.winRate !== null ? `${trader.winRate}%` : '--'}
                                </div>

                                {/* Drawdown */}
                                <div className="text-center text-red-400 font-medium">
                                    {trader.maxDrawdown !== null ? `${trader.maxDrawdown}%` : '--'}
                                </div>

                                {/* Vault */}
                                <div className="text-right">
                                    {trader.hasVault ? (
                                        <button className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1 ml-auto">
                                            <Vault className="w-3 h-3" />
                                            ${(trader.vaultAUM / 1000).toFixed(0)}K
                                        </button>
                                    ) : (
                                        <span className="text-secondary text-sm">No vault</span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* What's Hidden Note */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-background border border-white/5"
            >
                <div className="flex items-center gap-4 text-sm text-secondary">
                    <EyeOff className="w-5 h-5 shrink-0" />
                    <span>
                        <strong className="text-primary">What's hidden:</strong> Wallet addresses, position details,
                        entry/exit prices, trade history, leverage used, and exact PnL amounts.
                        Only verified aggregate metrics are shown.
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
