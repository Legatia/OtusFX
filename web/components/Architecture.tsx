"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, Cpu, ArrowRight } from "lucide-react";

const steps = [
    {
        id: "01",
        title: "Confidential Execution",
        description: "Positions are encrypted using Arcium C-SPL. Your trade size, direction, and leverage remain private on-chain.",
        icon: Lock,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
    },
    {
        id: "02",
        title: "Pyth Oracle Feeds",
        description: "Real-time FX prices from Pyth Network with sub-second updates. Trusted by billions in DeFi volume.",
        icon: ShieldCheck,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
    },
    {
        id: "03",
        title: "Private Settlement",
        description: "Trades settle on Solana in milliseconds. Encrypted positions ensure only you know your PnL.",
        icon: Cpu,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
    },
];

export default function Architecture() {
    return (
        <section className="py-32 container mx-auto px-6 relative z-10">
            <div className="mb-24 md:text-center max-w-3xl mx-auto">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-accent font-mono text-sm tracking-wider uppercase mb-4 block"
                >
                    Protocol Architecture
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-6"
                >
                    Institutional-Grade <br />
                    <span className="text-secondary">Infrastructure.</span>
                </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />

                {steps.map((step, i) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="relative z-10 group"
                    >
                        {/* Step Number Badge */}
                        <div className={`w-24 h-24 mx-auto mb-8 rounded-2xl ${step.bg} ${step.border} border flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <step.icon className={`w-10 h-10 ${step.color}`} />

                            {/* Connecting Arrow for mobile mostly, or decoration */}
                            {i !== steps.length - 1 && (
                                <div className="md:hidden absolute -bottom-10 left-1/2 -translate-x-1/2 text-secondary/20">
                                    <ArrowRight className="w-6 h-6 rotate-90" />
                                </div>
                            )}
                        </div>

                        <div className="text-center px-4">
                            <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-secondary mb-4">
                                STEP {step.id}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-secondary text-sm leading-relaxed">{step.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
