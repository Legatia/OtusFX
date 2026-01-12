"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
    Vault,
    Lock,
    TrendingUp,
    Users,
    Eye,
    EyeOff,
    ArrowUpRight,
    Shield,
    Percent,
    Clock
} from "lucide-react";

// Mock vault data
const vaults = [
    {
        id: 1,
        name: "EUR/PLN Macro Strategy",
        trader: "Trader #4521",
        isPrivate: true,
        returns30d: 12.4,
        returns7d: 3.2,
        aum: 234500,
        capacity: 500000,
        depositors: 47,
        sharpe: 2.1,
        maxDrawdown: -4.2,
        winRate: 71,
        managementFee: 2,
        performanceFee: 20,
        lockPeriod: 7,
        traderStake: 15000,
        age: 127,
    },
    {
        id: 2,
        name: "Multi-Currency Momentum",
        trader: "Trader #8923",
        isPrivate: true,
        returns30d: 8.7,
        returns7d: 1.5,
        aum: 89200,
        capacity: 200000,
        depositors: 23,
        sharpe: 1.6,
        maxDrawdown: -6.1,
        winRate: 58,
        managementFee: 1.5,
        performanceFee: 15,
        lockPeriod: 3,
        traderStake: 8000,
        age: 45,
    },
    {
        id: 3,
        name: "Conservative FX Yield",
        trader: "Trader #2156",
        isPrivate: true,
        returns30d: 4.2,
        returns7d: 0.9,
        aum: 456000,
        capacity: 1000000,
        depositors: 89,
        sharpe: 2.8,
        maxDrawdown: -1.8,
        winRate: 82,
        managementFee: 1,
        performanceFee: 10,
        lockPeriod: 14,
        traderStake: 50000,
        age: 234,
    },
];

const userDeposits = [
    { vaultId: 1, vaultName: "EUR/PLN Macro Strategy", deposited: 5000, currentValue: 5620, pnl: 12.4 },
];

export default function VaultsPage() {
    const [selectedVault, setSelectedVault] = useState<typeof vaults[0] | null>(null);
    const [depositAmount, setDepositAmount] = useState("");

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-primary">Strategy Vaults</h1>
                    <p className="text-secondary">Copy top traders with encrypted positions</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">All Positions Private</span>
                </div>
            </motion.div>

            {/* Your Deposits */}
            {userDeposits.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-surface to-blue-500/10 border border-emerald-500/20"
                >
                    <h2 className="text-lg font-semibold text-primary mb-4">Your Vault Deposits</h2>
                    <div className="space-y-3">
                        {userDeposits.map((deposit) => (
                            <div
                                key={deposit.vaultId}
                                className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Vault className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-primary">{deposit.vaultName}</div>
                                        <div className="text-xs text-secondary">
                                            Deposited: ${deposit.deposited.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-primary">
                                        ${deposit.currentValue.toLocaleString()}
                                    </div>
                                    <div className={`text-sm ${deposit.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {deposit.pnl >= 0 ? '+' : ''}{deposit.pnl}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Vault List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-primary">Browse Vaults</h2>
                    <div className="text-secondary text-sm">{vaults.length} vaults available</div>
                </div>

                <div className="grid gap-4">
                    {vaults.map((vault, index) => (
                        <motion.div
                            key={vault.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-6 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all cursor-pointer"
                            onClick={() => setSelectedVault(vault)}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Vault Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Vault className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-primary">{vault.name}</h3>
                                            {vault.isPrivate && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
                                                    <Lock className="w-3 h-3" />
                                                    Private
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-secondary mb-2">
                                            by {vault.trader} • {vault.age} days active
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-secondary">
                                                <Users className="w-4 h-4" />
                                                {vault.depositors} depositors
                                            </div>
                                            <div className="flex items-center gap-1 text-secondary">
                                                <Shield className="w-4 h-4" />
                                                {vault.managementFee}% + {vault.performanceFee}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className={`text-xl font-bold ${vault.returns30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {vault.returns30d >= 0 ? '+' : ''}{vault.returns30d}%
                                        </div>
                                        <div className="text-xs text-secondary">30d Return</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-primary">
                                            ${(vault.aum / 1000).toFixed(0)}K
                                        </div>
                                        <div className="text-xs text-secondary">AUM</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-primary">{vault.sharpe}</div>
                                        <div className="text-xs text-secondary">Sharpe</div>
                                    </div>
                                    <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-all flex items-center gap-2">
                                        Deposit
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Privacy Note */}
                            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-secondary">
                                <EyeOff className="w-4 h-4" />
                                <span>Positions encrypted via Arcium • You see NAV and returns, not individual trades</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Vault Detail Modal */}
            {selectedVault && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVault(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-xl p-6 rounded-2xl bg-surface border border-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary">{selectedVault.name}</h2>
                            <button onClick={() => setSelectedVault(null)} className="text-secondary hover:text-primary">×</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-background">
                                <div className="text-secondary text-sm mb-1">30d Return</div>
                                <div className={`text-2xl font-bold ${selectedVault.returns30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {selectedVault.returns30d >= 0 ? '+' : ''}{selectedVault.returns30d}%
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background">
                                <div className="text-secondary text-sm mb-1">Max Drawdown</div>
                                <div className="text-2xl font-bold text-red-400">{selectedVault.maxDrawdown}%</div>
                            </div>
                            <div className="p-4 rounded-xl bg-background">
                                <div className="text-secondary text-sm mb-1">Win Rate</div>
                                <div className="text-2xl font-bold text-primary">{selectedVault.winRate}%</div>
                            </div>
                            <div className="p-4 rounded-xl bg-background">
                                <div className="text-secondary text-sm mb-1">Trader Stake</div>
                                <div className="text-2xl font-bold text-primary">${(selectedVault.traderStake / 1000).toFixed(0)}K</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-6">
                            <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
                                <Lock className="w-4 h-4" />
                                <span className="font-medium">Privacy Protected</span>
                            </div>
                            <p className="text-secondary text-sm">
                                This vault's positions are encrypted. You will see NAV changes and % returns,
                                but never individual trades, entry prices, or the trader's strategy.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-secondary text-sm">Deposit Amount</label>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="1,000"
                                        className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-primary"
                                    />
                                    <span className="text-secondary">USDC</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-secondary">
                                <span>Lock Period</span>
                                <span className="text-primary">{selectedVault.lockPeriod} days</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-secondary">
                                <span>Management Fee</span>
                                <span className="text-primary">{selectedVault.managementFee}% annually</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-secondary">
                                <span>Performance Fee</span>
                                <span className="text-primary">{selectedVault.performanceFee}% of profits</span>
                            </div>

                            <button className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all">
                                Deposit to Vault
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
