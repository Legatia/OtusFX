"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Lock,
    Shield,
    Info,
    Percent
} from "lucide-react";
import { useComingSoon } from "@/components/ComingSoonModal";

// Mock pool data
const poolStats = {
    totalDeposits: 2_450_000,
    totalBorrowed: 1_837_500,
    utilizationRate: 75,
    lenderAPY: 5.2,
    borrowRate: 8.1,
    yourDeposit: 10_000,
    yourEarnings: 43.50,
};

// Interest rate model visualization data
const utilizationPoints = [
    { util: 0, rate: 2 },
    { util: 20, rate: 3 },
    { util: 40, rate: 4 },
    { util: 60, rate: 5 },
    { util: 80, rate: 6 },
    { util: 85, rate: 15 },
    { util: 90, rate: 30 },
    { util: 95, rate: 50 },
    { util: 100, rate: 75 },
];

export default function LendPage() {
    const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
    const [amount, setAmount] = useState("");
    const walletBalance = 25_000; // Mock wallet balance
    const { showComingSoon } = useComingSoon();

    const handleMaxClick = () => {
        if (activeTab === "deposit") {
            setAmount(walletBalance.toString());
        } else {
            setAmount(poolStats.yourDeposit.toString());
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-primary">Private Lending Pool</h1>
                    <p className="text-secondary">Deposit USDC privately, earn from leveraged traders</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <Lock className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">Balance Hidden</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 text-sm font-medium">Pool Active</span>
                    </div>
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
                        <Lock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary mb-1">Privacy Cash Integration</h3>
                        <p className="text-secondary text-sm">
                            Your deposit amount and earnings are encrypted. Only you can see your balance.
                            Pool TVL is shown as an approximate range to protect large depositors.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Total Deposits */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Wallet className="w-4 h-4" />
                        Total Deposits
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        ${poolStats.totalDeposits.toLocaleString()}
                    </div>
                    <div className="text-xs text-secondary mt-1">USDC</div>
                </div>

                {/* Utilization Rate */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Percent className="w-4 h-4" />
                        Utilization
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {poolStats.utilizationRate}%
                    </div>
                    <div className="w-full h-2 bg-background rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-full transition-all"
                            style={{ width: `${poolStats.utilizationRate}%` }}
                        />
                    </div>
                </div>

                {/* Lender APY */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Lender APY
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {poolStats.lenderAPY}%
                    </div>
                    <div className="text-xs text-secondary mt-1">Variable rate</div>
                </div>

                {/* Your Deposit */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Lock className="w-4 h-4 text-accent" />
                        Your Deposit
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        ${poolStats.yourDeposit.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">
                        +${poolStats.yourEarnings.toFixed(2)} earned
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Deposit/Withdraw Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border"
                >
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab("deposit")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "deposit"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-background text-secondary hover:text-primary border border-transparent"
                                }`}
                        >
                            <ArrowDownLeft className="w-4 h-4" />
                            Deposit
                        </button>
                        <button
                            onClick={() => setActiveTab("withdraw")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "withdraw"
                                ? "bg-accent/10 text-accent border border-accent/20"
                                : "bg-background text-secondary hover:text-primary border border-transparent"
                                }`}
                        >
                            <ArrowUpRight className="w-4 h-4" />
                            Withdraw
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-secondary text-sm">Amount</span>
                                <span className="text-secondary text-sm">
                                    Balance: ${activeTab === "deposit"
                                        ? walletBalance.toLocaleString()
                                        : poolStats.yourDeposit.toLocaleString()
                                    }
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="flex-1 bg-transparent text-3xl font-bold text-primary outline-none placeholder:text-secondary/50"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleMaxClick}
                                        className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
                                    >
                                        MAX
                                    </button>
                                    <div className="px-3 py-2 rounded-lg bg-surface border border-border flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-400">$</span>
                                        </div>
                                        <span className="font-medium text-primary">USDC</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Current APY</span>
                                <span className="text-emerald-400 font-medium">{poolStats.lenderAPY}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Estimated yearly earnings</span>
                                <span className="text-primary font-medium">
                                    ${((parseFloat(amount) || 0) * poolStats.lenderAPY / 100).toFixed(2)}
                                </span>
                            </div>
                            {activeTab === "withdraw" && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-secondary">Withdrawal fee</span>
                                    <span className="text-primary font-medium">0%</span>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => showComingSoon("Lending Pool")}
                            className={`w-full py-4 rounded-xl font-semibold transition-all ${activeTab === "deposit"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-accent hover:bg-accent-hover text-white"
                                }`}
                        >
                            {activeTab === "deposit" ? "Deposit USDC" : "Withdraw USDC"}
                        </button>
                    </div>
                </motion.div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    {/* How it works */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-surface border border-border"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5 text-accent" />
                            <h3 className="font-semibold text-primary">How It Works</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">1</span>
                                </div>
                                <p className="text-secondary">
                                    Deposit USDC into the lending pool
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">2</span>
                                </div>
                                <p className="text-secondary">
                                    Traders borrow your USDC for leveraged positions
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">3</span>
                                </div>
                                <p className="text-secondary">
                                    Earn interest from borrow fees + trading fees
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Risk Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-surface border border-border"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-semibold text-primary">Risk Protection</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-secondary">Collateralization</span>
                                <span className="text-emerald-400 font-medium">Overcollateralized</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-secondary">Liquidation Buffer</span>
                                <span className="text-primary font-medium">10%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-secondary">Bad Debt Coverage</span>
                                <span className="text-primary font-medium">Insurance Fund</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Revenue Sources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
                    >
                        <h3 className="font-semibold text-primary mb-3">Your Yield Sources</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-secondary">Trading Fees</span>
                                <span className="text-emerald-400">0.05%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-secondary">Borrow Interest</span>
                                <span className="text-emerald-400">{poolStats.borrowRate}% APY</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-secondary">Liquidation Fees</span>
                                <span className="text-emerald-400">5%</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
