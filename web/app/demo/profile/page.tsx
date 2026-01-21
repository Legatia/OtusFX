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
    Share2,
    DollarSign
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
                        <User className="w-12 h-12 text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-primary">Anonymous Trader</h1>
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
                        <button className="p-3 rounded-xl bg-background hover:bg-surface-hover border border-border text-secondary hover:text-primary transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-xl bg-background hover:bg-surface-hover border border-border text-secondary hover:text-primary transition-colors">
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
                    <div className="text-2xl font-bold text-primary">{stats.winRate}%</div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Total Volume</div>
                    <div className="text-2xl font-bold text-primary">
                        ${(stats.totalVolume / 1000).toFixed(0)}K
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Avg Hold Time</div>
                    <div className="text-2xl font-bold text-primary">{stats.avgHoldTime}</div>
                </div>
            </motion.div>

            {/* Portfolio Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-6 rounded-2xl bg-surface border border-border"
            >
                <h2 className="text-lg font-semibold text-primary mb-6">Portfolio Analysis</h2>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Asset Breakdown */}
                    <div>
                        <h3 className="text-sm text-secondary mb-4">Asset Breakdown</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-background">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                            <span className="text-lg">🦉</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-primary">OTUS</div>
                                            <div className="text-xs text-secondary">45,230 tokens</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-primary">$5,428</div>
                                        <div className="text-xs text-emerald-400">+12.5%</div>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-background mt-3">
                                    <div className="h-full rounded-full bg-accent" style={{ width: '65%' }} />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-background">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-primary">USDC</div>
                                            <div className="text-xs text-secondary">1,250 tokens</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-primary">$1,250</div>
                                        <div className="text-xs text-secondary">-</div>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-background mt-3">
                                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '15%' }} />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-background">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-primary">USD1</div>
                                            <div className="text-xs text-secondary">850 tokens</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-primary">$850</div>
                                        <div className="text-xs text-emerald-400">+0.8%</div>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-background mt-3">
                                    <div className="h-full rounded-full bg-cyan-500" style={{ width: '10%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OTUS Holdings Details */}
                    <div>
                        <h3 className="text-sm text-secondary mb-4">OTUS Holdings</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-amber-500/10 border border-accent/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-secondary">Total OTUS</span>
                                    <span className="text-lg font-bold text-primary">45,230</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-secondary">Staked</span>
                                    <span className="text-primary font-medium">25,000 (55%)</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-secondary">Unstaked</span>
                                    <span className="text-primary font-medium">20,230 (45%)</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-background">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-secondary">Current Value</span>
                                    <span className="text-xl font-bold text-primary">$5,428</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-secondary">Entry Avg</span>
                                    <span className="text-primary">$0.105</span>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                    <span className="text-secondary">P&L</span>
                                    <span className="text-emerald-400">+$677 (+14.3%)</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-background">
                                <div className="text-sm text-secondary mb-2">Benefits Unlocked</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-primary">20x leverage access</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-primary">20% OTUS cashback</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-primary">3x credit multiplier</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-primary">22.5% APR staking</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Portfolio Value */}
                <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-secondary mb-1">Total Portfolio Value</div>
                            <div className="text-3xl font-bold text-primary">$7,528</div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-semibold">+$724</span>
                            </div>
                            <div className="text-sm text-secondary">+10.6% all time</div>
                        </div>
                    </div>
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
                        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
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
                                        <div className={`font-medium ${badge.earned ? 'text-primary' : 'text-secondary'}`}>
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
                    <h2 className="text-lg font-semibold text-primary mb-4">Trading Stats</h2>

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
                            <span className="font-semibold text-primary">{stats.totalTrades}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-background">
                            <span className="text-secondary">Avg Hold Time</span>
                            <span className="font-semibold text-primary">{stats.avgHoldTime}</span>
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
                        <h3 className="text-lg font-semibold text-primary mb-1">Invite Friends & Earn</h3>
                        <p className="text-secondary text-sm">
                            Earn 10% of your referrals' trading credits forever
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-lg bg-background border border-border font-mono text-primary">
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
