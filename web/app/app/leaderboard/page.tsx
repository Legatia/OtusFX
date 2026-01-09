"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Users,
    TrendingUp,
    TrendingDown,
    Copy,
    Check,
    Star,
    Filter,
    Search
} from "lucide-react";

const traders = [
    {
        id: 1,
        name: "CryptoWhale",
        avatar: "🐋",
        followers: 1234,
        winRate: 72,
        pnl: 34500,
        pnlPercent: 156,
        trades: 892,
        following: false,
        verified: true,
    },
    {
        id: 2,
        name: "FXMaster",
        avatar: "🎯",
        followers: 892,
        winRate: 68,
        pnl: 28200,
        pnlPercent: 112,
        trades: 654,
        following: true,
        verified: true,
    },
    {
        id: 3,
        name: "PLNKing",
        avatar: "👑",
        followers: 567,
        winRate: 65,
        pnl: 18900,
        pnlPercent: 89,
        trades: 423,
        following: false,
        verified: false,
    },
    {
        id: 4,
        name: "SafeTrader",
        avatar: "🛡️",
        followers: 445,
        winRate: 78,
        pnl: 12400,
        pnlPercent: 45,
        trades: 1203,
        following: false,
        verified: true,
    },
    {
        id: 5,
        name: "HighRoller",
        avatar: "🎰",
        followers: 334,
        winRate: 52,
        pnl: 45600,
        pnlPercent: 234,
        trades: 234,
        following: false,
        verified: false,
    },
    {
        id: 6,
        name: "SteadyGains",
        avatar: "📈",
        followers: 289,
        winRate: 71,
        pnl: 8900,
        pnlPercent: 34,
        trades: 567,
        following: true,
        verified: true,
    },
];

const timeFilters = ["24h", "7d", "30d", "All Time"];

export default function LeaderboardPage() {
    const [selectedTime, setSelectedTime] = useState("30d");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTraders = traders.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                <p className="text-secondary">Discover and copy top traders</p>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Total Traders</div>
                    <div className="text-xl font-bold text-white">3,421</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Active Copiers</div>
                    <div className="text-xl font-bold text-white">1,892</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Copy Volume (30d)</div>
                    <div className="text-xl font-bold text-white">$2.4M</div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Avg Copier ROI</div>
                    <div className="text-xl font-bold text-emerald-400">+18.4%</div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search traders..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border focus:border-accent focus:outline-none text-white placeholder:text-secondary/50"
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

            {/* Traders Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                {filteredTraders.map((trader, index) => (
                    <motion.div
                        key={trader.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 rounded-2xl bg-surface border border-border hover:border-accent/50 transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl">
                                    {trader.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">{trader.name}</span>
                                        {trader.verified && (
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-secondary text-sm">
                                        <Users className="w-3 h-3" />
                                        <span>{trader.followers} followers</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-secondary text-sm">#{index + 1}</span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-background text-center">
                                <div className="text-white font-semibold">{trader.winRate}%</div>
                                <div className="text-secondary text-xs">Win Rate</div>
                            </div>
                            <div className="p-3 rounded-lg bg-background text-center">
                                <div className={`font-semibold ${trader.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    +{trader.pnlPercent}%
                                </div>
                                <div className="text-secondary text-xs">ROI</div>
                            </div>
                            <div className="p-3 rounded-lg bg-background text-center">
                                <div className="text-white font-semibold">{trader.trades}</div>
                                <div className="text-secondary text-xs">Trades</div>
                            </div>
                        </div>

                        {/* PnL */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-secondary text-sm">Total P&L</span>
                            <span className={`font-bold ${trader.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                +${trader.pnl.toLocaleString()}
                            </span>
                        </div>

                        {/* Copy Button */}
                        <button
                            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${trader.following
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-accent hover:bg-accent-hover text-white'
                                }`}
                        >
                            {trader.following ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Following
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Trader
                                </>
                            )}
                        </button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
