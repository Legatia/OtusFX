"use client";

import { motion } from "framer-motion";
import { Coins, TrendingUp, Lock, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OtusToken() {
    return (
        <section id="otus" className="py-24 container mx-auto px-6 relative z-10">
            <div className="relative rounded-[40px] overflow-hidden border border-accent/20 bg-gradient-to-br from-accent/5 via-[#0A0A0A] to-amber-500/5">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

                <div className="grid md:grid-cols-2 gap-12 p-8 md:p-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                            <Coins className="w-4 h-4" />
                            OTUS Token
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Treasury-Backed.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500">
                                Real Yield.
                            </span>
                        </h2>

                        <p className="text-lg text-secondary mb-8 max-w-lg">
                            $OTUS is backed by protocol treasury — not promises. Stake to earn 50% of all trading fees in USD1.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <Lock className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Floor Price Protection</h4>
                                    <p className="text-sm text-secondary">Always redeem at treasury-backed floor price</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Staking Rewards</h4>
                                    <p className="text-sm text-secondary">4-16% variable APR in USD1 stablecoins</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <Gift className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Holder Benefits</h4>
                                    <p className="text-sm text-secondary">Higher leverage access, fee cashback, priority deleverage</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/demo/stake"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-full transition-all"
                        >
                            Explore Staking
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square max-w-md mx-auto bg-surface/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center relative overflow-hidden">
                            {/* Logo */}
                            <img
                                src="/logos/OtusFX.png"
                                alt="OTUS Token"
                                className="w-24 h-24 object-contain mb-4"
                            />

                            <div className="text-center">
                                <div className="text-sm text-secondary mb-2">Trading Fee Distribution</div>
                                <div className="text-4xl font-bold text-accent mb-1">50%</div>
                                <div className="text-sm text-secondary">to OTUS Stakers</div>
                            </div>

                            {/* Stats */}
                            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center">
                                    <div className="text-2xl font-bold text-white">4-16%</div>
                                    <div className="text-xs text-secondary">Variable APR</div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center">
                                    <div className="text-2xl font-bold text-white">1B</div>
                                    <div className="text-xs text-secondary">Fixed Supply</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
