"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    TrendingUp,
    TrendingDown,
    Lock,
    Gift,
    Users,
    Coins,
    RefreshCw,
    Vault,
    Award
} from "lucide-react";

// ============================================================
// CARD 1: PRIVATE FX TRADING (existing order book)
// ============================================================

const generateOrders = (side: 'buy' | 'sell') => {
    const basePrice = 1.0842;
    return Array.from({ length: 5 }, (_, i) => ({
        price: side === 'buy'
            ? (basePrice - (i + 1) * 0.0001).toFixed(4)
            : (basePrice + (i + 1) * 0.0001).toFixed(4),
        size: Math.floor(Math.random() * 500000) + 100000,
        encrypted: true,
    }));
};

function FXTradingCard({ showEncrypted }: { showEncrypted: boolean }) {
    const [buyOrders, setBuyOrders] = useState(generateOrders('buy'));
    const [sellOrders, setSellOrders] = useState(generateOrders('sell'));
    const [currentPrice, setCurrentPrice] = useState(1.0842);

    useEffect(() => {
        const interval = setInterval(() => {
            setBuyOrders(generateOrders('buy'));
            setSellOrders(generateOrders('sell'));
            setCurrentPrice(1.0842 + (Math.random() - 0.5) * 0.001);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-primary">EUR/USD</span>
                    <span className="text-2xl font-mono text-emerald-400">
                        {currentPrice.toFixed(4)}
                    </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
                    Private FX Trading
                </div>
            </div>

            {/* Order Book */}
            <div className="grid grid-cols-2 gap-4">
                {/* Bids */}
                <div>
                    <div className="text-xs text-secondary mb-2 flex justify-between">
                        <span>Bid Price</span>
                        <span>Size</span>
                    </div>
                    {buyOrders.map((order, i) => (
                        <motion.div
                            key={`buy-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-between py-1.5 text-sm"
                        >
                            <span className="text-emerald-400 font-mono">{order.price}</span>
                            <span className="text-secondary font-mono">
                                {showEncrypted ? "██████" : order.size.toLocaleString()}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Asks */}
                <div>
                    <div className="text-xs text-secondary mb-2 flex justify-between">
                        <span>Ask Price</span>
                        <span>Size</span>
                    </div>
                    {sellOrders.map((order, i) => (
                        <motion.div
                            key={`sell-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-between py-1.5 text-sm"
                        >
                            <span className="text-red-400 font-mono">{order.price}</span>
                            <span className="text-secondary font-mono">
                                {showEncrypted ? "██████" : order.size.toLocaleString()}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Trade Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                <button className="py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                    Long
                </button>
                <button className="py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                    <TrendingDown className="w-4 h-4" />
                    Short
                </button>
            </div>
        </>
    );
}

// ============================================================
// CARD 2: BOOTSTRAP POOL (private deposits)
// ============================================================

function BootstrapCard({ showEncrypted }: { showEncrypted: boolean }) {
    const mockDeposit = 5000;
    const mockCredits = 1050;
    const mockTotalRaised = 2450000;
    const mockParticipants = 523;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Gift className="w-6 h-6 text-accent" />
                    <span className="text-xl font-bold text-primary">Bootstrap Pool</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                    Private Deposits
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-background border border-white/5">
                    <div className="text-xs text-secondary mb-1">Total Raised</div>
                    <div className="text-lg font-bold text-primary font-mono">
                        {showEncrypted ? "██████" : `$${(mockTotalRaised / 1_000_000).toFixed(2)}M`}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-white/5">
                    <div className="text-xs text-secondary mb-1">Participants</div>
                    <div className="text-lg font-bold text-primary font-mono">
                        {showEncrypted ? "███" : mockParticipants}
                    </div>
                </div>
            </div>

            {/* Your Position */}
            <div className="p-4 rounded-xl bg-background border border-white/5 mb-4">
                <div className="text-xs text-secondary mb-3">Your Private Position</div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">Deposited</span>
                        <span className="text-primary font-mono font-medium">
                            {showEncrypted ? "██████" : `$${mockDeposit.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">Credits Earned</span>
                        <span className="text-accent font-mono font-medium">
                            {showEncrypted ? "████" : mockCredits.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">Your Rank</span>
                        <span className="text-purple-400 font-mono font-medium">
                            {showEncrypted ? "██" : "#47"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Deposit Button */}
            <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
                <Lock className="w-4 h-4" />
                Private Deposit
            </button>
        </>
    );
}

// ============================================================
// CARD 3: LENDING POOL (private lending)
// ============================================================

function LendingCard({ showEncrypted }: { showEncrypted: boolean }) {
    const mockDeposit = 10000;
    const mockEarnings = 43.50;
    const mockAPY = 5.2;
    const mockTVL = 2450000;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-emerald-400" />
                    <span className="text-xl font-bold text-primary">Lending Pool</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    Private Lending
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-background border border-white/5">
                    <div className="text-xs text-secondary mb-1">Pool TVL</div>
                    <div className="text-lg font-bold text-primary font-mono">
                        {showEncrypted ? "██████" : `$${(mockTVL / 1_000_000).toFixed(2)}M`}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-white/5">
                    <div className="text-xs text-secondary mb-1">Lender APY</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                        {mockAPY}%
                    </div>
                </div>
            </div>

            {/* Your Position */}
            <div className="p-4 rounded-xl bg-background border border-white/5 mb-4">
                <div className="text-xs text-secondary mb-3">Your Private Position</div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">Deposited</span>
                        <span className="text-primary font-mono font-medium">
                            {showEncrypted ? "██████" : `$${mockDeposit.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">Earnings</span>
                        <span className="text-emerald-400 font-mono font-medium">
                            {showEncrypted ? "████" : `+$${mockEarnings.toFixed(2)}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Deposit Button */}
            <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
                <Lock className="w-4 h-4" />
                Private Deposit
            </button>
        </>
    );
}

// ============================================================
// CARD 4: TOKEN SWAP (private swap)
// ============================================================

function SwapCard({ showEncrypted }: { showEncrypted: boolean }) {
    const mockFromAmount = 1000;
    const mockToAmount = 8333;
    const mockRate = 0.12;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-cyan-400" />
                    <span className="text-xl font-bold text-primary">Token Swap</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                    Private Swap
                </div>
            </div>

            {/* From Token */}
            <div className="p-4 rounded-xl bg-background border border-white/5 mb-2">
                <div className="text-xs text-secondary mb-2">From</div>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary font-mono">
                        {showEncrypted ? "██████" : mockFromAmount.toLocaleString()}
                    </span>
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                        USDC
                    </div>
                </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center -my-1">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-secondary" />
                </div>
            </div>

            {/* To Token */}
            <div className="p-4 rounded-xl bg-background border border-white/5 mt-2 mb-4">
                <div className="text-xs text-secondary mb-2">To</div>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary font-mono">
                        {showEncrypted ? "██████" : mockToAmount.toLocaleString()}
                    </span>
                    <div className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent font-medium">
                        OTUS
                    </div>
                </div>
            </div>

            {/* Rate */}
            <div className="text-xs text-secondary text-center mb-4">
                1 OTUS = ${mockRate} USDC
            </div>

            {/* Swap Button */}
            <button className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
                <Lock className="w-4 h-4" />
                Private Swap
            </button>
        </>
    );
}

// ============================================================
// CARD 5: TOKEN STAKING (private staking)
// ============================================================

function StakingCard({ showEncrypted }: { showEncrypted: boolean }) {
    const mockStaked = 25000;
    const mockReward = 86.25;
    const mockAPR = 22.5;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-400" />
                    <span className="text-xl font-bold text-primary">OTUS Staking</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                    Private Staking
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-background border border-white/5">
                    <div className="text-xs text-secondary mb-1">Staked</div>
                    <div className="text-lg font-bold text-primary font-mono">
                        {showEncrypted ? "██████" : `${mockStaked.toLocaleString()} OTUS`}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-white/5">
                    <div className="text-xs text-secondary mb-1">APR</div>
                    <div className="text-lg font-bold text-amber-400 font-mono">
                        {mockAPR}%
                    </div>
                </div>
            </div>

            {/* Your Position */}
            <div className="p-4 rounded-xl bg-background border border-white/5 mb-4">
                <div className="text-xs text-secondary mb-3">Your Private Position</div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">Weekly Reward</span>
                        <span className="text-amber-400 font-mono font-medium">
                            {showEncrypted ? "████" : `$${mockReward.toFixed(2)}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary">Lock Period</span>
                        <span className="text-primary font-mono font-medium">
                            90 days
                        </span>
                    </div>
                </div>
            </div>

            {/* Stake Button */}
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-amber-500 hover:from-accent/80 hover:to-amber-500/80 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
                <Lock className="w-4 h-4" />
                Private Stake
            </button>
        </>
    );
}

// ============================================================
// CARD 6: STRATEGY VAULTS (private copy trading)
// ============================================================

function VaultsCard({ showEncrypted }: { showEncrypted: boolean }) {
    const mockReturns = 12.4;
    const mockAUM = 234500;
    const mockDepositors = 47;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Vault className="w-6 h-6 text-purple-400" />
                    <span className="text-xl font-bold text-primary">Strategy Vaults</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                    Private Copy Trading
                </div>
            </div>

            {/* Vault Card */}
            <div className="p-4 rounded-xl bg-background border border-white/5 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-primary">EUR/PLN Macro Strategy</span>
                    <span className="text-xs text-secondary">by Trader #4521</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <div className="text-xs text-secondary mb-1">30d Return</div>
                        <div className="text-lg font-bold text-emerald-400 font-mono">
                            {showEncrypted ? "███" : `+${mockReturns}%`}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-secondary mb-1">AUM</div>
                        <div className="text-lg font-bold text-primary font-mono">
                            {showEncrypted ? "████" : `$${(mockAUM / 1000).toFixed(0)}K`}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-secondary mb-1">Depositors</div>
                        <div className="text-lg font-bold text-primary font-mono">
                            {showEncrypted ? "██" : mockDepositors}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Note */}
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 mb-4">
                <div className="flex items-center gap-2 text-xs text-purple-400">
                    <Lock className="w-3 h-3" />
                    <span>Strategy positions encrypted • You see returns, not trades</span>
                </div>
            </div>

            {/* Deposit Button */}
            <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
                <Lock className="w-4 h-4" />
                Private Deposit
            </button>
        </>
    );
}

// ============================================================
// MAIN CAROUSEL COMPONENT
// ============================================================

const cards = [
    { id: 0, title: "Private FX Trading", component: FXTradingCard },
    { id: 1, title: "Bootstrap Pool", component: BootstrapCard },
    { id: 2, title: "Lending Pool", component: LendingCard },
    { id: 3, title: "Token Swap", component: SwapCard },
    { id: 4, title: "OTUS Staking", component: StakingCard },
    { id: 5, title: "Strategy Vaults", component: VaultsCard },
];

export default function FeatureCarousel() {
    const [currentCard, setCurrentCard] = useState(0);
    const [showEncrypted, setShowEncrypted] = useState(true);

    const nextCard = () => setCurrentCard((prev) => (prev + 1) % cards.length);
    const prevCard = () => setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);

    const CurrentCardComponent = cards[currentCard].component;

    return (
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-2xl">
            {/* Card Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[320px]"
                >
                    <CurrentCardComponent showEncrypted={showEncrypted} />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Footer */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                {/* Left Arrow */}
                <button
                    onClick={prevCard}
                    className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-accent/50 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Toggle Encryption Button */}
                <button
                    onClick={() => setShowEncrypted(!showEncrypted)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-colors"
                >
                    {showEncrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showEncrypted ? "Click to reveal" : "Encrypted"}
                </button>

                {/* Right Arrow */}
                <button
                    onClick={nextCard}
                    className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-accent/50 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-3">
                {cards.map((card, i) => (
                    <button
                        key={card.id}
                        onClick={() => setCurrentCard(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentCard ? 'bg-accent w-6' : 'bg-border hover:bg-secondary'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
