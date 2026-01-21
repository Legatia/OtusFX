"use client";

import { motion } from "framer-motion";
import { Shield, TrendingDown, Activity, Zap } from "lucide-react";

export default function AutoDeleverage() {
    return (
        <section id="deleverage" className="py-24 container mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                        <Shield className="w-4 h-4" />
                        Liquidation Protection
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        No Sudden Liquidations.
                    </h2>
                    <p className="text-xl text-secondary max-w-2xl mx-auto">
                        Progressive auto-deleverage protects your capital with soft landings instead of hard liquidations.
                    </p>
                </motion.div>

                {/* Comparison */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Traditional */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Traditional Perps</h3>
                                <p className="text-sm text-red-400">Hard liquidation</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-secondary">
                                <span className="text-red-400">✗</span>
                                Position at 10% margin → 100% liquidated
                            </div>
                            <div className="flex items-center gap-3 text-secondary">
                                <span className="text-red-400">✗</span>
                                Cascade liquidations crash price
                            </div>
                            <div className="flex items-center gap-3 text-secondary">
                                <span className="text-red-400">✗</span>
                                Lose entire position in seconds
                            </div>
                        </div>
                    </motion.div>

                    {/* OtusFX */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">OtusFX</h3>
                                <p className="text-sm text-emerald-400">Progressive deleverage</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-secondary">
                                <span className="text-emerald-400">✓</span>
                                Position at 50% margin → Reduce 20%
                            </div>
                            <div className="flex items-center gap-3 text-secondary">
                                <span className="text-emerald-400">✓</span>
                                Position at 35% margin → Reduce 30%
                            </div>
                            <div className="flex items-center gap-3 text-secondary">
                                <span className="text-emerald-400">✓</span>
                                Position at 25% margin → Reduce 40%
                            </div>
                            <div className="flex items-center gap-3 text-secondary">
                                <span className="text-emerald-400">✓</span>
                                Only full close at 15% (emergency)
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface border border-border text-secondary text-sm">
                        <Zap className="w-4 h-4 text-accent" />
                        OTUS stakers get even better thresholds — priority protection
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
