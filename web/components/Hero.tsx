"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Lock, Users } from "lucide-react";
import { useState } from "react";
import PartnerLogos from "./PartnerLogos";

export default function Hero() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'landing' }),
            });
            if (res.ok) {
                setSubmitted(true);
            }
        } catch (err) {
            console.error('Waitlist error:', err);
        }
        setLoading(false);
    };

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden z-10 pt-20">

            <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center text-center">

                {/* Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs font-medium text-secondary mb-8 hover:border-white/20 transition-colors cursor-default"
                >
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="uppercase tracking-wider">Confidential Liquidity Venue on Solana</span>
                </motion.div>

                {/* Metallic Heading */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gradient-metallic max-w-5xl leading-[1.1]"
                >
                    Trade in the Dark. <br />
                    <span className="text-primary">Win in the Light.</span>
                </motion.h1>

                {/* Subtitle - Institutional Focused */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8 text-xl text-secondary max-w-2xl leading-relaxed font-light"
                >
                    The first <span className="text-primary font-medium">encrypted dark pool</span> for institutional FX trading.
                    <br className="hidden md:block" /> MPC execution. Selective disclosure. Zero front-running.
                </motion.p>

                {/* Value Props */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-secondary"
                >
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-accent" />
                        <span>Encrypted Orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        <span>Dynamic Leverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>Neutral Venue</span>
                    </div>
                </motion.div>

                {/* Waitlist Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 w-full max-w-md"
                >
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email for beta access"
                                className="flex-1 px-5 py-4 bg-surface border border-border rounded-full text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative px-8 py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,102,26,0.5)] disabled:opacity-50"
                            >
                                {loading ? "..." : "Join Waitlist"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    ) : (
                        <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-medium">
                            ✓ You're on the list! We'll be in touch.
                        </div>
                    )}

                    {/* Social Proof */}
                    <p className="mt-4 text-xs text-secondary/60">
                        Join <span className="text-accent font-medium">150+</span> prop traders on the waitlist
                    </p>
                </motion.div>

                {/* Secondary CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-6 flex gap-4 text-sm"
                >
                    <a href="/demo" className="text-secondary hover:text-primary transition-colors underline underline-offset-4">
                        Try Demo App →
                    </a>
                    <a href="/docs" className="text-secondary hover:text-primary transition-colors underline underline-offset-4">
                        Read Docs
                    </a>
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
        </section>
    );
}
