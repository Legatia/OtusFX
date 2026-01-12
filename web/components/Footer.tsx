export default function Footer() {
    return (
        <footer className="relative z-50 py-16">
            <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center text-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img src="/logos/OtusFX.png" alt="OtusFX" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-white tracking-tight text-xl">OtusFX</span>
                </div>
                <p className="text-secondary text-sm">
                    Trade in the shadows. Profit in private.
                </p>

                <div className="flex gap-8 text-sm font-medium text-secondary">
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">Discord</a>
                    <a href="#" className="hover:text-white transition-colors">Docs</a>
                </div>

                <div className="text-xs text-secondary/50">
                    © 2026 OtusFX Protocol. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
