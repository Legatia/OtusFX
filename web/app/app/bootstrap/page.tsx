"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Gift,
    Clock,
    Users,
    Coins,
    TrendingUp,
    Shield,
    Sparkles,
    Award,
    Percent
} from "lucide-react";

const bootstrapStats = {
    totalDeposits: 2_450_000,
    participants: 523,
    daysRemaining: 12,
    estimatedAPY: 5.2,
    yourDeposit: 0,
    yourCredits: 0,
    yourRank: null as number | null,
};

const leaderboard = [
    { rank: 1, address: "0x1a2b...3c4d", amount: 150000, credits: 31500, tier: "Diamond" },
    { rank: 2, address: "0x5e6f...7g8h", amount: 100000, credits: 21000, tier: "Diamond" },
    { rank: 3, address: "0x9i0j...1k2l", amount: 75000, credits: 15750, tier: "Gold" },
    { rank: 4, address: "0x3m4n...5o6p", amount: 50000, credits: 10500, tier: "Gold" },
    { rank: 5, address: "0x7q8r...9s0t", amount: 25000, credits: 5250, tier: "Silver" },
];

const tiers = [
    { name: "Diamond", icon: "💎", minRank: 1, maxRank: 10, perk: "VIP Access", discount: "50%" },
    { name: "Gold", icon: "🥇", minRank: 11, maxRank: 100, perk: "Priority", discount: "35%" },
    { name: "Silver", icon: "🥈", minRank: 101, maxRank: 500, perk: "Early Access", discount: "25%" },
    { name: "Founding", icon: "🏦", minRank: 501, maxRank: null, perk: "OG Status", discount: "10%" },
];

export default function BootstrapPage() {
    const [depositAmount, setDepositAmount] = useState("");
    const walletBalance = 25000;

    const handleDeposit = () => {
        alert(`Demo: Depositing ${depositAmount} USDC to Lending Pool`);
    };

    const estimatedCredits = (parseFloat(depositAmount) || 0) * 21 * 0.1 * 2; // days * rate * early bird

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Bootstrap: Seed the Lending Pool</h1>
                        <p className="text-secondary">Deposit USDC, earn credits, become a Founding Lender</p>
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
                        <Coins className="w-4 h-4" />
                        Total Deposits
                    </div>
                    <div className="text-xl font-bold text-white">
                        ${(bootstrapStats.totalDeposits / 1_000_000).toFixed(2)}M
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Lenders
                    </div>
                    <div className="text-xl font-bold text-white">
                        {bootstrapStats.participants.toLocaleString()}
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Time Remaining
                    </div>
                    <div className="text-xl font-bold text-accent">
                        {bootstrapStats.daysRemaining} days
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Percent className="w-4 h-4" />
                        Est. Launch APY
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                        {bootstrapStats.estimatedAPY}%
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Deposit Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="p-6 rounded-2xl bg-surface border border-border">
                        <h2 className="text-lg font-semibold text-white mb-6">Deposit to Lending Pool</h2>

                        {/* Amount Input */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-secondary text-sm">Amount</label>
                                <span className="text-secondary text-sm">
                                    Balance: ${walletBalance.toLocaleString()}
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-background border border-white/5">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder:text-secondary/50"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setDepositAmount(walletBalance.toString())}
                                            className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
                                        >
                                            MAX
                                        </button>
                                        <span className="text-white font-medium">USDC</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-secondary text-xs mt-2">
                                Minimum deposit: 100 USDC
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 rounded-xl bg-background border border-white/5 space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Estimated Credits (2x early bird)</span>
                                <span className="text-accent font-medium">
                                    {estimatedCredits.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Est. Yield (during bootstrap)</span>
                                <span className="text-white font-medium">
                                    ${((parseFloat(depositAmount) || 0) * 0.05 * (21 / 365)).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">NFT Badge</span>
                                <span className="text-accent font-medium">Founding Lender</span>
                            </div>
                        </div>

                        {/* Deposit Button */}
                        <button
                            onClick={handleDeposit}
                            disabled={!depositAmount || parseFloat(depositAmount) < 100}
                            className="w-full py-4 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed text-white font-semibold transition-all"
                        >
                            Deposit USDC
                        </button>

                        {/* Info */}
                        <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div className="text-sm">
                                    <p className="text-white font-medium mb-1">Earn 2x Credits This Week!</p>
                                    <p className="text-secondary">
                                        Early depositors get double credits. Deposit now to maximize rewards.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="p-6 rounded-2xl bg-surface border border-border">
                        <h3 className="font-semibold text-white mb-4">How It Works</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">1</span>
                                </div>
                                <p className="text-secondary">
                                    Deposit USDC to seed the lending pool before trading launches
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">2</span>
                                </div>
                                <p className="text-secondary">
                                    Earn credits based on deposit amount × time × early bird bonus
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">3</span>
                                </div>
                                <p className="text-secondary">
                                    When trading goes live, earn borrow interest from leveraged traders
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Leaderboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-3 space-y-6"
                >
                    <div className="p-6 rounded-2xl bg-surface border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Top Lenders</h2>
                            <div className="flex items-center gap-2 text-secondary text-sm">
                                <Award className="w-4 h-4" />
                                <span>NFT tier by rank</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.map((lender) => (
                                <div
                                    key={lender.rank}
                                    className={`p-4 rounded-xl border transition-all ${lender.tier === "Diamond"
                                        ? "bg-purple-500/5 border-purple-500/20"
                                        : lender.tier === "Gold"
                                            ? "bg-yellow-500/5 border-yellow-500/20"
                                            : "bg-background border-white/5"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${lender.rank <= 2
                                                ? "bg-purple-500/10 text-purple-400"
                                                : lender.rank <= 10
                                                    ? "bg-yellow-500/10 text-yellow-400"
                                                    : "bg-surface text-secondary"
                                                }`}>
                                                #{lender.rank}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{lender.address}</span>
                                                    <span className="text-sm">
                                                        {lender.tier === "Diamond" && "💎"}
                                                        {lender.tier === "Gold" && "🥇"}
                                                        {lender.tier === "Silver" && "🥈"}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-secondary">
                                                    {lender.tier} Lender
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-white">
                                                ${lender.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-accent">
                                                {lender.credits.toLocaleString()} credits
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NFT Tiers */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 via-surface to-purple-600/10 border border-accent/20">
                        <h3 className="text-lg font-semibold text-white mb-4">Founding Lender NFT Tiers</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {tiers.map((tier) => (
                                <div
                                    key={tier.name}
                                    className="p-4 rounded-xl bg-background/50 border border-white/5"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{tier.icon}</span>
                                        <span className="font-semibold text-white">{tier.name}</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-secondary">Rank</span>
                                            <span className="text-white">
                                                {tier.maxRank ? `#${tier.minRank}-${tier.maxRank}` : `#${tier.minRank}+`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-secondary">Perk</span>
                                            <span className="text-accent">{tier.perk}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-secondary">Fee Discount</span>
                                            <span className="text-emerald-400">{tier.discount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
