"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Matrix green color
const MATRIX_GREEN = "#00FF41";
const MATRIX_GREEN_DIM = "#00CC33";

// Falling matrix characters
function MatrixColumn({ x, delay, speed }: { x: number; delay: number; speed: number }) {
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF$€£¥₿<>{}[]";
    const columnChars = Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]);

    return (
        <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "100vh" }}
            transition={{
                duration: speed,
                delay,
                repeat: Infinity,
                ease: "linear",
            }}
            className="absolute text-xs font-mono select-none pointer-events-none flex flex-col"
            style={{ left: `${x}%` }}
        >
            {columnChars.map((char, i) => (
                <span
                    key={i}
                    className="leading-tight"
                    style={{
                        color: i === 0 ? "#FFFFFF" : MATRIX_GREEN,
                        opacity: i === 0 ? 1 : 0.3 + (i / columnChars.length) * 0.4,
                        textShadow: i === 0 ? `0 0 10px ${MATRIX_GREEN}, 0 0 20px ${MATRIX_GREEN}` : `0 0 5px ${MATRIX_GREEN}`,
                    }}
                >
                    {char}
                </span>
            ))}
        </motion.div>
    );
}

// Floating hex codes
function HexCode({ x, y, delay }: { x: number; y: number; delay: number }) {
    const hex = Array.from({ length: 8 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");

    return (
        <motion.div
            initial={{ opacity: 0, y: y }}
            animate={{
                opacity: [0, 0.8, 0.8, 0],
                y: [y, y - 100],
            }}
            transition={{
                duration: 8,
                delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 10,
            }}
            className="absolute text-sm font-mono select-none pointer-events-none"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                color: MATRIX_GREEN,
                textShadow: `0 0 10px ${MATRIX_GREEN}`,
            }}
        >
            0x{hex}
        </motion.div>
    );
}

// Glowing lock icon
function GlowingLock({ x, y, delay }: { x: number; y: number; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: [0, 0.5, 0.5, 0],
                scale: [0.5, 1, 1, 0.5],
                y: [y, y - 50],
            }}
            transition={{
                duration: 10,
                delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 8,
            }}
            className="absolute select-none pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={MATRIX_GREEN}
                strokeWidth="1.5"
                style={{ filter: `drop-shadow(0 0 8px ${MATRIX_GREEN})` }}
            >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        </motion.div>
    );
}

export default function EncryptedBackground() {
    const [columns, setColumns] = useState<Array<{ id: number; x: number; delay: number; speed: number }>>([]);
    const [hexCodes, setHexCodes] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
    const [locks, setLocks] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

    useEffect(() => {
        // Generate matrix columns
        const newColumns = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 10,
            speed: 8 + Math.random() * 12,
        }));
        setColumns(newColumns);

        // Generate hex codes
        const newHexCodes = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: 20 + Math.random() * 60,
            delay: Math.random() * 15,
        }));
        setHexCodes(newHexCodes);

        // Generate locks
        const newLocks = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: 20 + Math.random() * 60,
            delay: Math.random() * 12,
        }));
        setLocks(newLocks);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Pure black base */}
            <div className="absolute inset-0 bg-black" />

            {/* Matrix green glow orbs */}
            <motion.div
                animate={{ opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full blur-[200px]"
                style={{ backgroundColor: MATRIX_GREEN, opacity: 0.15 }}
            />
            <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, delay: 2 }}
                className="absolute top-[50%] right-[5%] w-[500px] h-[500px] rounded-full blur-[180px]"
                style={{ backgroundColor: MATRIX_GREEN, opacity: 0.1 }}
            />
            <motion.div
                animate={{ opacity: [0.08, 0.15, 0.08] }}
                transition={{ duration: 10, repeat: Infinity, delay: 4 }}
                className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full blur-[150px]"
                style={{ backgroundColor: MATRIX_GREEN, opacity: 0.08 }}
            />

            {/* Green grid lines */}
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${MATRIX_GREEN} 1px, transparent 1px),
                        linear-gradient(to bottom, ${MATRIX_GREEN} 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Falling matrix columns */}
            {columns.map((col) => (
                <MatrixColumn key={col.id} x={col.x} delay={col.delay} speed={col.speed} />
            ))}

            {/* Floating hex codes */}
            {hexCodes.map((hex) => (
                <HexCode key={hex.id} x={hex.x} y={hex.y} delay={hex.delay} />
            ))}

            {/* Glowing locks */}
            {locks.map((lock) => (
                <GlowingLock key={lock.id} x={lock.x} y={lock.y} delay={lock.delay} />
            ))}

            {/* Scanlines */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.1) 2px, rgba(0,255,65,0.1) 4px)",
                }}
            />

            {/* CRT screen curve effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

            {/* Top edge glow */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                    background: `linear-gradient(to right, transparent, ${MATRIX_GREEN}80, transparent)`,
                }}
            />

            {/* Bottom edge glow */}
            <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                    background: `linear-gradient(to right, transparent, ${MATRIX_GREEN}40, transparent)`,
                }}
            />
        </div>
    );
}
