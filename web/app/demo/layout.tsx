"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Wallet,
    Home,
    Gift,
    TrendingUp,
    ShoppingBag,
    Users,
    Coins,
    User,
    Menu,
    X,
    Vault,
    RefreshCw,
    ArrowDownUp,
    Lock
} from "lucide-react";
import { useState, Suspense } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ComingSoonProvider } from "@/components/ComingSoonModal";

const navItems = [
    { href: "/demo", label: "Dashboard", icon: Home },
    { href: "/demo/bootstrap", label: "Bootstrap", icon: Gift, badge: "Demo" },
    { href: "/demo/trade", label: "Trade", icon: TrendingUp },
    { href: "/demo/vaults", label: "Vaults", icon: Vault },
    { href: "/demo/arb", label: "Arb", icon: RefreshCw },
    { href: "/demo/lend", label: "Lend", icon: Coins },
    { href: "/demo/swap", label: "Swap OTUS", icon: ArrowDownUp },
    { href: "/demo/stake", label: "Stake OTUS", icon: Lock },
    { href: "/demo/credits", label: "Credits", icon: Gift },
    { href: "/demo/marketplace", label: "Shop", icon: ShoppingBag },
    { href: "/demo/leaderboard", label: "Leaders", icon: Users },
    { href: "/demo/profile", label: "Profile", icon: User },
];

function DemoLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isDemo = true; // Always demo in this route

    return (
        <div className="min-h-screen bg-background text-primary">
            {/* Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-secondary hover:text-primary"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden">
                                <img src="/logos/OtusFX.png" alt="OtusFX" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-lg font-bold text-primary hidden sm:block">OtusFX</span>
                        </Link>

                        {isDemo && (
                            <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                                Demo Mode
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Credit Balance */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border">
                            <ThemeToggle />
                            <Coins className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium text-primary">12,450</span>
                            <span className="text-xs text-secondary">credits</span>
                        </div>



                        {/* Connect Wallet Button */}
                        <WalletMultiButton className="!bg-accent hover:!bg-accent-hover !text-white !font-medium !rounded-full !transition-all !h-10 !px-5" />
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-background border-r border-border z-40 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-accent/10 text-accent border border-accent/20'
                                    : 'text-secondary hover:text-primary hover:bg-surface'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Back to Home */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:pl-64 pt-16 min-h-screen">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
    return (
        <ComingSoonProvider>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <DemoLayoutContent>{children}</DemoLayoutContent>
            </Suspense>
        </ComingSoonProvider>
    );
}
