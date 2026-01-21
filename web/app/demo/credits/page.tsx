"use client";

import { motion } from "framer-motion";
import {
    Coins,
    TrendingUp,
    Gift,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from "lucide-react";

const creditStats = {
    balance: 12450,
    tier: "Screech",
    nextTier: "Barn",
    progress: 62,
    earnedToday: 45,
    earnedThisWeek: 312,
    earnedAllTime: 12450,
};

const tiers = [
    { name: "Owlet", min: 0, color: "text-amber-400" },
    { name: "Screech", min: 5000, color: "text-slate-300" },
    { name: "Barn", min: 25000, color: "text-yellow-400" },
    { name: "Snowy", min: 100000, color: "text-cyan-400" },
    { name: "Great Horned", min: 500000, color: "text-purple-400" },
];

const recentActivity = [
    { type: "earn", source: "Trading Volume", amount: 125, time: "2 hours ago" },
    { type: "earn", source: "Deposit Bonus", amount: 50, time: "5 hours ago" },
    { type: "spend", source: "Fee Discount Pack", amount: -500, time: "1 day ago" },
    { type: "earn", source: "Daily Login", amount: 10, time: "1 day ago" },
    { type: "earn", source: "Referral Bonus", amount: 200, time: "2 days ago" },
    { type: "spend", source: "Leverage Unlock", amount: -1000, time: "3 days ago" },
];

const earningSources = [
    { source: "Trading", icon: TrendingUp, rate: "10 credits per $1K volume", earned: 8420 },
    { source: "Deposits", icon: Coins, rate: "0.1 credits per USDC/day", earned: 2340 },
    { source: "Referrals", icon: Users, rate: "10% of referee earnings", earned: 890 },
    { source: "Bootstrap", icon: Gift, rate: "Bonus multipliers", earned: 800 },
];

export default function CreditsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-primary">Credits</h1>
                <p className="text-secondary">Earn credits through trading, deposits, and engagement</p>
            </motion.div>

            {/* Main Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 via-surface to-orange-600/10 border border-accent/20"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-secondary mb-2">
                            <Coins className="w-5 h-5 text-accent" />
                            <span>Total Balance</span>
                        </div>
                        <div className="text-5xl font-bold text-primary mb-4">
                            {creditStats.balance.toLocaleString()}
                            <span className="text-xl text-secondary ml-2">credits</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`px-3 py-1.5 rounded-full ${creditStats.tier === 'Screech' ? 'bg-slate-500/10 border border-slate-500/20 text-slate-300' :
                                creditStats.tier === 'Barn' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                                    'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                } text-sm font-medium`}>
                                🦉 {creditStats.tier}
                            </div>
                            <div className="text-secondary text-sm">
                                {25000 - creditStats.balance} credits to {creditStats.nextTier}
                            </div>
                        </div>
                    </div>

                    {/* Tier Progress */}
                    <div className="lg:w-80">
                        <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-secondary">Progress to {creditStats.nextTier}</span>
                            <span className="text-primary font-medium">{creditStats.progress}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-background overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-accent to-amber-500"
                                style={{ width: `${creditStats.progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-secondary">
                            <span>Screech (5K)</span>
                            <span>Barn (25K)</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Earned Today</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        +{creditStats.earnedToday}
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">This Week</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        +{creditStats.earnedThisWeek}
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">All Time</div>
                    <div className="text-2xl font-bold text-primary">
                        {creditStats.earnedAllTime.toLocaleString()}
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Earning Sources */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-surface border border-border"
                >
                    <h2 className="text-lg font-semibold text-primary mb-4">Earning Sources</h2>
                    <div className="space-y-4">
                        {earningSources.map((source, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-background">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <source.icon className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-primary">{source.source}</div>
                                        <div className="text-xs text-secondary">{source.rate}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-primary">{source.earned.toLocaleString()}</div>
                                    <div className="text-xs text-secondary">earned</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl bg-surface border border-border"
                >
                    <h2 className="text-lg font-semibold text-primary mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-background">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'earn'
                                        ? 'bg-emerald-500/10'
                                        : 'bg-red-500/10'
                                        }`}>
                                        {activity.type === 'earn'
                                            ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                            : <ArrowDownRight className="w-4 h-4 text-red-400" />
                                        }
                                    </div>
                                    <div>
                                        <div className="font-medium text-primary text-sm">{activity.source}</div>
                                        <div className="flex items-center gap-1 text-xs text-secondary">
                                            <Clock className="w-3 h-3" />
                                            {activity.time}
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-semibold ${activity.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {activity.amount >= 0 ? '+' : ''}{activity.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
