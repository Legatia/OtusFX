"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    ShoppingBag,
    Zap,
    Shield,
    Crown,
    Sparkles,
    Gift,
    Check,
    Lock
} from "lucide-react";

const categories = [
    { id: "all", label: "All" },
    { id: "trading", label: "Trading" },
    { id: "access", label: "Access" },
    { id: "protection", label: "Protection" },
    { id: "cosmetics", label: "Cosmetics" },
];

const items = [
    {
        id: 1,
        name: "Fee Discount Pack",
        description: "25% off trading fees for 7 days",
        price: 500,
        category: "trading",
        icon: Zap,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        popular: true,
    },
    {
        id: 2,
        name: "Leverage Unlock (15x)",
        description: "Unlock 15x leverage permanently",
        price: 1000,
        category: "access",
        icon: TrendingUp,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
    },
    {
        id: 3,
        name: "Liquidation Safe",
        description: "10% collateral returned if liquidated (1x use)",
        price: 2000,
        category: "protection",
        icon: Shield,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        popular: true,
    },
    {
        id: 4,
        name: "Zero-Fee Pass (7 Days)",
        description: "No trading fees for 7 days",
        price: 1500,
        category: "trading",
        icon: Sparkles,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
    },
    {
        id: 5,
        name: "Gasless Pack (10 Tx)",
        description: "10 gas-free transactions",
        price: 300,
        category: "trading",
        icon: Gift,
        color: "text-accent",
        bgColor: "bg-accent/10",
    },
    {
        id: 6,
        name: "2x Voting Power",
        description: "Double governance weight for next vote",
        price: 1000,
        category: "access",
        icon: Crown,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
    },
    {
        id: 7,
        name: "Username Change",
        description: "Change your display name",
        price: 250,
        category: "cosmetics",
        icon: User,
        color: "text-pink-400",
        bgColor: "bg-pink-500/10",
    },
    {
        id: 8,
        name: "Profile Badge: OG Trader",
        description: "Exclusive profile badge",
        price: 5000,
        category: "cosmetics",
        icon: Award,
        color: "text-accent",
        bgColor: "bg-accent/10",
        limited: true,
    },
];

import { TrendingUp, User, Award } from "lucide-react";

export default function MarketplacePage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const userCredits = 12450;

    const filteredItems = selectedCategory === "all"
        ? items
        : items.filter(item => item.category === selectedCategory);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white">Marketplace</h1>
                    <p className="text-secondary">Spend your credits on perks and upgrades</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border">
                    <ShoppingBag className="w-4 h-4 text-accent" />
                    <span className="font-bold text-white">{userCredits.toLocaleString()}</span>
                    <span className="text-secondary text-sm">credits</span>
                </div>
            </motion.div>

            {/* Category Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2 overflow-x-auto pb-2"
            >
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                ? 'bg-accent text-white'
                                : 'bg-surface text-secondary hover:text-white'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </motion.div>

            {/* Items Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
                {filteredItems.map((item, index) => {
                    const canAfford = userCredits >= item.price;
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group p-5 rounded-2xl bg-surface border transition-all ${canAfford
                                    ? 'border-border hover:border-accent/50 cursor-pointer'
                                    : 'border-border opacity-60'
                                }`}
                        >
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-4">
                                {item.popular && (
                                    <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
                                        Popular
                                    </span>
                                )}
                                {item.limited && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                                        Limited
                                    </span>
                                )}
                            </div>

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mb-4`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>

                            {/* Content */}
                            <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                            <p className="text-secondary text-sm mb-4">{item.description}</p>

                            {/* Price & Button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-accent">{item.price.toLocaleString()}</span>
                                    <span className="text-secondary text-sm">credits</span>
                                </div>
                                <button
                                    disabled={!canAfford}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${canAfford
                                            ? 'bg-accent hover:bg-accent-hover text-white'
                                            : 'bg-surface text-secondary cursor-not-allowed'
                                        }`}
                                >
                                    {canAfford ? 'Buy' : <Lock className="w-4 h-4" />}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Active Perks */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-surface border border-border"
            >
                <h2 className="text-lg font-semibold text-white mb-4">Your Active Perks</h2>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-medium">Fee Discount (5 days left)</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Check className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">Gasless Pack (7 tx left)</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
