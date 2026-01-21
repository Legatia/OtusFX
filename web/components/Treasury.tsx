"use client";

import { motion } from "framer-motion";
import { TrendingUp, Lock, Wallet } from "lucide-react";

export default function Treasury() {
    return (
        <section className="py-24 container mx-auto px-6 relative z-10">
            <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-[#0A0A0A]">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-16 items-center">

                    {/* Text Content */}
                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                                Dynamic Leverage. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-500">
                                    Real Yield Backed.
                                </span>
                            </h2>
                            <p className="text-secondary text-lg leading-relaxed mb-8 max-w-lg">
                                The lending pool is sustained by multiple revenue streams.
                                Traders pay fees, the protocol stays solvent, lenders earn yield.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Trading Fees (0.05%)</h4>
                                        <p className="text-sm text-secondary">Every trade pays a fee that flows to lenders.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                        <Lock className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Borrow Interest (8% APY)</h4>
                                        <p className="text-sm text-secondary">Leveraged traders pay interest on borrowed stablecoins.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                        <Wallet className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Liquidation Fees (5%)</h4>
                                        <p className="text-sm text-secondary">Unhealthy positions are closed with penalty fees.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Visual Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-square md:aspect-video lg:aspect-square bg-surface/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">

                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

                            <div className="relative z-10">
                                <span className="text-secondary text-sm font-mono uppercase tracking-wider">Risk-Adjusted Leverage</span>
                                <div className="text-5xl md:text-6xl font-bold text-white tracking-tighter mt-2 group-hover:text-accent transition-colors duration-500">
                                    Up to 20<span className="text-3xl align-top text-gray-500">x</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Scales with pool utilization</p>
                            </div>

                            <div className="relative z-10 p-6 rounded-3xl bg-black/40 border border-white/5 mt-auto backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <Wallet className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-medium text-white">Treasury Strategy</span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    {/* Donut Chart using CSS conic-gradient */}
                                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="w-full h-full rounded-full"
                                            style={{
                                                background: `conic-gradient(
                                                    #3b82f6 0deg 180deg,
                                                    #a855f7 180deg 252deg,
                                                    #22c55e 252deg 324deg,
                                                    #3f3f46 324deg 360deg
                                                )`,
                                                boxShadow: "0 0 30px rgba(59, 130, 246, 0.3), 0 0 60px rgba(168, 85, 247, 0.2)"
                                            }}
                                        />
                                        {/* Center cutout for donut effect */}
                                        <div className="absolute w-20 h-20 rounded-full bg-[#0A0A0A] flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">100%</span>
                                        </div>
                                    </div>


                                    {/* Legend */}
                                    <div className="w-full grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                <span className="text-sm text-gray-300">Lending Pool</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">50%</span>
                                        </div>
                                        <div className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                                <span className="text-sm text-gray-300">Active Trading</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">25%</span>
                                        </div>
                                        <div className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                <span className="text-sm text-gray-300">Trader Collateral</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">15%</span>
                                        </div>
                                        <div className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                                <span className="text-sm text-gray-400">Liquidation Buffer</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">10%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
