"use client";

import { motion } from "framer-motion";
import {
    ArrowDownUp,
    TrendingUp,
    TrendingDown,
    Coins,
    DollarSign,
    ChevronDown
} from "lucide-react";
import { useState } from "react";
import { useComingSoon } from "@/components/ComingSoonModal";

const mockPrices = {
    OTUS: 0.12,
    USDC: 1.00,
    USD1: 1.00,
};

const mockBalance = {
    OTUS: 45230,
    USDC: 1250,
    USD1: 850,
};

export default function SwapPage() {
    const [fromToken, setFromToken] = useState<"OTUS" | "USDC" | "USD1">("USDC");
    const [toToken, setToToken] = useState<"OTUS" | "USDC" | "USD1">("OTUS");
    const [fromAmount, setFromAmount] = useState("100");
    const [toAmount, setToAmount] = useState("");
    const { showComingSoon } = useComingSoon();

    const handleSwap = () => {
        // Calculate swap
        const from = parseFloat(fromAmount) || 0;
        const rate = mockPrices[fromToken] / mockPrices[toToken];
        const to = from * rate;
        setToAmount(to.toFixed(6));
    };

    const flipTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-primary">Swap OTUS</h1>
                <p className="text-secondary">Exchange OTUS for USDC/USD1 in-app</p>
            </motion.div>

            {/* Price Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-4"
            >
                <div className="p-4 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                        <Coins className="w-4 h-4 text-accent" />
                        OTUS Price
                    </div>
                    <div className="text-lg font-bold text-primary">${mockPrices.OTUS}</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +5.2% (24h)
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">Floor Price</div>
                    <div className="text-lg font-bold text-primary">$0.095</div>
                    <div className="text-xs text-secondary mt-1">Treasury backed</div>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-border">
                    <div className="text-secondary text-sm mb-1">24h Volume</div>
                    <div className="text-lg font-bold text-primary">$425K</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +12.5%
                    </div>
                </div>
            </motion.div>

            {/* Swap Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-surface border border-border"
            >
                {/* From */}
                <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-secondary">From</span>
                        <span className="text-xs text-secondary">
                            Balance: {mockBalance[fromToken].toLocaleString()} {fromToken}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => {
                                setFromAmount(e.target.value);
                                handleSwap();
                            }}
                            className="flex-1 bg-transparent text-2xl font-bold text-primary outline-none"
                            placeholder="0.00"
                        />
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:border-accent transition-colors">
                            <Coins className="w-5 h-5 text-accent" />
                            <span className="font-medium text-primary">{fromToken}</span>
                            <ChevronDown className="w-4 h-4 text-secondary" />
                        </button>
                    </div>
                    <div className="text-xs text-secondary mt-2">
                        ≈ ${(parseFloat(fromAmount) * mockPrices[fromToken]).toFixed(2)}
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-3 relative z-10">
                    <button
                        onClick={flipTokens}
                        className="w-12 h-12 rounded-xl bg-accent hover:bg-accent/80 border-4 border-surface flex items-center justify-center transition-colors"
                    >
                        <ArrowDownUp className="w-5 h-5 text-background" />
                    </button>
                </div>

                {/* To */}
                <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-secondary">To</span>
                        <span className="text-xs text-secondary">
                            Balance: {mockBalance[toToken].toLocaleString()} {toToken}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={toAmount}
                            readOnly
                            className="flex-1 bg-transparent text-2xl font-bold text-primary outline-none"
                            placeholder="0.00"
                        />
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:border-accent transition-colors">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <span className="font-medium text-primary">{toToken}</span>
                            <ChevronDown className="w-4 h-4 text-secondary" />
                        </button>
                    </div>
                    <div className="text-xs text-secondary mt-2">
                        ≈ ${(parseFloat(toAmount || "0") * mockPrices[toToken]).toFixed(2)}
                    </div>
                </div>

                {/* Swap Details */}
                <div className="mt-6 p-4 rounded-xl bg-background space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Rate</span>
                        <span className="text-primary font-medium">
                            1 {fromToken} = {(mockPrices[fromToken] / mockPrices[toToken]).toFixed(6)} {toToken}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Fee (0.3%)</span>
                        <span className="text-primary font-medium">
                            ${(parseFloat(fromAmount || "0") * mockPrices[fromToken] * 0.003).toFixed(3)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary">Slippage Tolerance</span>
                        <span className="text-primary font-medium">0.5%</span>
                    </div>
                </div>

                {/* Swap Action */}
                <button
                    onClick={() => showComingSoon("Token Swap")}
                    className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-accent to-amber-500 hover:from-accent/80 hover:to-amber-500/80 transition-all font-semibold text-background"
                >
                    Swap {fromToken} for {toToken}
                </button>
            </motion.div>

            {/* Redemption Option */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-primary mb-1">Treasury Redemption</h3>
                        <p className="text-sm text-secondary">
                            Redeem OTUS directly at floor price (2% fee)
                        </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 font-medium">
                        Floor: $0.095
                    </div>
                </div>
                <button
                    onClick={() => showComingSoon("Treasury Redemption")}
                    className="w-full px-4 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors text-purple-400 font-medium"
                >
                    Redeem at Floor Price
                </button>
            </motion.div>
        </div>
    );
}
