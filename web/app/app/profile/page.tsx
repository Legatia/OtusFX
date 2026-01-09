"use client";

import { motion } from "framer-motion";
import {
    User,
    Award,
    TrendingUp,
    Calendar,
    Copy,
    Settings,
    ExternalLink,
    Share2
} from "lucide-react";

const badges = [
    { name: "Founding Trader", emoji: "🏆", description: "Bootstrap participant", earned: true },
    { name: "First Trade", emoji: "🎯", description: "Completed first trade", earned: true },
    { name: "1K Volume", emoji: "📈", description: "Traded $1K+ volume", earned: true },
    { name: "10K Volume", emoji: "💰", description: "Traded $10K+ volume", earned: true },
    { name: "100K Volume", emoji: "🚀", description: "Traded $100K+ volume", earned: false },
    { name: "Win Streak 5", emoji: "🔥", description: "5 winning trades in a row", earned: true },
    { name: "Win Streak 10", emoji: "⚡", description: "10 winning trades in a row", earned: false },
    { name: "Copy Leader", emoji: "👥", description: "10+ copiers following you", earned: false },
];

const stats = {
    totalTrades: 156,
    winRate: 64,
    totalVolume: 234500,
    totalPnL: 12340,
    bestTrade: 2450,
    worstTrade: -890,
    avgHoldTime: "4.2 hours",
    joinDate: "Jan 2026",
};

export default function ProfilePage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-surface border border-border"
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white">Anonymous Trader</h1>
                            <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
                                🏆 Founding Trader
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-secondary text-sm">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {stats.joinDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>{stats.totalTrades} trades</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button className="p-3 rounded-xl bg-background hover:bg-surface-hover border border-white/10 text-secondary hover:text-white transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-xl bg-background hover:bg-surface-hover border border-white/10 text-secondary hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Total P&L</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        +${stats.totalPnL.toLocaleString()}
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Win Rate</div>
                    <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Total Volume</div>
                    <div className="text-2xl font-bold text-white">
                        ${(stats.totalVolume / 1000).toFixed(0)}K
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Avg Hold Time</div>
                    <div className="text-2xl font-bold text-white">{stats.avgHoldTime}</div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-surface border border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-accent" />
                            Badges
                        </h2>
                        <span className="text-secondary text-sm">
                            {badges.filter(b => b.earned).length}/{badges.length} earned
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {badges.map((badge, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border transition-all ${badge.earned
                                        ? 'bg-background border-accent/20'
                                        : 'bg-background/50 border-white/5 opacity-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{badge.emoji}</div>
                                    <div>
                                        <div className={`font-medium ${badge.earned ? 'text-white' : 'text-secondary'}`}>
                                            {badge.name}
                                        </div>
                                        <div className="text-xs text-secondary">{badge.description}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Trading Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-surface border border-border"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Trading Stats</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-background">
                            <span className="text-secondary">Best Trade</span>
                            <span className="font-semibold text-emerald-400">
                                +${stats.bestTrade.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-background">
                            <span className="text-secondary">Worst Trade</span>
                            <span className="font-semibold text-red-400">
                                ${stats.worstTrade.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-background">
                            <span className="text-secondary">Total Trades</span>
                            <span className="font-semibold text-white">{stats.totalTrades}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-background">
                            <span className="text-secondary">Avg Hold Time</span>
                            <span className="font-semibold text-white">{stats.avgHoldTime}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Referral Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 via-surface to-orange-600/10 border border-accent/20"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Invite Friends & Earn</h3>
                        <p className="text-secondary text-sm">
                            Earn 10% of your referrals' trading credits forever
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-lg bg-background border border-white/10 font-mono text-white">
                            DPLN-ABC123
                        </div>
                        <button className="p-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors">
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
