"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature?: string;
}

export function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: `modal-${feature || 'general'}` }),
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Waitlist error:', err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md bg-background border border-border rounded-3xl p-8 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-secondary hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                                <Clock className="w-8 h-8 text-accent" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">
                                Coming Soon
                            </h3>

                            {feature && (
                                <p className="text-accent font-medium mb-4">
                                    {feature}
                                </p>
                            )}

                            <p className="text-secondary mb-6">
                                This feature is currently in development. Join our waitlist to get notified when it's ready.
                            </p>

                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full px-5 py-3 bg-surface border border-border rounded-full text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2"
                                    >
                                        Notify Me
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            ) : (
                                <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-medium">
                                    ✓ We'll notify you when it's ready!
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="mt-4 text-sm text-secondary hover:text-white transition-colors"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook to easily use the modal
import { createContext, useContext, ReactNode } from "react";

interface ComingSoonContextType {
    showComingSoon: (feature?: string) => void;
}

const ComingSoonContext = createContext<ComingSoonContextType>({ showComingSoon: () => { } });

export function ComingSoonProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [feature, setFeature] = useState<string | undefined>();

    const showComingSoon = (feat?: string) => {
        setFeature(feat);
        setIsOpen(true);
    };

    return (
        <ComingSoonContext.Provider value={{ showComingSoon }}>
            {children}
            <ComingSoonModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                feature={feature}
            />
        </ComingSoonContext.Provider>
    );
}

export function useComingSoon() {
    return useContext(ComingSoonContext);
}
