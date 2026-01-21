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
    Percent,
    Lock
} from "lucide-react";
import { useComingSoon } from "@/components/ComingSoonModal";

// DEMO: No smart contract connection

const bootstrapStats = {
    totalDeposits: 2_450_000,
    participants: 523,
    daysRemaining: 12,
    estimatedAPY: 5.2,
    yourDeposit: 0,
    yourCredits: 0,
    yourRank: null as number | null,
};

// Mock Leaderboard Data - Privacy-first (No public addresses, no public amounts)
const leaderboard = [
    { rank: 1, id: "Scops-8821", credits: 31500, tier: "Great Horned" },
    { rank: 2, id: "Scops-4192", credits: 21000, tier: "Great Horned" },
    { rank: 3, id: "Scops-2910", credits: 15750, tier: "Snowy" },
    { rank: 4, id: "Scops-1102", credits: 10500, tier: "Barn" },
    { rank: 5, id: "Scops-0581", credits: 5250, tier: "Screech" },
];

const tiers = [
    { name: "Great Horned", icon: "🦉", minRank: 1, maxRank: 10, perk: "VIP Access", discount: "50%" },
    { name: "Snowy", icon: "🦅", minRank: 11, maxRank: 100, perk: "Priority", discount: "35%" },
    { name: "Barn", icon: "🐦", minRank: 101, maxRank: 500, perk: "Early Access", discount: "25%" },
    { name: "Screech", icon: "🪶", minRank: 501, maxRank: null, perk: "OG Scops", discount: "10%" },
];

// Use centralized token config - stablecoins only for privacy deposits
import { SUPPORTED_TOKENS, TOKEN_ORDER } from "@/lib/tokens";

const TOKENS = TOKEN_ORDER.map(symbol => ({
    symbol,
    name: SUPPORTED_TOKENS[symbol].name,
    color: SUPPORTED_TOKENS[symbol].color,
}));

// Added estimatedCredits helper for render scope
const getEstimatedCredits = (amount: string) => (parseFloat(amount) || 0) * 21 * 0.1 * 2;

