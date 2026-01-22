"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

// Mock encrypted order book data
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

export default function HeroDemoFirst() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEncrypted, setShowEncrypted] = useState(true);
    const [buyOrders, setBuyOrders] = useState(generateOrders('buy'));
    const [sellOrders, setSellOrders] = useState(generateOrders('sell'));
    const [currentPrice, setCurrentPrice] = useState(1.0842);

    // Animate the order book
    useEffect(() => {
        const interval = setInterval(() => {
            setBuyOrders(generateOrders('buy'));
            setSellOrders(generateOrders('sell'));
            setCurrentPrice(1.0842 + (Math.random() - 0.5) * 0.001);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'landing-demo' }),
            });
            if (res.ok) setSubmitted(true);
        } catch (err) {
            console.error('Waitlist error:', err);
        }
        setLoading(false);
    };

    return (
        <section className="relative min-h-screen flex items-center py-20 px-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />

            <div className="container relative z-10 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Copy */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent mb-6"
                        >
                            <Lock className="w-3 h-3" />
                            Live Preview
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight"
                        >
                            See Your Orders<br />
                            <span className="text-accent">Stay Invisible</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-secondary mb-8 max-w-md"
                        >
                            OtusFX encrypts your order size, entry price, and strategy.
                            Only you see your positions. Everyone else sees noise.
                        </motion.p>

                        {/* Waitlist */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl flex items-center gap-2"
                                    >
                                        {loading ? "..." : "Join Waitlist"}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            ) : (
                                <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 max-w-md">
                                    You're on the list!
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex gap-4 text-sm"
                        >
                            <a href="/demo" className="text-accent hover:underline flex items-center gap-1">
                                Try Full Demo <ArrowRight className="w-3 h-3" />
                            </a>
                        </motion.div>
                    </div>

                    {/* Right: Interactive Demo */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        {/* Mock Trading Interface */}
                        <div className="p-6 rounded-2xl bg-surface border border-border shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-primary">EUR/USD</span>
                                    <span className="text-2xl font-mono text-emerald-400">
                                        {currentPrice.toFixed(4)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowEncrypted(!showEncrypted)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs"
                                >
                                    {showEncrypted ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {showEncrypted ? "Encrypted" : "Revealed"}
                                </button>
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

                            {/* Privacy Badge */}
                            <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-purple-400">
                                    Order sizes encrypted via Arcium MPC
                                </span>
                            </div>
                        </div>

                        {/* Floating annotation */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium shadow-lg"
                        >
                            Click to toggle encryption
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
