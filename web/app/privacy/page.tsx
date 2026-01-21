"use client";

import { motion } from "framer-motion";
import {
    Eye, EyeOff, Shield, Lock, Fingerprint, Search,
    Zap, Check, X, AlertTriangle, Database, Cpu
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Background from "@/components/Background";
import MatrixRain from "@/components/MatrixRain";

export default function PrivacyPage() {
    return (
        <main className="dark min-h-screen bg-background text-foreground relative selection:bg-accent selection:text-white">
            <MatrixRain />
            <Navbar />
            <Background />

            <div className="container mx-auto px-6 py-32 relative z-10">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6 uppercase tracking-wider"
                    >
                        <Shield className="w-3 h-3" />
                        Privacy Architecture
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
                    >
                        Your <span className="text-accent">Strategy</span> is Sacred.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed"
                    >
                        OtusFX is built on privacy-first infrastructure. Every layer is designed to protect your trading edge from exposure.
                    </motion.p>
                </div>

                {/* Section 1: The Problem */}
                <section className="mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-4">
                            <AlertTriangle className="w-3 h-3" />
                            THE PROBLEM
                        </span>
                        <h2 className="text-3xl font-bold text-white">Public Blockchains Leak Everything</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            {
                                title: "Wallet Tracking",
                                description: "Tools like Nansen and Arkham label your wallet. Every trade becomes public signal that competitors analyze.",
                                icon: Search,
                            },
                            {
                                title: "Strategy Copying",
                                description: "Copy-trading bots monitor successful wallets. The moment you show alpha, algorithms extract it instantly.",
                                icon: Eye,
                            },
                            {
                                title: "Liquidation Hunting",
                                description: "Your liquidation price is visible on-chain. Whales can target clustered liquidations for profit.",
                                icon: AlertTriangle,
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-surface border border-red-500/20"
                            >
                                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                                    <item.icon className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-secondary text-sm">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Section 2: Privacy Technologies We Use */}
                <section className="mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-4">
                            <Lock className="w-3 h-3" />
                            OUR SOLUTION
                        </span>
                        <h2 className="text-3xl font-bold text-white">Industrial-Grade Privacy Stack</h2>
                        <p className="text-secondary mt-2 max-w-xl mx-auto">Four layers of privacy protection, each designed for a specific threat model.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[
                            {
                                title: "Arcium MPC",
                                description: "Multi-Party Computation encrypts order matching. Nodes process trades without seeing the details.",
                                icon: Cpu,
                                color: "blue",
                                protects: "Order patterns, position sizes"
                            },
                            {
                                title: "Privacy Cash SDK",
                                description: "ZK-proof deposits break the link between your funding wallet and trading identity.",
                                icon: Database,
                                color: "purple",
                                protects: "Deposit source, wallet linkage"
                            },
                            {
                                title: "ShadowWire",
                                description: "Bulletproof private transfers for copy trading commissions and internal payments.",
                                icon: Zap,
                                color: "yellow",
                                protects: "Commission payments, internal transfers"
                            },
                            {
                                title: "View Keys",
                                description: "Selective disclosure for compliance. Share with auditors, not the market.",
                                icon: Fingerprint,
                                color: "emerald",
                                protects: "Regulatory access, solvency proofs"
                            },
                            {
                                title: "Pyth Oracle Pricing",
                                description: "Oracle-based execution means no slippage. Your orders don't move the market.",
                                icon: Shield,
                                color: "accent",
                                protects: "No price impact, fair execution"
                            },
                        ].map((item, i) => {
                            const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
                                blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
                                purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
                                yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" },
                                emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
                                accent: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent" },
                            };
                            const c = colorClasses[item.color];
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-6 rounded-2xl bg-surface border ${c.border}`}
                                >
                                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
                                        <item.icon className={`w-5 h-5 ${c.text}`} />
                                    </div>
                                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-secondary text-sm mb-3">{item.description}</p>
                                    <div className={`text-xs ${c.text} font-medium`}>
                                        Protects: {item.protects}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Section 3: Risks Comparison Table */}
                <section className="mb-32 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-2">Risk Coverage Matrix</h2>
                        <p className="text-secondary">What we protect against vs. what's not applicable with oracle pricing.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="overflow-hidden rounded-2xl border border-border"
                    >
                        <table className="w-full">
                            <thead className="bg-surface">
                                <tr>
                                    <th className="text-left p-4 text-sm font-semibold text-white">Risk</th>
                                    <th className="text-center p-4 text-sm font-semibold text-white">Status</th>
                                    <th className="text-left p-4 text-sm font-semibold text-white">Explanation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { risk: "Wallet Tracking", status: "protected", explanation: "Privacy Cash breaks deposit→trade link" },
                                    { risk: "Strategy Copying", status: "protected", explanation: "Encrypted positions hide your moves" },
                                    { risk: "Pattern Analysis", status: "protected", explanation: "Arcium MPC hides order flow patterns" },
                                    { risk: "Liquidation Hunting", status: "protected", explanation: "Hidden liq prices via confidential tokens" },
                                ].map((item, i) => (
                                    <tr key={i} className="bg-emerald-500/5">
                                        <td className="p-4 text-white font-medium">{item.risk}</td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                                <Check className="w-3 h-3" />
                                                Protected
                                            </span>
                                        </td>
                                        <td className="p-4 text-secondary text-sm">{item.explanation}</td>
                                    </tr>
                                ))}
                                {/* Risks Not Applicable */}
                                {[
                                    { risk: "MEV / Front-Running", status: "n/a", explanation: "Pyth oracle pricing = no price impact" },
                                    { risk: "Sandwich Attacks", status: "n/a", explanation: "No AMM pool to manipulate" },
                                    { risk: "Impermanent Loss", status: "n/a", explanation: "Not an LP, leverage trading only" },
                                ].map((item, i) => (
                                    <tr key={i} className="bg-gray-500/5">
                                        <td className="p-4 text-white font-medium">{item.risk}</td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-medium">
                                                <X className="w-3 h-3" />
                                                N/A
                                            </span>
                                        </td>
                                        <td className="p-4 text-secondary text-sm">{item.explanation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </section>

                {/* Section 4: View Keys */}
                <section className="mb-24 max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">Selective Disclosure</h2>
                            <p className="text-secondary text-lg leading-relaxed mb-6">
                                Real privacy isn't about hiding from everyone. It's about <strong className="text-white">control</strong>.
                                <br /><br />
                                View Keys let you share specific data with auditors, regulators, or lenders—without exposing anything to the market.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
                                    <EyeOff className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium text-white">Market: Blind</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
                                    <Eye className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm font-medium text-white">Auditor: Visible</span>
                                </div>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-surface border border-accent/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <Fingerprint className="w-6 h-6 text-accent" />
                                How View Keys Work
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-white/5">
                                    <div className="text-2xl">🔑</div>
                                    <div>
                                        <h4 className="font-bold text-white">Master Key</h4>
                                        <p className="text-sm text-secondary">Only your wallet decrypts your data.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-white/5">
                                    <div className="text-2xl">👀</div>
                                    <div>
                                        <h4 className="font-bold text-white">View Key</h4>
                                        <p className="text-sm text-secondary">Time-limited read-only access for compliance.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

            </div>

            <Footer />
        </main>
    );
}
