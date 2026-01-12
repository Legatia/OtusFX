"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, PerspectiveCamera, Environment, Cylinder } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Coin({ symbol, position, rotation, color }: { symbol: string, position: [number, number, number], rotation: [number, number, number], color: string }) {
    return (
        <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1}>
            <group position={position} rotation={rotation}>

                {/* Coin Body - Simple, Clean, Highy Polished */}
                <Cylinder args={[0.9, 0.9, 0.1, 64]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshPhysicalMaterial
                        color={color}
                        metalness={1}
                        roughness={0.15}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                    />
                </Cylinder>

                {/* The Symbol (Floating slightly in front) */}
                <Text
                    fontSize={0.8}
                    position={[0, 0, 0.08]}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {symbol}
                </Text>

                {/* The Symbol (Back) */}
                <Text
                    fontSize={0.8}
                    position={[0, 0, -0.08]}
                    rotation={[0, Math.PI, 0]}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {symbol}
                </Text>
            </group>
        </Float>
    );
}

function PrivacyElements() {
    // Generate subtle privacy hashes - Tighter spread
    const privacyItems = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 20; // Reduced from 30
            const y = (Math.random() - 0.5) * 15; // Reduced from 20
            const z = (Math.random() - 0.5) * 8 - 4;
            const hash = "0x" + Math.random().toString(16).substr(2, 8) + "...";
            temp.push({ x, y, z, hash });
        }
        return temp;
    }, []);

    return (
        <group>
            {privacyItems.map((item, i) => (
                <Float key={i} speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Text
                        fontSize={0.3}
                        position={[item.x, item.y, item.z]}
                        color="#71717a" // Subtle Gray
                        fillOpacity={0.15} // Very faint
                        rotation={[0, 0, Math.random() * 0.2 - 0.1]} // Slight tilt
                    >
                        {item.hash}
                    </Text>
                </Float>
            ))}
            {/* Locks - Tighter positions */}
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5} position={[-5, 4, -5]}>
                <Text fontSize={1.2} color="#10b981" fillOpacity={0.1}>🔒</Text>
            </Float>
            <Float speed={0.8} rotationIntensity={0.5} floatIntensity={0.5} position={[5, -3, -6]}>
                <Text fontSize={1.2} color="#10b981" fillOpacity={0.1}>🔒</Text>
            </Float>
        </group>
    );
}

function FloatingCurrencies() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Slow orbital rotation
            groupRef.current.rotation.z += delta * 0.05;
            // Gentle wobble on other axes
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Major Currencies - Tighter coordinates (Radius ~4-5) */}

            {/* Gold ($) - Top Left */}
            <Coin symbol="$" position={[-3.5, 2.5, -1]} rotation={[0, 0.3, 0.1]} color="#FFD700" />

            {/* Silver (€) - Bottom Right */}
            <Coin symbol="€" position={[3.5, -2, -2]} rotation={[0, -0.4, 0]} color="#E0E0E0" />

            {/* Bronze (£) - Bottom Left */}
            <Coin symbol="£" position={[-2.5, -3, 0]} rotation={[0.2, 0.3, -0.2]} color="#CD7F32" />

            {/* Rose Gold (¥) - Top Right */}
            <Coin symbol="¥" position={[3, 3, -1]} rotation={[-0.1, -0.2, 0.1]} color="#B76E79" />
        </group>
    );
}

export default function Scene3D() {
    return (
        <div className="w-full h-full pointer-events-none">
            <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />

                {/* Lighting setup for metal reflections */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" />
                <spotLight position={[-10, -10, -5]} angle={0.5} penumbra={1} intensity={1} color="#4f46e5" /> {/* Indigo rim light */}

                <FloatingCurrencies />

                {/* Studio environment for realistic reflections */}
                <Environment preset="studio" />
            </Canvas>
        </div>
    );
}
