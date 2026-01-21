"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    Gift,
    Users,
    Coins,
    RefreshCw
} from "lucide-react";
import { usePythPrices, formatPrice } from "@/lib/pyth";

// Production: Portfolio stats come from summing user positions
// TODO: Integrate with usePositions and useBootstrap hooks for real data
const portfolioStats = {
    totalValue: 0,          // Sum of margin + unrealized PnL
    pnl: 0,                 // Total unrealized PnL
    pnlPercent: 0,          // PnL as percent of deposits
    openPositions: 0,       // Count from usePositions
    credits: 0,             // From useCredits hook
};

// Production: Positions come from usePositions hook
// Empty array shows real empty state
const positions: any[] = [];

const pairSymbols = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"];

export default function DashboardPage() {
    const { prices, loading } = usePythPrices(pairSymbols);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
                    <p className="text-secondary">Welcome back, Trader</p>
                </div>
                <Link
                    href="/app/trade"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all"
                >
                    <TrendingUp className="w-4 h-4" />
                    Open Trade
                </Link>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Portfolio Value */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Wallet className="w-4 h-4" />
                        Portfolio Value
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        ${portfolioStats.totalValue.toLocaleString()}
                    </div>
                </div>

                {/* P&L */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        {portfolioStats.pnl >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        Total P&L
                    </div>
                    <div className={`text-2xl font-bold ${portfolioStats.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {portfolioStats.pnl >= 0 ? '+' : ''}${portfolioStats.pnl.toLocaleString()}
                    </div>
                    <div className={`text-sm ${portfolioStats.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {portfolioStats.pnl >= 0 ? '+' : ''}{portfolioStats.pnlPercent}%
                    </div>
                </div>

                {/* Open Positions */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Users className="w-4 h-4" />
                        Open Positions
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        {portfolioStats.openPositions}
                    </div>
                </div>

                {/* Credits */}
                <div className="p-5 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                        <Coins className="w-4 h-4 text-accent" />
                        Credits
                    </div>
                    <div className="text-2xl font-bold text-accent">
                        {portfolioStats.credits.toLocaleString()}
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Positions List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-primary">Open Positions</h2>
                        <Link href="/app/trade" className="text-accent text-sm hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {positions.map((position, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl bg-background border border-white/5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${position.direction === 'Long'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {position.direction}
                                        </div>
                                        <div>
                                            <div className="font-medium text-primary">{position.pair}</div>
                                            <div className="text-xs text-secondary">
                                                {position.leverage}x • ${position.size.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-semibold ${position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                                        </div>
                                        <div className={`text-xs ${position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {position.pnl >= 0 ? '+' : ''}{position.pnlPercent}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Market Prices */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-surface border border-border"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-primary">Markets</h2>
                            {loading && <RefreshCw className="w-4 h-4 text-accent animate-spin" />}
                        </div>
                        <div className="space-y-3">
                            {pairSymbols.map((symbol) => {
                                const priceData = prices[symbol];
                                return (
                                    <Link key={symbol} href="/app/trade" className="flex items-center justify-between hover:bg-white/5 -mx-2 px-2 py-1 rounded-lg transition-colors">
                                        <span className="text-secondary">{symbol}</span>
                                        <div className="text-right">
                                            <div className="text-primary font-medium">
                                                {priceData ? formatPrice(priceData.price) : '--'}
                                            </div>
                                            <div className="text-xs text-purple-400">
                                                {priceData ? 'Live' : 'Loading...'}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Bootstrap CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-orange-600/10 border border-accent/20"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Gift className="w-5 h-5 text-accent" />
                            <h3 className="font-semibold text-primary">Bootstrap Phase</h3>
                        </div>
                        <p className="text-secondary text-sm mb-4">
                            Deposit USDC and vote for pairs to become a Founding Trader.
                        </p>
                        <Link
                            href="/app/bootstrap"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-full transition-all text-sm"
                        >
                            Join Bootstrap
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
