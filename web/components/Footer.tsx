export default function Footer() {
    return (
        <footer className="border-t border-border bg-background py-20">
            <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
                            SX
                        </div>
                        <span className="font-bold text-white tracking-tight text-xl">SynFX</span>
                    </div>
                    <p className="text-secondary text-sm">
                        The FX Layer for DeFi.
                    </p>
                </div>

                <div className="flex gap-10 text-sm font-medium text-secondary">
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">Discord</a>
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                </div>

                <div className="text-xs text-secondary/50">
                    © 2026 SynFX Protocol.
                </div>
            </div>
        </footer>
    );
}
