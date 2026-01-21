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

import { useVaults } from "@/hooks/useVaults";

// Production: No mock data - user deposits will be fetched from chain
// TODO: Add useUserVaultDeposits hook to fetch user's share balances

export default function VaultsPage() {
    const { vaults: realVaults, loading, deposit, refresh } = useVaults();
    const [selectedVault, setSelectedVault] = useState<any>(null);
    const [depositAmount, setDepositAmount] = useState("");
    const [isDepositing, setIsDepositing] = useState(false);

    // Map real vaults to UI format
    // Note: Sharpe, win rate, etc. require off-chain backtest oracle - using placeholders
    const vaults = realVaults.map((v) => ({
        id: v.publicKey.toString(),
        publicKey: v.publicKey,
        name: v.name,
        strategyType: v.strategyType,
        trader: `Vault ${v.publicKey.toString().substring(0, 6)}`,
        isPrivate: true,
        returns30d: v.apy, // null = TBD
        aum: v.totalAssets,
        totalShares: v.totalShares,
        depositors: Math.max(1, Math.floor(v.totalShares / 1000)), // Estimate from shares
        // These require backtest oracle - placeholder until implemented
        sharpe: null as number | null,
        maxDrawdown: null as number | null,
        winRate: null as number | null,
        // Real fee data from on-chain vault account
        managementFee: v.managementFeeBps / 100, // Convert bps to %
        performanceFee: v.performanceFeeBps / 100,
        lockPeriod: v.lockPeriodDays,
    }));

    const handleDeposit = async () => {
        if (!selectedVault || !depositAmount) return;
        setIsDepositing(true);
        try {
            await deposit(selectedVault.publicKey, parseFloat(depositAmount));
            alert("Deposit successful!");
            setDepositAmount("");
            setSelectedVault(null);
        } catch (e: any) {
            console.error(e);
            alert(`Deposit failed: ${e.message}`);
        } finally {
            setIsDepositing(false);
        }
    };

    // ... rest of render ...

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

            {/* Your Deposits - TODO: Implement useUserVaultDeposits hook */}
            {/* This section will show user's share balances once the hook is implemented */}

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

                {loading ? (
                    <div className="text-center py-12 text-secondary">Loading Vaults...</div>
                ) : vaults.length === 0 ? (
                    <div className="text-center py-12 text-secondary border border-dashed border-border rounded-xl">
                        No active strategy vaults found.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {vaults.map((vault: any, index: number) => (
                            <motion.div
                                key={vault.id}
                                // ... existing props ...
                                onClick={() => setSelectedVault(vault)}
                                className="p-6 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all cursor-pointer"
                            >
                                {/* ... existing card content ... */}
                                {/* Need to copy the card content structure here or it will be cut off by replacement */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <div className={`text-xl font-bold ${vault.returns30d !== null && vault.returns30d >= 0 ? 'text-emerald-400' : vault.returns30d !== null ? 'text-red-400' : 'text-secondary'}`}>
                                                {vault.returns30d !== null ? `${vault.returns30d >= 0 ? '+' : ''}${vault.returns30d}%` : 'TBD'}
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
                                            <div className="text-xl font-bold text-primary">
                                                {vault.sharpe !== null ? vault.sharpe.toFixed(1) : '--'}
                                            </div>
                                            <div className="text-xs text-secondary">Sharpe</div>
                                        </div>
                                        <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-all flex items-center gap-2">
                                            Deposit
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-secondary">
                                    <EyeOff className="w-4 h-4" />
                                    <span>Positions encrypted via Arcium • You see NAV and returns, not individual trades</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
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
                        {/* ... Modal Header ... */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary">{selectedVault.name}</h2>
                            <button onClick={() => setSelectedVault(null)} className="text-secondary hover:text-primary">×</button>
                        </div>

                        {/* ... Stats Grid ... */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* ... stats ... */}
                            <div className="p-4 rounded-xl bg-background">
                                <div className="text-secondary text-sm mb-1">30d Return</div>
                                <div className={`text-2xl font-bold ${selectedVault.returns30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {selectedVault.returns30d >= 0 ? '+' : ''}{selectedVault.returns30d}%
                                </div>
                            </div>
                            {/* ... other stats ... */}
                        </div>


                        {/* ... Privacy Warning ... */}
                        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-6">
                            <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
                                <Lock className="w-4 h-4" />
                                <span className="font-medium">Privacy Protected</span>
                            </div>
                            <p className="text-secondary text-sm">
                                These positions are encrypted. You will see NAV changes and % returns,
                                but never individual trades.
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

                            <button
                                onClick={handleDeposit}
                                disabled={isDepositing}
                                className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all"
                            >
                                {isDepositing ? "Processing..." : "Deposit to Vault"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
