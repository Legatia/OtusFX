"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
    { href: "#privacy", label: "Privacy" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#deleverage", label: "Protection" },
    { href: "#otus", label: "$OTUS" },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-50 px-4 py-4 bg-background/80 backdrop-blur-md border-b border-border/50"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/logos/OtusFX.png"
                                alt="OtusFX"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
                            OtusFX
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-secondary hover:text-white transition-colors text-sm font-medium"
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            href="https://github.com/Legatia/OtusFX/tree/landing/demo-first/OtusFX_docs"
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
                            href="/demo"
                            className="group flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all shadow-[0_0_20px_-5px_rgba(255,102,26,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,102,26,0.6)]"
                        >
                            <span className="text-sm">Demo</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-secondary hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 md:hidden"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-border p-6 pt-20"
                        >
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-lg text-secondary hover:text-white transition-colors py-2"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    href="https://github.com/Legatia/OtusFX/tree/landing/demo-first/OtusFX_docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg text-secondary hover:text-white transition-colors py-2"
                                >
                                    Docs
                                </a>
                                <hr className="border-border my-2" />
                                <Link
                                    href="/demo"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg text-secondary hover:text-white transition-colors py-2"
                                >
                                    Try Demo
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
