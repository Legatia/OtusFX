"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    RefreshCw,
    Lock,
    Eye,
    EyeOff,
    Zap,
    TrendingUp,
    Shield,
    Play,
    Check,
    Clock
} from "lucide-react";

// Mock arb opportunities
const opportunities = [
    {
        id: 1,
        legs: ["EUR/USD", "USD/JPY", "EUR/JPY"],
        estimatedProfit: 0.12,
        confidence: "High",
        status: "available",
        expiresIn: 45,
    },
    {
        id: 2,
        legs: ["GBP/USD", "USD/CHF", "GBP/CHF"],
        estimatedProfit: 0.08,
        confidence: "Medium",
        status: "available",
        expiresIn: 23,
    },
    {
        id: 3,
        legs: ["AUD/USD", "USD/JPY", "AUD/JPY"],
        estimatedProfit: 0.05,
        confidence: "Low",
        status: "available",
        expiresIn: 12,
    },
];

const executedArbs = [
    { id: 101, legs: ["EUR/USD", "USD/JPY", "EUR/JPY"], profit: 0.11, time: "2 min ago", size: 5000 },
    { id: 102, legs: ["GBP/USD", "USD/CHF", "GBP/CHF"], profit: 0.09, time: "15 min ago", size: 3000 },
    { id: 103, legs: ["EUR/USD", "USD/CHF", "EUR/CHF"], profit: 0.14, time: "1 hour ago", size: 10000 },
];

const stats = {
    totalProfit: 234.50,
    totalTrades: 47,
    winRate: 94,
    avgProfit: 0.09,
};

import { useComingSoon } from "@/components/ComingSoonModal";

export default function ArbPage() {
    const [selectedOpp, setSelectedOpp] = useState<typeof opportunities[0] | null>(null);
    const [arbSize, setArbSize] = useState("1000");
    const [showHidden, setShowHidden] = useState(false);
    const { showComingSoon } = useComingSoon();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-primary">Private Triangular Arb</h1>
                    <p className="text-secondary">Encrypted arbitrage execution via Inco Lightning</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Lock className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">Inco Protected</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">Strategy Private</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Total Profit</div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-emerald-400">
                            ${stats.totalProfit.toFixed(2)}
                        </span>
                        <Lock className="w-4 h-4 text-purple-400" />
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Total Arbs</div>
                    <div className="text-2xl font-bold text-primary">{stats.totalTrades}</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Win Rate</div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.winRate}%</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Avg Profit</div>
                    <div className="text-2xl font-bold text-primary">{stats.avgProfit}%</div>
                </div>
            </motion.div>

            {/* Privacy Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary mb-1">Strategy Privacy</h3>
                        <p className="text-secondary text-sm">
                            Your arbitrage strategies run in encrypted compute via Inco Lightning.
                            Nobody can analyze your patterns, copy your signals, or see what opportunities you're exploiting.
                            Oracle-based pricing (Pyth) means no slippage—pure alpha protection.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Available Opportunities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-surface border border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-primary">Opportunities</h2>
                        <button
                            onClick={() => setShowHidden(!showHidden)}
                            className="flex items-center gap-2 text-secondary text-sm hover:text-primary transition-colors"
                        >
                            {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {showHidden ? "Hide Details" : "Show Details"}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {opportunities.map((opp) => (
                            <div
                                key={opp.id}
                                className="p-4 rounded-xl bg-background border border-white/5 hover:border-accent/30 transition-all cursor-pointer"
                                onClick={() => setSelectedOpp(opp)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-accent" />
                                        <span className="font-medium text-primary">
                                            {showHidden ? opp.legs.join(" → ") : "🔒 [ENCRYPTED]"}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opp.confidence === "High"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : opp.confidence === "Medium"
                                            ? "bg-yellow-500/10 text-yellow-400"
                                            : "bg-red-500/10 text-red-400"
                                        }`}>
                                        {opp.confidence}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-emerald-400 font-medium">
                                            {showHidden ? `+${opp.estimatedProfit}%` : "🔒"}
                                        </span>
                                        <span className="text-secondary flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {opp.expiresIn}s
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showComingSoon("Private Arb");
                                        }}
                                        className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all flex items-center gap-1"
                                    >
                                        <Play className="w-3 h-3" />
                                        Execute
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {opportunities.length === 0 && (
                        <div className="text-center py-8 text-secondary">
                            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <p>Scanning for opportunities...</p>
                        </div>
                    )}
                </motion.div>

                {/* Recent Executions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-surface border border-border"
                >
                    <h2 className="text-lg font-semibold text-primary mb-4">Recent Executions</h2>

                    <div className="space-y-3">
                        {executedArbs.map((arb) => (
                            <div
                                key={arb.id}
                                className="p-4 rounded-xl bg-background border border-white/5"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        <span className="font-medium text-primary">
                                            {showHidden ? arb.legs.join(" → ") : "🔒 [PRIVATE]"}
                                        </span>
                                    </div>
                                    <span className="text-secondary text-sm">{arb.time}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-secondary">
                                        Size: {showHidden ? `$${arb.size.toLocaleString()}` : "🔒"}
                                    </span>
                                    <span className="text-emerald-400 font-medium">
                                        +{showHidden ? `${arb.profit}%` : "🔒"} profit
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* How It Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-surface border border-border"
            >
                <h2 className="text-lg font-semibold text-primary mb-4">How Private Arb Works</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl font-bold text-blue-400">1</span>
                        </div>
                        <h3 className="font-medium text-primary mb-1">Detect</h3>
                        <p className="text-secondary text-sm">
                            Inco scans for price discrepancies across pairs without revealing opportunities
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl font-bold text-purple-400">2</span>
                        </div>
                        <h3 className="font-medium text-primary mb-1">Execute</h3>
                        <p className="text-secondary text-sm">
                            All three legs execute atomically in encrypted compute - no one sees your trade
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl font-bold text-emerald-400">3</span>
                        </div>
                        <h3 className="font-medium text-primary mb-1">Profit</h3>
                        <p className="text-secondary text-sm">
                            Your strategy alpha stays private—no one can analyze your arb patterns or copy your edge
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
