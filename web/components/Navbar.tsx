"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SX</span>
                    </div>
                    <span className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                        SynFX
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="#features"
                        className="text-secondary hover:text-white transition-colors text-sm font-medium"
                    >
                        Features
                    </Link>
                    <Link
                        href="#architecture"
                        className="text-secondary hover:text-white transition-colors text-sm font-medium"
                    >
                        How It Works
                    </Link>
                    <Link
                        href="#treasury"
                        className="text-secondary hover:text-white transition-colors text-sm font-medium"
                    >
                        Treasury
                    </Link>
                    <a
                        href="https://docs.synfx.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-white transition-colors text-sm font-medium"
                    >
                        Docs
                    </a>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/app?demo=true"
                        className="px-5 py-2.5 bg-surface hover:bg-surface-hover border border-border text-white font-medium rounded-full transition-all text-sm"
                    >
                        Demo
                    </Link>
                    <Link
                        href="/app"
                        className="group flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all shadow-[0_0_20px_-5px_rgba(255,102,26,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,102,26,0.6)]"
                    >
                        <span className="text-sm">Launch App</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Glassmorphism backdrop */}
            <div className="absolute inset-0 -z-10 bg-background/60 backdrop-blur-xl border-b border-white/5" />
        </motion.nav>
    );
}
