"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import {
    TrendingUp,
    TrendingDown,
    ChevronDown,
    Info,
    X,
    Lock,
    Eye,
    EyeOff,
    Users2,
    Zap,
    Star,
    Shield,
    Award,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import PriceChart from "@/components/PriceChart";
import { usePythPrices, formatPrice, FX_PAIRS, PAIR_INFO } from "@/lib/pyth";
import { useTrading, usePositions } from "@/hooks/useTrading";
import { useComingSoon } from "@/components/ComingSoonModal";

const MAX_LEVERAGE = 20; // Dynamic leverage up to 20x

// Demo positions with privacy (Fallback if no wallet)
const MOCK_POSITIONS = [
    { pair: "EUR/USD", direction: "Long", size: 5000, leverage: 10, pnl: 234.50, pnlPercent: 4.69, entry: 1.1580, liqPrice: 1.1045, isPrivate: true },
    { pair: "GBP/USD", direction: "Short", size: 3000, leverage: 5, pnl: -87.20, pnlPercent: -2.91, entry: 1.3380, liqPrice: 1.4049, isPrivate: true },
];

// Enhanced Intent Copy signals with trader stats (Owl tiers)
const copySignals = [
    {
        id: 1,
        trader: "Trader #4521",
        pair: "EUR/USD",
        direction: "Long",
        traderOrderSize: 15000,  // Trader's order size (signal), not copier requirement
        copiers: 12,
        timeLeft: 45,
        // Trader stats for trust
        winRate: 68,
        reputation: 87,
        totalVolume: 234500,
        tradeCount: 156,
        tier: "great_horned", // Owl tiers: snowy, great_horned, eagle, barn, screech
    },
    {
        id: 2,
        trader: "Trader #8923",
        pair: "GBP/USD",
        direction: "Short",
        traderOrderSize: 25000,
        copiers: 5,
        timeLeft: 23,
        // Trader stats
        winRate: 61,
        reputation: 74,
        totalVolume: 89200,
        tradeCount: 78,
        tier: "eagle",
    },
    {
        id: 3,
        trader: "Trader #2103",
        pair: "USD/JPY",
        direction: "Long",
        traderOrderSize: 50000,
        copiers: 28,
        timeLeft: 67,
        // Trader stats
        winRate: 72,
        reputation: 94,
        totalVolume: 567800,
        tradeCount: 312,
        tier: "snowy",
    },
];

// Owl tier styling
const tierColors: Record<string, { bg: string; text: string; icon: string; name: string }> = {
    snowy: { bg: "bg-purple-500/20", text: "text-purple-300", icon: "�", name: "Snowy" },
    great_horned: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: "�", name: "Great Horned" },
    eagle: { bg: "bg-amber-500/20", text: "text-amber-400", icon: "�", name: "Eagle" },
    barn: { bg: "bg-gray-400/20", text: "text-gray-300", icon: "🦉", name: "Barn" },
    screech: { bg: "bg-gray-600/20", text: "text-gray-400", icon: "🪶", name: "Screech" },
};

