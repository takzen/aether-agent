"use client";

import { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import * as THREE from 'three';

interface NeuralTopologyViewProps {
    isNightMode?: boolean;
    memories: any[];
}

function BrainModel({ isNightMode }: { isNightMode: boolean }) {
    const gltf = useGLTF('/brain.glb');
    const meshRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (!meshRef.current) return;

        // Apply a premium anatomical material to all meshes
        gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshPhysicalMaterial({
                    color: isNightMode ? 0xb48554 : 0x556688,
                    transparent: true,
                    opacity: 0.45,
                    roughness: 0.3,
                    metalness: 0.3,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1,
                    emissive: isNightMode ? 0x221100 : 0x000811,
                    emissiveIntensity: 0.2,
                    side: THREE.DoubleSide,
                });
            }
        });
    }, [gltf, isNightMode]);

    return (
        <primitive
            ref={meshRef}
            object={gltf.scene}
            rotation={[0, Math.PI / 2, 0]} // Initial orientation
        />
    );
}

export default function NeuralTopologyView({ isNightMode = false }: NeuralTopologyViewProps) {
    return (
        <div className="w-full h-full relative bg-[#1e1e1e]">
            <Canvas
                shadows
                camera={{ fov: 45 }}
                gl={{ antialias: true }}
                style={{ background: '#1e1e1e' }}
            >
                <color attach="background" args={['#1e1e1e']} />

                {/* Stage automatically scales, centers, and lights the model perfectly */}
                <Suspense fallback={null}>
                    <Stage
                        intensity={0.6}
                        environment="city"
                        adjustCamera
                        shadows="contact"
                        environment-preset="night"
                    >
                        <BrainModel isNightMode={isNightMode} />
                    </Stage>

                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                        makeDefault
                    />
                </Suspense>
            </Canvas>

            {/* Scientific HUD Overlay */}
            <div className="absolute top-8 left-8 pointer-events-none">
                <div className="flex flex-col gap-1">
                    <div className="text-[14px] font-mono text-white/90 uppercase tracking-[0.8em] font-black italic">Gallant Atlas Core</div>
                    <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest border-t border-white/10 pt-1">3D Biological Mesh :: Synchronized</div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 text-[9px] text-neutral-600 font-mono tracking-widest uppercase pointer-events-none">
                Anatomical Scan V.1.4_PRIME
            </div>
        </div>
    );
}
