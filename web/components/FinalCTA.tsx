"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function FinalCTA() {
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
                body: JSON.stringify({ email, source: 'footer-cta' }),
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
        <section className="py-24 container mx-auto px-6 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Trade Privately?
                </h2>
                <p className="text-xl text-secondary mb-10">
                    Join the waitlist for early access to institutional-grade confidential trading.
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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
                            className="group px-8 py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,102,26,0.5)] disabled:opacity-50"
                        >
                            {loading ? "..." : "Join Waitlist"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                ) : (
                    <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-medium inline-block">
                        ✓ You're on the list! We'll be in touch.
                    </div>
                )}

                <p className="mt-6 text-sm text-secondary/60">
                    No spam. Just updates on launch and early access.
                </p>
            </motion.div>
        </section>
    );
}
