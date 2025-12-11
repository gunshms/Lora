"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Preload, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";

export default function Scene({ children, ...props }: any) {
    // Use a reliable environment for glass reflections
    // 'studio', 'city', or custom HDRI. 'city' provides good contrast for glass.

    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-transparent">
            <Canvas
                dpr={[1, 2]} // Handle high DPI
                gl={{ antialias: true, alpha: true }}
                camera={{ position: [0, 0, 5], fov: 45 }}
                eventSource={typeof document !== 'undefined' ? (document.body as HTMLElement) : undefined}
                eventPrefix="client"
                {...props}
            >
                {/* <Perf position="bottom-left" /> */}
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />

                <Suspense fallback={null}>
                    <Environment preset="city" blur={1} />
                    {children}
                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}
