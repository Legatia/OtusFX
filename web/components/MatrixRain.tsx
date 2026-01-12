"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas to full window size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Matrix characters
        const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789$€£¥₿";
        const charArray = chars.split("");

        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = [];

        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        const draw = () => {
            // Calculate side zones (left 18% and right 18%)
            const leftZone = canvas.width * 0.18;
            const rightZone = canvas.width * 0.82;

            // Clear ONLY the side zones (not the center)
            ctx.clearRect(0, 0, leftZone, canvas.height);
            ctx.clearRect(rightZone, 0, canvas.width - rightZone, canvas.height);

            // Add fade effect only to side zones
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, leftZone, canvas.height);
            ctx.fillRect(rightZone, 0, canvas.width - rightZone, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const x = i * fontSize;

                // Only draw in side zones
                if (x > leftZone && x < rightZone) {
                    drops[i]++;
                    continue;
                }

                const char = charArray[Math.floor(Math.random() * charArray.length)];
                const y = drops[i] * fontSize;

                // Brighter green for visibility
                const opacity = 0.4 + Math.random() * 0.5;
                ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
                ctx.fillText(char, x, y);

                // Reset drop
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
