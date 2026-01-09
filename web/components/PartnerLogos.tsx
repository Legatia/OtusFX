import Image from "next/image";

export default function PartnerLogos() {
    return (
        <div className="mt-20 w-full max-w-5xl mx-auto px-6">
            <p className="text-center text-sm font-medium text-secondary/60 uppercase tracking-widest mb-8">
                Powered By Industry Leaders
            </p>

            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 transition-all duration-500">
                {/* Solana */}
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                        <Image
                            src="/logos/solana.png"
                            alt="Solana"
                            fill
                            className="object-contain" // The provided image is just the mark
                        />
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-white tracking-tight">Solana</span>
                </div>

                {/* Pyth */}
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                        <Image
                            src="/logos/pyth.png"
                            alt="Pyth Network"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-white tracking-tight">Pyth Network</span>
                </div>

                {/* Arcium */}
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                        <Image
                            src="/logos/Arcium_logo.svg"
                            alt="Arcium"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="relative h-6 md:h-8 w-16 md:w-20">
                        <Image
                            src="/logos/Arcium_text.svg"
                            alt="Arcium"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Helius */}
                <div className="flex items-center gap-3">
                    <div className="relative h-8 md:h-10 w-24 md:w-32">
                        <Image
                            src="/logos/Helius-Horizontal-Logo.svg"
                            alt="Helius"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Inco */}
                <div className="flex items-center gap-3">
                    <div className="relative h-8 md:h-10 w-20 md:w-24">
                        <Image
                            src="/logos/inco.svg"
                            alt="Inco"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
