export default function Background() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* 1. Atmospheric Glows (Metallic/Vibrant) - Fixed position */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#3b82f6] rounded-full opacity-30 dark:opacity-50 blur-[100px] mix-blend-multiply dark:mix-blend-normal" />
            <div className="absolute top-[0%] left-1/3 w-[800px] h-[500px] bg-purple-600 rounded-full opacity-20 dark:opacity-30 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
            <div className="absolute top-[10%] left-2/3 w-[600px] h-[400px] bg-accent rounded-full opacity-10 dark:opacity-20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />

            {/* 2. Grid (Subtle) - Fixed position */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        </div>
    );
}