export default function DemoBootstrapPage() {
    const [depositAmount, setDepositAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState("USDC");
    const [isPrivate, setIsPrivate] = useState(true);
    const walletBalance = 25000; // Mock balance
    const [isDepositing, setIsDepositing] = useState(false);
    const { showComingSoon } = useComingSoon();

    const handleDeposit = async () => {
        showComingSoon("Bootstrap Liquidity");
    };

    // Demo uses static mock data
    const displayTotalRaised = bootstrapStats.totalDeposits;

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
                        <h1 className="text-2xl font-bold text-primary">Bootstrap: Seed the Lending Pool</h1>
                        <p className="text-secondary">Deposit assets, earn credits, become a Genesis Scops</p>
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
                        Total Liquidity
                    </div>
                    <div className="text-xl font-bold text-primary">
                        ${(displayTotalRaised / 1_000_000).toFixed(2)}M
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Genesis Scops
                    </div>
                    <div className="text-xl font-bold text-primary">
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-primary">Deposit Liquidity</h2>
                            <button
                                onClick={() => setIsPrivate(!isPrivate)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isPrivate
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-primary/5 text-secondary border border-transparent'
                                    }`}
                            >
                                {isPrivate ? (
                                    <>
                                        <Lock className="w-3 h-3" />
                                        Private Mode
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-3 h-3" />
                                        Public Mode
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Token Selector */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                            {TOKENS.map((token) => (
                                <button
                                    key={token.symbol}
                                    onClick={() => setSelectedToken(token.symbol)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedToken === token.symbol
                                        ? "bg-primary text-background"
                                        : "bg-surface border border-border text-secondary hover:text-primary"
                                        }`}
                                >
                                    {token.symbol}
                                </button>
                            ))}
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-secondary text-sm">Amount</label>
                                <span className="text-secondary text-sm">
                                    Balance: {selectedToken === "USDC" ? walletBalance.toLocaleString() : "0.00"}
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-background border border-white/5">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="flex-1 bg-transparent text-2xl font-bold text-primary outline-none placeholder:text-secondary/50"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setDepositAmount(walletBalance.toString())}
                                            className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
                                        >
                                            MAX
                                        </button>
                                        <span className="text-primary font-medium">{selectedToken}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-secondary text-xs mt-2">
                                Minimum deposit: $100 equiv.
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 rounded-xl bg-background border border-white/5 space-y-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Estimated Credits (2x early bird)</span>
                                <span className="text-accent font-medium">
                                    {getEstimatedCredits(depositAmount).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Est. Yield (during bootstrap)</span>
                                <span className="text-primary font-medium">
                                    ${((parseFloat(depositAmount) || 0) * 0.05 * (21 / 365)).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Privacy Status</span>
                                {isPrivate ? (
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                        <Shield className="w-3 h-3" />
                                        Confidential
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-secondary font-medium">
                                        <Users className="w-3 h-3" />
                                        Public
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleDeposit}
                            disabled={!depositAmount || parseFloat(depositAmount) < 100 || isDepositing}
                            className={`w-full py-4 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed ${isPrivate
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-primary hover:bg-primary/90 text-background'
                                }`}
                        >
                            {isDepositing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isPrivate ? "Encrypting..." : "Depositing..."}
                                </>
                            ) : (
                                `${isPrivate ? 'Private Deposit' : 'Deposit'} ${selectedToken}`
                            )}
                        </button>

                        {/* Info */}
                        <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div className="text-sm">
                                    <p className="text-primary font-medium mb-1">Earn 2x Credits This Week!</p>
                                    <p className="text-secondary">
                                        Early depositors get double credits. Deposit now to maximize rewards.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="p-6 rounded-2xl bg-surface border border-border">
                        <h3 className="font-semibold text-primary mb-4">How It Works</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">1</span>
                                </div>
                                <p className="text-secondary">
                                    Deposit assets to seed the lending pool (auto-swaps to USDC)
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">2</span>
                                </div>
                                <p className="text-secondary">
                                    Amounts are masked. Earn credits secretly.
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
                            <h2 className="text-lg font-semibold text-primary">Scops Leaders</h2>
                            <div className="flex items-center gap-2 text-secondary text-sm">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Privacy Active</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.map((lender) => (
                                <div
                                    key={lender.rank}
                                    className={`p-4 rounded-xl border transition-all ${lender.tier === "Great Horned"
                                        ? "bg-purple-500/5 border-purple-500/20"
                                        : lender.tier === "Snowy"
                                            ? "bg-cyan-500/5 border-cyan-500/20"
                                            : lender.tier === "Barn"
                                                ? "bg-yellow-500/5 border-yellow-500/20"
                                                : "bg-background border-white/5"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${lender.rank <= 2
                                                ? "bg-purple-500/10 text-purple-400"
                                                : lender.rank <= 10
                                                    ? "bg-cyan-500/10 text-cyan-400"
                                                    : "bg-surface text-secondary"
                                                }`}>
                                                #{lender.rank}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-primary">{lender.id}</span>
                                                    <span className="text-sm">
                                                        {lender.tier === "Great Horned" && "🦉"}
                                                        {lender.tier === "Snowy" && "🦅"}
                                                        {lender.tier === "Barn" && "🐦"}
                                                        {lender.tier === "Screech" && "🪶"}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-secondary">
                                                    {lender.tier} Scops
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-secondary flex items-center gap-1.5 justify-end">
                                                <Lock className="w-3 h-3" />
                                                Hidden
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
                        <h3 className="text-lg font-semibold text-primary mb-4">Genesis Scops NFT Tiers</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {tiers.map((tier) => (
                                <div
                                    key={tier.name}
                                    className="p-4 rounded-xl bg-background/50 border border-white/5"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{tier.icon}</span>
                                        <span className="font-semibold text-primary">{tier.name}</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-secondary">Rank</span>
                                            <span className="text-primary">
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

