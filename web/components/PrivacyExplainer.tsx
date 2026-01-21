"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Search, ShieldCheck, AlertTriangle } from "lucide-react";

export default function PrivacyExplainer() {
    return (
        <section id="privacy" className="py-24 container mx-auto px-6 relative z-10">

            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-6"
                >
                    <AlertTriangle className="w-3 h-3" />
                    THE PROBLEM WITH DEFI
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
                >
                    Your Strategy is <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        Public Property.
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-secondary text-lg leading-relaxed"
                >
                    On public blockchains like Solana, "Transparency" is a bug, not a feature.
                    When you trade on a DEX, you broadcast your <strong>Entry Price</strong>, <strong>Position Size</strong>, and <strong>Liquidation Level</strong> to the entire world.
                </motion.p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                {/* The Glass House (Public) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative p-8 rounded-3xl bg-surface border border-red-500/20 overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Eye className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">The Glass House</h3>
                            <p className="text-sm text-red-400">Standard Solana DEX</p>
                        </div>
                    </div>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <Search className="w-5 h-5 text-secondary mt-1 shrink-0" />
                            <p className="text-secondary text-sm">
                                <strong className="text-white">Wallet Trackers</strong> analyze your trading patterns and copy your profitable strategies within seconds.
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <Search className="w-5 h-5 text-secondary mt-1 shrink-0" />
                            <p className="text-secondary text-sm">
                                <strong className="text-white">Competitors</strong> reverse-engineer your edge by tracking your wallet history on Nansen or Arkham.
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <Search className="w-5 h-5 text-secondary mt-1 shrink-0" />
                            <p className="text-secondary text-sm">
                                <strong className="text-white">Copy-Traders</strong> erode your alpha by mimicking your positions instantly, reducing your returns.
                            </p>
                        </li>
                    </ul>
                </motion.div>

                {/* The Black Box (Private) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="relative p-8 rounded-3xl bg-surface border border-accent/20 overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                            <EyeOff className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">The Black Box</h3>
                            <p className="text-sm text-accent">OtusFX Venue</p>
                        </div>
                    </div>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-secondary mt-1 shrink-0" />
                            <p className="text-secondary text-sm">
                                <strong className="text-white">Encrypted Intents:</strong> The blockchain verifies <em>that</em> you traded, but not <em>what</em> or <em>how much</em>.
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-secondary mt-1 shrink-0" />
                            <p className="text-secondary text-sm">
                                <strong className="text-white">Alpha Protection:</strong> Your strategy remains your intellectual property. No one looks over your shoulder.
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-secondary mt-1 shrink-0" />
                            <p className="text-secondary text-sm">
                                <strong className="text-white">Selective Disclosure:</strong> You hold the View Keys. Share them with auditors, not the internet.
                            </p>
                        </li>
                    </ul>
                </motion.div>

            </div>
        </section>
    );
}
