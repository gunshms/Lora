import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, PresentationControls } from "@react-three/drei";
import * as THREE from "three";

// Individual Layer Component to handle independent animation
const ParticleLayer = ({
    geometry,
    layerIndex,
    explosionProgress,
    count
}: {
    geometry: THREE.BufferGeometry,
    layerIndex: number,
    explosionProgress: number,
    count: number
}) => {
    const meshRef = useRef<THREE.Points>(null);

    // Randomize behavior based on layer index (deterministic chaos)
    const randomFactor = useMemo(() => {
        return {
            speed: 10 + Math.random() * 20, // Different expansion speeds
            rotX: (Math.random() - 0.5) * 2, // Random rotation axis
            rotY: (Math.random() - 0.5) * 2,
            rotZ: (Math.random() - 0.5) * 2,
        };
    }, []);

    useFrame(() => {
        if (!meshRef.current) return;

        if (explosionProgress > 0) {
            // EXPLOSION BEHAVIOR

            // 1. Scale Expansion (The core of the explosion)
            // Layers move at different speeds -> creates depth/volume
            const spread = 1 + explosionProgress * (10 + layerIndex * 5 + randomFactor.speed);
            meshRef.current.scale.setScalar(spread);

            // 2. Chaotic Rotation
            // Each layer rotates differently, breaking the "perfect shape" look
            meshRef.current.rotation.x = explosionProgress * randomFactor.rotX;
            meshRef.current.rotation.y = explosionProgress * randomFactor.rotY;
            meshRef.current.rotation.z = explosionProgress * randomFactor.rotZ;

            // 3. Opacity Management
            const material = meshRef.current.material as THREE.PointsMaterial;
            if (material) {
                // Keep them visible but maybe dimmer as they expand
                material.opacity = Math.max(0.3, 1 - explosionProgress * 0.3);
            }
            meshRef.current.visible = true;

        } else {
            // RESET (Perfect Alignment)
            meshRef.current.scale.setScalar(1);
            meshRef.current.rotation.set(0, 0, 0);

            const material = meshRef.current.material as THREE.PointsMaterial;
            if (material) material.opacity = 1;
            meshRef.current.visible = true;
        }
    });

    return (
        <points ref={meshRef} frustumCulled={false}>
            <primitive object={geometry} />
            <pointsMaterial
                color="#ffffff"
                size={0.012} // Fine particles
                transparent
                opacity={1}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

export default function HeroSculpture() {
    const groupRef = useRef<THREE.Group>(null);
    // Shared animated value for child components
    // We can't pass state down easily without Context or using a parent ref.
    // Instead, we'll let the parent drive the "Progress" calculation and pass it?
    // React Three Fiber components re-render? No, useFrame is imperative.

    // BETTER APPROACH: 
    // We keep the logic inside the parent `useFrame` and manipulate children directly?
    // OR we use a Ref to store the progress value and pass that ref?
    // Let's stick to the "Parent drives Children" pattern via Traversal or by updating a Ref that children read?
    // Simplest: The Parent does the math and updates a ref, or we just keep the loop in the parent like before.
    // I will revert to the "Parent Loop" but with the new "Multi-Layer Chaos" logic.

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const scrollY = (typeof window !== 'undefined') ? window.scrollY : 0;
        const viewportHeight = (typeof window !== 'undefined') ? window.innerHeight : 1000;

        const explosionTrigger = viewportHeight * 0.15;
        const explosionProgress = Math.max(0, (scrollY - explosionTrigger) / (viewportHeight * 1.5));

        if (groupRef.current) {
            // Breathing when intact
            if (explosionProgress === 0) {
                groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
                groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
            } else {
                // Stop breathing during explosion for simpler physics
                groupRef.current.rotation.z = 0;
                groupRef.current.position.y = 0;
            }

            // Iterate through all layers
            groupRef.current.traverse((child) => {
                if (child instanceof THREE.Points) {
                    const layerIndex = child.userData.layerIndex || 0;
                    const randoms = child.userData.randoms || { s: 15, x: 0.5, y: 0.5, z: 0 };
                    const material = child.material as THREE.PointsMaterial;

                    if (explosionProgress > 0) {
                        child.visible = true;

                        // CHAOTIC EXPANSION
                        // Scale multiplier differs per layer
                        const spread = 1 + explosionProgress * randoms.s;
                        child.scale.setScalar(spread);

                        // Chaotic Rotation
                        child.rotation.x = explosionProgress * randoms.x;
                        child.rotation.y = explosionProgress * randoms.y;
                        child.rotation.z = explosionProgress * randoms.z;

                        if (material) material.opacity = Math.max(0.4, 0.9 - explosionProgress * 0.2);

                    } else {
                        child.scale.setScalar(1);
                        child.rotation.set(0, 0, 0);
                        if (material) material.opacity = 1.0;
                        child.visible = true;
                    }
                }
            });
        }
    });

    // GEOMETRIES
    const bodyGeo = new THREE.BoxGeometry(1.8, 1.2, 0.6, 60, 40, 20);
    const lensGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 64, 24);
    const topGeo = new THREE.BoxGeometry(1.0, 0.3, 0.6, 32, 12, 16);
    const buttonGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 32, 8);

    // HELPER: Generate multiple layers with baked-in randomness
    const RenderLayers = ({ geometry, count = 5 }: { geometry: THREE.BufferGeometry, count?: number }) => {
        return (
            <>
                {Array.from({ length: count }).map((_, i) => {
                    // Pre-calculate randomness for this specific layer instance
                    const randoms = {
                        s: 30 + Math.random() * 50, // Speed: 30 to 80 (Much wider spread)
                        x: (Math.random() - 0.5) * 2,
                        y: (Math.random() - 0.5) * 2,
                        z: (Math.random() - 0.5) * 2
                    };

                    return (
                        <points
                            key={i}
                            userData={{ layerIndex: i, randoms }} // Store data for the loop
                            frustumCulled={false}
                        >
                            <primitive object={geometry} />
                            <pointsMaterial
                                color="#ffffff"
                                size={0.015}
                                transparent
                                opacity={1}
                                sizeAttenuation
                                blending={THREE.AdditiveBlending}
                            />
                        </points>
                    );
                })}
            </>
        );
    };

    return (
        <PresentationControls
            global
            snap={true}
            zoom={0.8}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 6, Math.PI / 6]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
            <Float floatIntensity={1} rotationIntensity={0.5} speed={1}>
                <group ref={groupRef} rotation={[0, 0, 0]}>
                    <group position={[0, 0, 0]}> <RenderLayers geometry={bodyGeo} count={6} /> </group>
                    <group position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}> <RenderLayers geometry={lensGeo} count={6} /> </group>
                    <group position={[0, 0.75, 0]}> <RenderLayers geometry={topGeo} count={4} /> </group>
                    <group position={[0.6, 0.75, 0]}> <RenderLayers geometry={buttonGeo} count={4} /> </group>
                </group>
            </Float>
        </PresentationControls>
    );
}
