"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import {
    TrendingUp,
    TrendingDown,
    ChevronDown,
    Info,
    X
} from "lucide-react";
import PriceChart from "@/components/PriceChart";
import { usePythPrices, formatPrice, FX_PAIRS, PAIR_INFO } from "@/lib/pyth";

const leverageOptions = [1, 2, 5, 10, 15, 20, 25];

// Demo positions
const openPositions = [
    { pair: "EUR/USD", direction: "Long", size: 5000, leverage: 10, pnl: 234.50, pnlPercent: 4.69, entry: 1.1580, liqPrice: 1.1045 },
    { pair: "GBP/USD", direction: "Short", size: 3000, leverage: 5, pnl: -87.20, pnlPercent: -2.91, entry: 1.3380, liqPrice: 1.4049 },
];

export default function TradePage() {
    const [selectedPair, setSelectedPair] = useState(FX_PAIRS[0]);
    const [showPairDropdown, setShowPairDropdown] = useState(false);
    const [direction, setDirection] = useState<"long" | "short">("long");
    const [amount, setAmount] = useState("");
    const [leverage, setLeverage] = useState(10);
    const [orderType, setOrderType] = useState<"market" | "limit">("market");
    const [currentPrice, setCurrentPrice] = useState(0);

    const { prices, loading } = usePythPrices(FX_PAIRS);

    const handlePriceUpdate = useCallback((price: number) => {
        setCurrentPrice(price);
    }, []);

    const positionSize = parseFloat(amount || "0") * leverage;
    const entryPrice = currentPrice;
    const liqPrice = direction === "long"
        ? entryPrice * (1 - 1 / leverage * 0.9)
        : entryPrice * (1 + 1 / leverage * 0.9);

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
                        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface border border-border hover:border-white/20 transition-colors"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white">{selectedPair}</span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                                    Pyth
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white">
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
                                            <div className="font-semibold text-white">{pair}</div>
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
                        <div className="text-white font-medium">
                            {prices[selectedPair] ? formatPrice(prices[selectedPair].high24h) : '--'}
                        </div>
                    </div>
                    <div>
                        <span className="text-secondary">24h Low</span>
                        <div className="text-white font-medium">
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
                    <div className="h-96">
                        <PriceChart
                            pair={selectedPair}
                            onPriceUpdate={handlePriceUpdate}
                        />
                    </div>

                    {/* Open Positions */}
                    <div className="p-4 border-t border-white/5">
                        <h3 className="text-sm font-semibold text-white mb-3">Open Positions</h3>
                        <div className="space-y-2">
                            {openPositions.map((pos, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${pos.direction === 'Long'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {pos.direction}
                                        </div>
                                        <div>
                                            <span className="font-medium text-white">{pos.pair}</span>
                                            <span className="text-secondary text-xs ml-2">{pos.leverage}x</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={`font-medium ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-secondary">
                                                {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent}%
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                            <X className="w-4 h-4 text-secondary" />
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                    <h2 className="text-lg font-semibold text-white mb-6">Open Position</h2>

                    {/* Direction Tabs */}
                    <div className="flex rounded-xl bg-background p-1 mb-6">
                        <button
                            onClick={() => setDirection("long")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${direction === "long"
                                ? 'bg-emerald-500 text-white'
                                : 'text-secondary hover:text-white'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Long
                        </button>
                        <button
                            onClick={() => setDirection("short")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${direction === "short"
                                ? 'bg-red-500 text-white'
                                : 'text-secondary hover:text-white'
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
                                ? 'bg-white/10 text-white'
                                : 'text-secondary hover:text-white'
                                }`}
                        >
                            Market
                        </button>
                        <button
                            onClick={() => setOrderType("limit")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${orderType === "limit"
                                ? 'bg-white/10 text-white'
                                : 'text-secondary hover:text-white'
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
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 focus:border-accent focus:outline-none text-white text-lg"
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
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-secondary text-sm">Leverage</label>
                            <span className="text-accent font-bold">{leverage}x</span>
                        </div>
                        <div className="flex gap-2">
                            {leverageOptions.map((lev) => (
                                <button
                                    key={lev}
                                    onClick={() => setLeverage(lev)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${leverage === lev
                                        ? 'bg-accent text-white'
                                        : 'bg-background text-secondary hover:text-white'
                                        }`}
                                >
                                    {lev}x
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 rounded-xl bg-background mb-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary">Position Size</span>
                            <span className="text-white font-medium">
                                ${positionSize.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary">Entry Price</span>
                            <span className="text-white font-medium">
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
                            <span className="text-white font-medium">
                                ${(positionSize * 0.0005).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={!amount || parseFloat(amount) <= 0 || currentPrice === 0}
                        className={`w-full py-4 rounded-xl font-semibold transition-all disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed ${direction === "long"
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        {direction === "long" ? "Open Long" : "Open Short"} {selectedPair}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
