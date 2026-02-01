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
    Percent,
    Loader2
} from "lucide-react";
import { useLendingPool } from "@/hooks/useLendingPool";
import { useComingSoon } from "@/components/ComingSoonModal";

// Interest rate model visualization data (static model)
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

import { useArcium } from "@/hooks/useArcium";

export default function LendPage() {
    const {
        poolStats,
        lenderStats,
        walletBalance,
        loading,
        initializeLenderPosition,
        depositLiquidity,
        withdrawLiquidity,
        depositLiquidityPrivate,
        withdrawLiquidityPrivate,
        claimOtusRewards
    } = useLendingPool();
    const arcium = useArcium();
    const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
    const [amount, setAmount] = useState("");
    const [stablecoinType, setStablecoinType] = useState<"USDC" | "USD1">("USDC");
    const [isPrivate, setIsPrivate] = useState(true); // Default to private mode
    const [submitting, setSubmitting] = useState(false);
    const [needsInit, setNeedsInit] = useState(false);
    const { showComingSoon } = useComingSoon();

    // Trigger Arcium simulation when privacy is toggled on
    const handlePrivacyToggle = async () => {
        const newState = !isPrivate;
        setIsPrivate(newState);
        if (newState) {
            // Simulate "encrypting" the current view key or similar context
            await arcium.encrypt('session', { timestamp: Date.now() });
        } else {
            arcium.reset();
        }
    };

    const handleMaxClick = () => {
        if (activeTab === "deposit") {
            setAmount((stablecoinType === "USDC" ? walletBalance.usdc : walletBalance.usd1).toString());
        } else {
            setAmount((stablecoinType === "USDC" ? lenderStats.usdcDeposited : lenderStats.usd1Deposited).toString());
        }
    };

    const handleInit = async () => {
        setSubmitting(true);
        try {
            await initializeLenderPosition();
            setNeedsInit(false);
            alert("✅ Lender position initialized!");
        } catch (e: any) {
            console.error("Initialization failed:", e);
            alert(`Initialization failed: ${e.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) return;

        // Check if user needs to initialize first
        if (lenderStats.totalUsdValue === 0 && activeTab === "deposit") {
            setNeedsInit(true);
            alert("⚠️ Please initialize your lender position first (one-time setup)");
            return;
        }

        setSubmitting(true);
        try {
            if (activeTab === "deposit") {
                if (isPrivate) {
                    await depositLiquidityPrivate(Number(amount), stablecoinType);
                    alert(`🔒 Privately deposited ${amount} ${stablecoinType}! Your deposit source is hidden via Privacy Cash.`);
                } else {
                    await depositLiquidity(Number(amount), stablecoinType);
                    alert(`✅ Deposited ${amount} ${stablecoinType}!`);
                }
            } else {
                if (isPrivate) {
                    await withdrawLiquidityPrivate(Number(amount), stablecoinType);
                    alert(`🔒 Privately withdrew ${amount} ${stablecoinType} + OTUS interest! Your destination is hidden.`);
                } else {
                    await withdrawLiquidity(Number(amount), stablecoinType);
                    alert(`✅ Withdrew ${amount} ${stablecoinType} + OTUS interest!`);
                }
            }
            setAmount("");
        } catch (e: any) {
            console.error("Transaction failed:", e);
            alert(`Transaction failed: ${e.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClaimOtus = async () => {
        if (lenderStats.otusInterestEarned === 0) {
            alert("No OTUS interest to claim");
            return;
        }

        setSubmitting(true);
        try {
            await claimOtusRewards();
            alert(`✅ Claimed ${lenderStats.otusInterestEarned.toFixed(2)} OTUS!`);
        } catch (e: any) {
            console.error("Claim failed:", e);
            alert(`Claim failed: ${e.message}`);
        } finally {
            setSubmitting(false);
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
                        {arcium.state !== 'idle' && arcium.state !== 'ready' ? (
                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        ) : (
                            <Lock className="w-4 h-4 text-purple-400" />
                        )}
                        <span className="text-purple-400 text-sm font-medium">
                            {arcium.state === 'idle' ? 'Privacy Ready' :
                                arcium.state === 'ready' ? 'Arcium Secured' :
                                    arcium.state === 'initializing' ? 'Initializing MPC...' :
                                        arcium.state === 'sharding' ? 'Sharding Keys...' :
                                            'Computing Blinded Result...'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 text-sm font-medium">Pool Active</span>
                    </div>
                </div>
            </motion.div>

            {/* Privacy Banner - Enhanced for Arcium */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        {arcium.state === 'ready' ? (
                            <Shield className="w-5 h-5 text-purple-400" />
                        ) : (
                            <Lock className="w-5 h-5 text-purple-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-primary mb-1">
                                {arcium.state === 'ready' ? 'Arcium MPC Protected' : 'Privacy Cash Integration'}
                            </h3>
                            {arcium.state !== 'idle' && arcium.state !== 'ready' && (
                                <span className="text-xs text-purple-400 font-mono">{arcium.progress}%</span>
                            )}
                        </div>
                        <p className="text-secondary text-sm">
                            {arcium.state === 'ready'
                                ? "Your session is secured by Arcium Multi-Party Computation. Data is split across nodes and never reconstructed."
                                : "Your deposit amount and earnings are encrypted. Only you can see your balance. Pool TVL is shown as an approximate range."}
                        </p>
                        {/* Simulation Progress Bar */}
                        {arcium.state !== 'idle' && arcium.state !== 'ready' && (
                            <div className="w-full h-1 bg-purple-500/20 rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${arcium.progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        )}
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
                    <div className="text-xs text-secondary mt-1">
                        ${poolStats.totalDepositsUsdc.toLocaleString()} USDC + ${poolStats.totalDepositsUsd1.toLocaleString()} USD1
                    </div>
                </div>

                {/* Utilization Rate */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Percent className="w-4 h-4" />
                        Utilization
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {poolStats.utilizationRate.toFixed(1)}%
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
                        {poolStats.lenderAPY.toFixed(2)}%
                    </div>
                    <div className="text-xs text-secondary mt-1">Paid in OTUS</div>
                </div>

                {/* Your Deposit */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Lock className="w-4 h-4 text-accent" />
                        Your Deposit
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        ${lenderStats.totalUsdValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">
                        {lenderStats.otusInterestEarned.toFixed(2)} OTUS earned
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
                        {/* Privacy Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-primary">Privacy Mode</div>
                                    <div className="text-xs text-secondary">
                                        {isPrivate
                                            ? "🔒 Deposit source hidden via Privacy Cash"
                                            : "⚠️ Direct deposit (wallet linkage visible)"
                                        }
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handlePrivacyToggle}
                                className={`relative w-14 h-7 rounded-full transition-colors ${isPrivate ? "bg-purple-500" : "bg-gray-600"
                                    }`}
                            >
                                <div className={`absolute w-6 h-6 bg-white rounded-full top-0.5 transition-transform ${isPrivate ? "translate-x-7" : "translate-x-0.5"
                                    }`} />
                            </button>
                        </div>

                        {/* Stablecoin Selector */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStablecoinType("USDC")}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${stablecoinType === "USDC"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "bg-surface text-secondary hover:text-primary border border-border"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <span className="text-xs font-bold text-blue-400">$</span>
                                    </div>
                                    USDC
                                </div>
                            </button>
                            <button
                                onClick={() => setStablecoinType("USD1")}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${stablecoinType === "USD1"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-surface text-secondary hover:text-primary border border-border"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <span className="text-xs font-bold text-emerald-400">$</span>
                                    </div>
                                    USD1
                                </div>
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-secondary text-sm">Amount</span>
                                <span className="text-secondary text-sm">
                                    Balance: {activeTab === "deposit"
                                        ? (stablecoinType === "USDC" ? walletBalance.usdc : walletBalance.usd1).toLocaleString()
                                        : (stablecoinType === "USDC" ? lenderStats.usdcDeposited : lenderStats.usd1Deposited).toLocaleString()
                                    } {stablecoinType}
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
                                    <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${stablecoinType === "USDC" ? "bg-blue-500/10 border-blue-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                                        }`}>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${stablecoinType === "USDC" ? "bg-blue-500/10" : "bg-emerald-500/10"
                                            }`}>
                                            <span className={`text-xs font-bold ${stablecoinType === "USDC" ? "text-blue-400" : "text-emerald-400"}`}>$</span>
                                        </div>
                                        <span className="font-medium text-primary">{stablecoinType}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Current APY (in OTUS)</span>
                                <span className="text-emerald-400 font-medium">{poolStats.lenderAPY.toFixed(2)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">OTUS Price</span>
                                <span className="text-primary font-medium">${poolStats.otusPrice.toFixed(4)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">Estimated yearly OTUS</span>
                                <span className="text-primary font-medium">
                                    {(((parseFloat(amount) || 0) * poolStats.lenderAPY / 100) / poolStats.otusPrice).toFixed(2)} OTUS
                                </span>
                            </div>
                            {activeTab === "withdraw" && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-secondary">OTUS interest to claim</span>
                                    <span className="text-emerald-400 font-medium">{lenderStats.otusInterestEarned.toFixed(2)} OTUS</span>
                                </div>
                            )}
                        </div>

                        {/* Privacy Benefits Info */}
                        {isPrivate && (
                            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                <div className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                                    <div className="text-xs text-secondary">
                                        <span className="text-purple-400 font-medium">Privacy Protection Active:</span> Your deposit source, amount, and balance are encrypted via Privacy Cash. On-chain observers cannot link this transaction to your wallet.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {needsInit ? (
                            <button
                                onClick={handleInit}
                                disabled={submitting}
                                className="w-full py-4 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Initializing..." : "Initialize Lender Position (One-time)"}
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !amount || Number(amount) <= 0}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isPrivate
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                                        : activeTab === "deposit"
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                            : "bg-accent hover:bg-accent-hover text-white"
                                        }`}
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {activeTab === "deposit" ? "Depositing..." : "Withdrawing..."}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            {isPrivate && <Lock className="w-4 h-4" />}
                                            {activeTab === "deposit"
                                                ? `${isPrivate ? 'Private ' : ''}Deposit ${stablecoinType}`
                                                : `${isPrivate ? 'Private ' : ''}Withdraw ${stablecoinType}`
                                            }
                                        </div>
                                    )}
                                </button>

                                {lenderStats.otusInterestEarned > 0 && (
                                    <button
                                        onClick={handleClaimOtus}
                                        disabled={submitting}
                                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Claiming...
                                            </div>
                                        ) : (
                                            `Claim ${lenderStats.otusInterestEarned.toFixed(2)} OTUS`
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
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
