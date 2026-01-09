"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import PartnerLogos from "./PartnerLogos";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden z-10">

            <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center text-center">

                {/* Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs font-medium text-secondary mb-8 hover:border-white/20 transition-colors cursor-default"
                >
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="uppercase tracking-wider">Private Trading on Solana</span>
                </motion.div>

                {/* Metallic Heading */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gradient-metallic max-w-5xl leading-[1.1]"
                >
                    The FX Layer <br />
                    <span className="text-white">for DeFi.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8 text-xl text-secondary max-w-2xl leading-relaxed font-light"
                >
                    Trade real-world currencies with <span className="text-white font-medium">25x leverage</span>.
                    <br className="hidden md:block" /> Seamless execution on the world's fastest chains.
                </motion.p>

                {/* Buttons (Pill Shaped) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
                >
                    <button className="group relative px-8 py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,102,26,0.5)]">
                        Join Waitlist
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="px-8 py-4 bg-surface text-gray-300 font-medium rounded-full border border-border hover:bg-surface-hover hover:text-white transition-all">
                        Read Documentation
                    </button>
                </motion.div>

                {/* Powered By Logos */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <PartnerLogos />
                </motion.div>
            </div>

            {/* Bottom Interface Mockup Placeholder/Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-20" />
        </section>
    );
}