export default function TradePage() {
    const [selectedPair, setSelectedPair] = useState(FX_PAIRS[0]);
    const [showPairDropdown, setShowPairDropdown] = useState(false);
    const [direction, setDirection] = useState<"long" | "short">("long");
    const [amount, setAmount] = useState("");
    const [leverage, setLeverage] = useState(10);
    const [orderType, setOrderType] = useState<"market" | "limit">("market");
    const [currentPrice, setCurrentPrice] = useState(0);

    const { openPosition } = useTrading();
    const { positions: realPositions, loading: positionsLoading } = usePositions();

    // Use real positions if available/connected, otherwise empty (don't show mock to confused user) OR show mock?
    // Let's show real positions if length > 0, else show empy state. 
    // Actually, user might confuse mock positions for real. 
    // BETTER: Only show real positions. If local dev with no connection, show nothing.
    const openPositions: any[] = realPositions.length > 0 ? realPositions : [];
    const [allowCopying, setAllowCopying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { prices, loading } = usePythPrices(FX_PAIRS);
    const { showComingSoon } = useComingSoon();

    // Mock treasury stats for dynamic leverage calculation
    const treasuryDepth = 2_500_000; // $2.5M total
    const treasuryUtilization = 0.65; // 65% currently utilized
    const availableLiquidity = treasuryDepth * (1 - treasuryUtilization); // ~$875K available
    const userOTUSHoldings = 5000; // Mock OTUS balance

    // Calculate dynamic max leverage based on order size vs available liquidity
    // Formula: maxLeverage = 20 / (1 + orderAmount / availableLiquidity × 4)
    // At $0 order: 20x | At $50K: ~15x | At $200K: ~8x | At $400K: ~5x
    const calculateMaxLeverage = (orderAmount: number): number => {
        if (orderAmount <= 0) return 20;

        const baseLeverage = 20 / (1 + (orderAmount / availableLiquidity) * 4);

        // OTUS holder bonus: +1x per 5K OTUS (max +4x)
        const otusBonus = Math.min(4, Math.floor(userOTUSHoldings / 5000));

        return Math.max(1, Math.min(20, Math.floor(baseLeverage + otusBonus)));
    };

    const orderAmount = parseFloat(amount || "0");
    const dynamicMaxLeverage = calculateMaxLeverage(orderAmount);

    // Clamp current leverage to dynamic max
    const effectiveLeverage = Math.min(leverage, dynamicMaxLeverage);

    const handlePriceUpdate = useCallback((price: number) => {
        setCurrentPrice(price);
    }, []);

    const positionSize = orderAmount * effectiveLeverage;
    const entryPrice = currentPrice;
    const liqPrice = direction === "long"
        ? entryPrice * (1 - 1 / effectiveLeverage * 0.9)
        : entryPrice * (1 + 1 / effectiveLeverage * 0.9);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with Pair Selector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                {/* Pair Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowPairDropdown(!showPairDropdown)}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface border border-border hover:border-primary/20 transition-colors"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-primary">{selectedPair}</span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                                    Pyth
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                                {currentPrice > 0 ? formatPrice(currentPrice) : 'Loading...'}
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${showPairDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showPairDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-surface border border-border shadow-xl z-20 max-h-80 overflow-y-auto">
                            {FX_PAIRS.map((pair) => {
                                const priceData = prices[pair];
                                const pairInfo = PAIR_INFO[pair];
                                return (
                                    <button
                                        key={pair}
                                        onClick={() => {
                                            setSelectedPair(pair);
                                            setShowPairDropdown(false);
                                        }}
                                        className="w-full px-3 py-3 rounded-lg flex items-center justify-between hover:bg-background transition-colors"
                                    >
                                        <div>
                                            <div className="font-semibold text-primary">{pair}</div>
                                            <div className="text-sm text-secondary">
                                                {priceData ? formatPrice(priceData.price, pairInfo?.decimals || 4) : 'Loading...'}
                                            </div>
                                        </div>
                                        {priceData?.isLive && (
                                            <div className="text-sm font-medium text-emerald-400">
                                                Live
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Price Stats */}
                <div className="flex items-center gap-6 text-sm">
                    <div>
                        <span className="text-secondary">24h High</span>
                        <div className="text-primary font-medium">
                            {prices[selectedPair] ? formatPrice(prices[selectedPair].high24h) : '--'}
                        </div>
                    </div>
                    <div>
                        <span className="text-secondary">24h Low</span>
                        <div className="text-primary font-medium">
                            {prices[selectedPair] ? formatPrice(prices[selectedPair].low24h) : '--'}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 rounded-2xl bg-surface border border-border overflow-hidden"
                >
                    {/* Pyth Price Chart */}
                    <div className="h-80">
                        <PriceChart
                            pair={selectedPair}
                            onPriceUpdate={handlePriceUpdate}
                        />
                    </div>

                    {/* Open Positions with Privacy */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-primary">Your Positions</h3>
                            <span className="flex items-center gap-1 text-xs text-purple-400">
                                <Lock className="w-3 h-3" />
                                Encrypted via Arcium
                            </span>
                        </div>
                        <div className="space-y-2">
                            {openPositions.length === 0 ? (
                                <div className="text-center py-8 text-secondary text-sm">
                                    No open positions
                                </div>
                            ) : (
                                openPositions.map((pos, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-4 rounded-xl bg-background border border-border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1 h-12 rounded-full ${pos.side?.toLowerCase() === "long" ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-primary">{pos.pair}</span>
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${pos.side?.toLowerCase() === "long"
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {pos.side}
                                                    </span>
                                                    {pos.isPrivate && <Lock className="w-3 h-3 text-purple-400" />}
                                                </div>
                                                <div className="text-sm text-secondary mt-1">
                                                    {pos.leverage}x • Entry: {formatPrice(pos.entryPrice || pos.entry)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`font-bold ${(pos.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {(pos.pnl || 0) >= 0 ? '+' : ''}${(pos.pnl || 0).toFixed(2)}
                                            </div>
                                            <div className={`text-xs ${(pos.pnlPercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {(pos.pnlPercent || 0) >= 0 ? '+' : ''}{(pos.pnlPercent || 0).toFixed(2)}%
                                            </div>
                                            <div className="text-xs text-secondary mt-1">
                                                Size: ${pos.size.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Enhanced Intent Copy Signals */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                                <Users2 className="w-4 h-4 text-accent" />
                                Copy Trading Signals
                            </h3>
                            <span className="flex items-center gap-1 text-xs text-purple-400">
                                <Lock className="w-3 h-3" />
                                via Arcium MPC
                            </span>
                        </div>
                        <p className="text-xs text-secondary mb-3">
                            Only verified traders (50+ trades, 55%+ win rate, reputation ≥70) can post signals.
                        </p>
                        <div className="space-y-3">
                            {copySignals.map((signal) => {
                                const tier = tierColors[signal.tier];
                                return (
                                    <div
                                        key={signal.id}
                                        className="p-4 rounded-xl bg-gradient-to-r from-accent/5 to-purple-500/5 border border-accent/10"
                                    >
                                        {/* Top Row: Direction, Pair, Tier Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2 py-1 rounded text-xs font-medium ${signal.direction === 'Long'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {signal.direction}
                                                </div>
                                                <span className="font-semibold text-primary">{signal.pair}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.bg} ${tier.text}`}>
                                                    {tier.icon} {tier.name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-secondary">
                                                {signal.timeLeft}s left
                                            </div>
                                        </div>

                                        {/* Middle Row: Trader Stats */}
                                        <div className="flex items-center gap-4 mb-3 text-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="text-secondary">by</span>
                                                <span className="text-primary font-medium">{signal.trader}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400" />
                                                <span className="text-primary">{signal.winRate}%</span>
                                                <span className="text-secondary">win rate</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Shield className="w-3 h-3 text-emerald-400" />
                                                <span className="text-primary">{signal.reputation}</span>
                                                <span className="text-secondary">rep</span>
                                            </div>
                                            <div className="text-secondary">
                                                ${(signal.totalVolume / 1000).toFixed(0)}K vol
                                            </div>
                                        </div>

                                        {/* Bottom Row: Order Size, Copiers, Copy Button */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-secondary">
                                                    Order: <span className="text-primary">${signal.traderOrderSize.toLocaleString()}</span>
                                                </span>
                                                <span className="text-secondary">
                                                    <span className="text-primary">{signal.copiers}</span> copying
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => showComingSoon("Copy Trading")}
                                                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                                            >
                                                <Zap className="w-3.5 h-3.5" />
                                                Copy Trade
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Order Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-surface border border-border"
                >
                    <h2 className="text-lg font-semibold text-primary mb-6">Open Position</h2>

                    {/* Direction Tabs */}
                    <div className="flex rounded-xl bg-background p-1 mb-6">
                        <button
                            onClick={() => setDirection("long")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${direction === "long"
                                ? 'bg-emerald-500 text-white'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Long
                        </button>
                        <button
                            onClick={() => setDirection("short")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${direction === "short"
                                ? 'bg-red-500 text-white'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            <TrendingDown className="w-4 h-4" />
                            Short
                        </button>
                    </div>

                    {/* Order Type */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setOrderType("market")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${orderType === "market"
                                ? 'bg-primary/10 text-primary'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            Market
                        </button>
                        <button
                            onClick={() => setOrderType("limit")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${orderType === "limit"
                                ? 'bg-primary/10 text-primary'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            Limit
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-secondary text-sm">Amount (USDC)</label>
                            <span className="text-secondary text-xs">Balance: 10,000</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-primary text-lg"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    onClick={() => setAmount("10000")}
                                    className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded"
                                >
                                    MAX
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Leverage Slider */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-secondary text-sm">Leverage</label>
                            <div className="flex items-center gap-2">
                                <span className="text-accent font-bold text-lg">{effectiveLeverage}x</span>
                                {leverage > dynamicMaxLeverage && (
                                    <span className="text-xs text-red-400">(capped from {leverage}x)</span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${effectiveLeverage <= 5 ? 'bg-emerald-500/10 text-emerald-400' : effectiveLeverage <= 10 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {effectiveLeverage <= 5 ? 'Low Risk' : effectiveLeverage <= 10 ? 'Medium' : 'High Risk'}
                                </span>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={leverage}
                                onChange={(e) => setLeverage(parseInt(e.target.value))}
                                className="w-full h-2 bg-background rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, 
                                        var(--accent) 0%, 
                                        var(--accent) ${(Math.min(leverage, dynamicMaxLeverage) / 20) * 100}%, 
                                        ${leverage > dynamicMaxLeverage ? 'rgb(239 68 68 / 0.3)' : 'var(--background)'} ${(Math.min(leverage, dynamicMaxLeverage) / 20) * 100}%, 
                                        ${leverage > dynamicMaxLeverage ? 'rgb(239 68 68 / 0.3)' : 'var(--background)'} ${(leverage / 20) * 100}%,
                                        var(--background) ${(leverage / 20) * 100}%, 
                                        var(--background) 100%)`
                                }}
                            />
                            {/* Max leverage indicator */}
                            <div
                                className="absolute top-0 h-2 border-r-2 border-yellow-400 pointer-events-none"
                                style={{ left: `${(dynamicMaxLeverage / 20) * 100}%` }}
                                title={`Max available: ${dynamicMaxLeverage}x`}
                            />
                            <div className="flex justify-between mt-2 text-xs text-secondary">
                                <span>1x</span>
                                <span>5x</span>
                                <span>10x</span>
                                <span>15x</span>
                                <span>20x</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                            <span className="text-secondary">
                                Max available: <span className="text-yellow-400 font-medium">{dynamicMaxLeverage}x</span>
                                {orderAmount > 0 && <span className="text-secondary/60 ml-1">(for ${orderAmount.toLocaleString()} order)</span>}
                            </span>
                            <span className="text-secondary/60">
                                Pool: {Math.round(treasuryUtilization * 100)}% used
                            </span>
                        </div>
                    </div>

                    {/* Allow Copying Toggle */}
                    <div className="mb-6 p-4 rounded-xl bg-background border border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users2 className="w-4 h-4 text-accent" />
                                <span className="text-sm font-medium text-primary">Allow Copying</span>
                            </div>
                            <button
                                onClick={() => setAllowCopying(!allowCopying)}
                                className="focus:outline-none"
                            >
                                {allowCopying ? (
                                    <ToggleRight className="w-8 h-8 text-accent" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-secondary" />
                                )}
                            </button>
                        </div>
                        {allowCopying && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs text-secondary">
                                    Your trade will be visible as a signal. Min $5K order required.
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-secondary">Commission:</span>
                                    <span className="text-emerald-400 font-medium">20% of copier profits</span>
                                    <Lock className="w-3 h-3 text-purple-400" />
                                    <span className="text-purple-400">via ShadowWire</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 rounded-xl bg-background mb-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary">Position Size</span>
                            <span className="text-primary font-medium">
                                ${positionSize.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary">Entry Price</span>
                            <span className="text-primary font-medium">
                                {entryPrice > 0 ? formatPrice(entryPrice) : '--'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary flex items-center gap-1">
                                Liquidation Price
                                <Info className="w-3 h-3" />
                            </span>
                            <span className="text-red-400 font-medium">
                                {positionSize > 0 && entryPrice > 0 ? formatPrice(liqPrice) : '--'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary">Fee (0.05%)</span>
                            <span className="text-primary font-medium">
                                ${(positionSize * 0.0005).toFixed(2)}
                            </span>
                        </div>
                        {allowCopying && (
                            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                                <span className="text-purple-400 flex items-center gap-1">
                                    <Users2 className="w-3 h-3" />
                                    Copy Signal
                                </span>
                                <span className="text-purple-400 font-medium">
                                    Enabled
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={!amount || parseFloat(amount) <= 0 || currentPrice === 0}
                        onClick={() => showComingSoon("Trading")}
                        className={`w-full py-4 rounded-xl font-semibold transition-all disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed ${direction === "long"
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        {`${direction === "long" ? "Open Long" : "Open Short"} ${selectedPair}`}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
