"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Triangle,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Zap,
    Info,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useArbitrageMonitor, formatPrice, PAIR_INFO, type ArbitrageOpportunity } from "@/lib/pyth";

function ArbitrageCard({ opportunity, index }: { opportunity: ArbitrageOpportunity; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const isProfitable = opportunity.profitPct > 0;
    const profitColor = isProfitable ? "text-emerald-400" : "text-red-400";
    const bgColor = isProfitable ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-2xl border ${bgColor} overflow-hidden`}
        >
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isProfitable ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <Triangle className={`w-5 h-5 ${profitColor}`} />
                        </div>
                        <div>
                            <div className="font-semibold text-white">{opportunity.triangle.name}</div>
                            <div className="text-sm text-secondary">
                                {opportunity.path.join(' → ')}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className={`text-lg font-bold ${profitColor}`}>
                                {opportunity.profitPct >= 0 ? '+' : ''}{opportunity.profitPct.toFixed(4)}%
                            </div>
                            <div className="text-xs text-secondary">
                                {opportunity.profitPct > 0.01 ? 'Opportunity' : 'No Arb'}
                            </div>
                        </div>
                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-secondary" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-secondary" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-white/5">
                    <div className="pt-4 space-y-4">
                        {/* Prices */}
                        <div className="grid grid-cols-3 gap-3">
                            {opportunity.triangle.pairs.map((pair) => {
                                const price = opportunity.prices[pair];
                                const pairInfo = PAIR_INFO[pair];
                                return (
                                    <div key={pair} className="p-3 rounded-xl bg-background">
                                        <div className="text-xs text-secondary mb-1">{pair}</div>
                                        <div className="font-mono font-medium text-white">
                                            {formatPrice(price, pairInfo?.decimals || 4)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Calculation */}
                        <div className="p-3 rounded-xl bg-background">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Expected Rate</span>
                                <span className="text-white font-mono">1.000000</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                                <span className="text-secondary">Actual Rate</span>
                                <span className={`font-mono font-medium ${profitColor}`}>
                                    {opportunity.actualRate.toFixed(6)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                                <span className="text-secondary">Deviation</span>
                                <span className={`font-mono font-medium ${profitColor}`}>
                                    {((opportunity.actualRate - 1) * 10000).toFixed(2)} bps
                                </span>
                            </div>
                        </div>

                        {/* Execute Button */}
                        <button
                            disabled={!opportunity.profitable}
                            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${opportunity.profitable
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    : 'bg-surface text-secondary cursor-not-allowed'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            {opportunity.profitable ? 'Execute Arbitrage' : 'No Profitable Opportunity'}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function ArbitragePage() {
    const { opportunities, prices, loading, error } = useArbitrageMonitor();
    const [autoRefresh, setAutoRefresh] = useState(true);

    const profitableCount = opportunities.filter(o => o.profitable).length;
    const totalDeviation = opportunities.reduce((sum, o) => sum + Math.abs(o.profitPct), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white">Triangular Arbitrage</h1>
                    <p className="text-secondary mt-1">
                        Monitor cross-rate inefficiencies across FX pairs
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${autoRefresh
                                ? 'bg-accent/10 border-accent/20 text-accent'
                                : 'bg-surface border-border text-secondary'
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Live' : 'Paused'}
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                <div className="p-4 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm">Triangles</div>
                    <div className="text-2xl font-bold text-white mt-1">{opportunities.length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm">Opportunities</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{profitableCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm">Avg Deviation</div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {opportunities.length > 0 ? (totalDeviation / opportunities.length).toFixed(3) : '0'}%
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm">Pairs Tracked</div>
                    <div className="text-2xl font-bold text-white mt-1">{Object.keys(prices).length}</div>
                </div>
            </motion.div>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3"
            >
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <span className="text-blue-400 font-medium">How it works:</span>{" "}
                    <span className="text-secondary">
                        Triangular arbitrage exploits price discrepancies between three currency pairs.
                        If EUR/USD × USD/JPY ÷ EUR/JPY ≠ 1, there&apos;s an opportunity.
                        Pyth prices update every ~400ms.
                    </span>
                </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                    <p className="text-secondary">Loading price feeds...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                    Error: {error}
                </div>
            )}

            {/* Arbitrage Opportunities */}
            {!loading && !error && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Triangle className="w-5 h-5 text-accent" />
                        Active Triangles
                    </h2>
                    {opportunities.length === 0 ? (
                        <div className="text-center py-12 text-secondary">
                            No arbitrage opportunities found
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {opportunities.map((opp, index) => (
                                <ArbitrageCard key={opp.triangle.name} opportunity={opp} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Market Rates Table */}
            {!loading && Object.keys(prices).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-surface border border-border overflow-hidden"
                >
                    <div className="p-4 border-b border-white/5">
                        <h2 className="font-semibold text-white">Live Market Rates</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {Object.entries(prices).map(([pair, data]) => {
                            const pairInfo = PAIR_INFO[pair];
                            return (
                                <div key={pair} className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-white">{pair}</span>
                                        {data.isLive && !data.isMarketClosed && (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                                                Live
                                            </span>
                                        )}
                                        {data.isMarketClosed && (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-mono text-white">
                                        {formatPrice(data.price, pairInfo?.decimals || 4)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
