"use client";

import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, CircleDollarSign } from "lucide-react";
import clsx from "clsx";

const features = [
    {
        title: "Confidential Trading",
        description: "Hide position sizes, entry prices, and liquidation levels. No front-running, no stop hunting.",
        icon: EyeOff,
    },
    {
        title: "Private Lending Pool",
        description: "Borrow USDC for leverage with encrypted balances. Powered by Arcium C-SPL confidential tokens.",
        icon: Lock,
    },
    {
        title: "MEV Protection",
        description: "Dark pool execution with batch auctions. Your trades settle at fair prices, not MEV-extracted prices.",
        icon: Shield,
    },
    {
        title: "Major FX Pairs",
        description: "Trade EUR/USD, GBP/USD, USD/JPY and cross pairs with up to 25x leverage. Powered by Pyth oracles.",
        icon: CircleDollarSign,
    },
];

export default function Features() {
    return (
        <section className="py-32 container mx-auto px-4 md:px-6 relative z-10">
            <div className="mb-20 text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">Built for Privacy</h2>
                <p className="text-secondary text-xl font-light">
                    Trade confidently with encrypted positions and MEV-protected execution.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={clsx(
                            "p-8 rounded-[32px] flex flex-col gap-6 group transition-all h-full",
                            "bg-surface border border-border hover:border-primary/10",
                        )}
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center border border-border group-hover:border-accent/50 transition-colors shrink-0">
                            <feature.icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                            <p className="text-secondary leading-relaxed font-light">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
