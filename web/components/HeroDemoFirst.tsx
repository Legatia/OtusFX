"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import FeatureCarousel from "@/components/FeatureCarousel";

export default function HeroDemoFirst() {
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
                body: JSON.stringify({ email, source: 'landing-demo' }),
            });
            if (res.ok) setSubmitted(true);
        } catch (err) {
            console.error('Waitlist error:', err);
        }
        setLoading(false);
    };

    return (
        <section className="relative min-h-screen flex items-center py-20 px-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />

            <div className="container relative z-10 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Copy */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent mb-6"
                        >
                            <Lock className="w-3 h-3" />
                            Live Preview
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight"
                        >
                            See Your Orders<br />
                            <span className="text-accent">Stay Invisible</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-secondary mb-8 max-w-md"
                        >
                            OtusFX encrypts your order size, entry price, and strategy.
                            Only you see your positions. Everyone else sees noise.
                        </motion.p>

                        {/* Waitlist */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl flex items-center gap-2"
                                    >
                                        {loading ? "..." : "Join Waitlist"}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            ) : (
                                <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 max-w-md">
                                    You're on the list!
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 flex gap-4 text-sm"
                        >
                            <a href="/demo" className="text-accent hover:underline flex items-center gap-1">
                                Try Full Demo <ArrowRight className="w-3 h-3" />
                            </a>
                        </motion.div>
                    </div>

                    {/* Right: Feature Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <FeatureCarousel />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
