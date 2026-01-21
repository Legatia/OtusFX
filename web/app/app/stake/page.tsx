"use client";

import { motion } from "framer-motion";
import {
    Lock,
    Unlock,
    TrendingUp,
    Gift,
    Calendar,
    Clock,
    Award,
    DollarSign
} from "lucide-react";
import { useState } from "react";

const mockOTUSBalance = 45230;
const mockStaked = 25000;
const mockUnstaked = mockOTUSBalance - mockStaked;

const stakingAPR = 22.5;
const weeklyReward = 86.25; // ~$86 in USD1

const lockPeriods = [
    { days: 0, multiplier: 1, apr: stakingAPR },
    { days: 30, multiplier: 1.25, apr: stakingAPR * 1.25 },
    { days: 90, multiplier: 1.5, apr: stakingAPR * 1.5 },
    { days: 180, multiplier: 2, apr: stakingAPR * 2 },
];

const stakingHistory = [
    { type: "stake", amount: 10000, date: "2 days ago", lockDays: 90 },
    { type: "reward", amount: 86.25, date: "1 week ago", token: "USD1" },
    { type: "stake", amount: 15000, date: "2 weeks ago", lockDays: 0 },
    { type: "reward", amount: 78.80, date: "2 weeks ago", token: "USD1" },
];

export default function StakePage() {
    const [stakeAmount, setStakeAmount] = useState("");
    const [selectedLockPeriod, setSelectedLockPeriod] = useState(0);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-primary">Stake OTUS</h1>
                <p className="text-secondary">Earn protocol revenue in USD1</p>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-amber-500/10 border border-accent/20">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Lock className="w-4 h-4 text-accent" />
                        Total Staked
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">
                        {mockStaked.toLocaleString()} OTUS
                    </div>
                    <div className="text-xs text-secondary">
                        ≈ ${(mockStaked * 0.12).toLocaleString()}
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Current APR
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 mb-1">
                        {stakingAPR}%
                    </div>
                    <div className="text-xs text-secondary">Base rate (no lock)</div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <DollarSign className="w-4 h-4 text-cyan-400" />
                        Weekly Rewards
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">
                        ${weeklyReward.toFixed(2)}
                    </div>
                    <div className="text-xs text-secondary">In USD1</div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Unlock className="w-4 h-4 text-amber-400" />
                        Available
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">
                        {mockUnstaked.toLocaleString()} OTUS
                    </div>
                    <div className="text-xs text-secondary">Can stake now</div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Stake Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border"
                >
                    <h2 className="text-lg font-semibold text-primary mb-4">Stake OTUS</h2>

                    {/* Amount Input */}
                    <div className="p-4 rounded-xl bg-background border border-border mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-secondary">Amount to Stake</span>
                            <button className="text-xs text-accent hover:text-accent/80">
                                Max: {mockUnstaked.toLocaleString()}
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                className="flex-1 bg-transparent text-2xl font-bold text-primary outline-none"
                                placeholder="0"
                            />
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Award className="w-5 h-5 text-accent" />
                                OTUS
                            </div>
                        </div>
                    </div>

                    {/* Lock Period Selection */}
                    <div className="mb-6">
                        <label className="text-sm text-secondary mb-3 block">Lock Period</label>
                        <div className="grid grid-cols-2 gap-3">
                            {lockPeriods.map((period, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedLockPeriod(index)}
                                    className={`p-4 rounded-xl border transition-all ${selectedLockPeriod === index
                                        ? 'bg-accent/10 border-accent'
                                        : 'bg-background border-border hover:border-accent/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-primary">
                                            {period.days === 0 ? 'No Lock' : `${period.days} Days`}
                                        </span>
                                        {period.multiplier > 1 && (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs text-emerald-400 font-medium">
                                                {period.multiplier}x
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-lg font-bold text-accent">
                                        {period.apr.toFixed(1)}% APR
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Projected Rewards */}
                    {stakeAmount && parseFloat(stakeAmount) > 0 && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 mb-6">
                            <div className="text-sm text-secondary mb-2">Projected Weekly Rewards</div>
                            <div className="text-2xl font-bold text-primary">
                                ${((parseFloat(stakeAmount) * 0.12 * lockPeriods[selectedLockPeriod].apr / 100) / 52).toFixed(2)} USD1
                            </div>
                            <div className="text-xs text-secondary mt-1">
                                ≈ {((parseFloat(stakeAmount) * 0.12 * lockPeriods[selectedLockPeriod].apr / 100) / 52 / 0.12).toFixed(0)} OTUS (at current price)
                            </div>
                        </div>
                    )}

                    {/* Stake Button */}
                    <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-accent to-amber-500 hover:from-accent/80 hover:to-amber-500/80 transition-all font-semibold text-background">
                        {selectedLockPeriod === 0 ? 'Stake OTUS' : `Stake with ${lockPeriods[selectedLockPeriod].days}-Day Lock`}
                    </button>

                    {selectedLockPeriod > 0 && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                            <Clock className="w-4 h-4 text-amber-400 mt-0.5" />
                            <p className="text-xs text-amber-400">
                                Early withdrawal incurs a 10% penalty. You can unstake penalty-free after {lockPeriods[selectedLockPeriod].days} days.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Staking History & Benefits */}
                <div className="space-y-6">
                    {/* Active Stakes */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-surface border border-border"
                    >
                        <h2 className="text-lg font-semibold text-primary mb-4">Active Stakes</h2>
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-background">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-primary">10,000 OTUS</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                                        90-day lock
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-secondary">
                                    <Calendar className="w-3 h-3" />
                                    Unlocks in 88 days
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-background">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-primary">15,000 OTUS</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                                        No lock
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-secondary">
                                    <Unlock className="w-3 h-3" />
                                    Can unstake anytime
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-amber-500/10 border border-accent/20"
                    >
                        <h3 className="font-semibold text-primary mb-3">Staking Benefits</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <Gift className="w-4 h-4 text-accent mt-0.5" />
                                <span className="text-secondary">Earn 15-45% APR in USD1</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-accent mt-0.5" />
                                <span className="text-secondary">1.5x credit multiplier</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Award className="w-4 h-4 text-accent mt-0.5" />
                                <span className="text-secondary">Priority support access</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-surface border border-border"
            >
                <h2 className="text-lg font-semibold text-primary mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {stakingHistory.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-background">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'stake'
                                    ? 'bg-accent/10'
                                    : 'bg-emerald-500/10'
                                    }`}>
                                    {activity.type === 'stake'
                                        ? <Lock className="w-5 h-5 text-accent" />
                                        : <Gift className="w-5 h-5 text-emerald-400" />
                                    }
                                </div>
                                <div>
                                    <div className="font-medium text-primary">
                                        {activity.type === 'stake' ? 'Staked' : 'Reward Claimed'}
                                    </div>
                                    <div className="text-xs text-secondary">{activity.date}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-primary">
                                    {activity.type === 'stake'
                                        ? `${activity.amount.toLocaleString()} OTUS`
                                        : `$${activity.amount.toFixed(2)} ${activity.token}`
                                    }
                                </div>
                                {activity.type === 'stake' && activity.lockDays && activity.lockDays > 0 && (
                                    <div className="text-xs text-secondary">{activity.lockDays}-day lock</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
