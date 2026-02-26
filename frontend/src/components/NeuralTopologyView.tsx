"use client";

import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface NeuralTopologyViewProps {
    isNightMode?: boolean;
    memories: any[];
}

/* ─── Hub: a glowing point on the brain surface ──────── */
function Hub({ position, color, label, subtitle }: {
    position: THREE.Vector3;
    color: string;
    label: string;
    subtitle: string;
}) {
    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
                <mesh>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={10} toneMapped={false} />
                    <pointLight distance={5} intensity={8} color={color} />
                </mesh>
                <Html distanceFactor={25} position={[0, 0.7, 0]} center>
                    <div className="pointer-events-none select-none flex flex-col items-center">
                        <div className="bg-black/90 border border-white/10 px-3 py-1 rounded text-[11px] font-mono text-white/95 whitespace-nowrap uppercase tracking-[0.25em] shadow-2xl text-center">
                            {label}
                            <div className="text-[8px] text-neutral-400 tracking-widest mt-0.5 opacity-70">{subtitle}</div>
                        </div>
                    </div>
                </Html>
            </Float>
        </group>
    );
}

/* ─── SurfaceFlow: a dashed line + pulse that follows the brain surface ── */
function SurfaceFlow({ points, color, speed = 1 }: {
    points: THREE.Vector3[];
    color: string;
    speed?: number;
}) {
    const pulseRef = useRef<THREE.Mesh>(null);
    const curve = useMemo(() => {
        if (points.length < 2) return null;
        return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    }, [points]);

    // Create line geometry from curve
    const lineGeom = useMemo(() => {
        if (!curve) return null;
        const pts = curve.getPoints(40);
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        return geom;
    }, [curve]);

    useFrame(({ clock }) => {
        if (!pulseRef.current || !curve) return;
        const t = (clock.elapsedTime * speed * 0.3) % 1;
        pulseRef.current.position.copy(curve.getPoint(t));
    });

    if (!curve || !lineGeom) return null;

    return (
        <group>
            <line>
                <bufferGeometry attach="geometry" {...lineGeom} />
                <lineDashedMaterial
                    attach="material"
                    color={color}
                    dashSize={0.5}
                    gapSize={0.3}
                    transparent
                    opacity={0.5}
                />
            </line>
            <mesh ref={pulseRef}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color={color} toneMapped={false} />
                <pointLight intensity={5} distance={3} color={color} />
            </mesh>
        </group>
    );
}

/* ─── Utility: raycast from center outward to find surface point ─── */
function findSurfacePoint(
    brainMeshes: THREE.Mesh[],
    direction: THREE.Vector3,
    center: THREE.Vector3
): THREE.Vector3 {
    const raycaster = new THREE.Raycaster();
    const dir = direction.clone().normalize();

    // Cast from far outside inward (toward center) to find the outer surface
    const origin = center.clone().add(dir.clone().multiplyScalar(50));
    raycaster.set(origin, dir.clone().negate());

    const intersections: THREE.Intersection[] = [];
    for (const mesh of brainMeshes) {
        const hits = raycaster.intersectObject(mesh, true);
        intersections.push(...hits);
    }

    // Sort by distance from origin (ascending) — first hit = outermost surface
    intersections.sort((a, b) => a.distance - b.distance);

    if (intersections.length > 0) {
        return intersections[0].point.clone();
    }

    // Fallback: if no hit, return center + direction * 12
    return center.clone().add(dir.multiplyScalar(12));
}

/* ─── Utility: trace a path along the surface between two surface points ─── */
function traceSurfacePath(
    brainMeshes: THREE.Mesh[],
    start: THREE.Vector3,
    end: THREE.Vector3,
    center: THREE.Vector3,
    segments: number = 8
): THREE.Vector3[] {
    const points: THREE.Vector3[] = [start.clone()];

    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        // Interpolate direction (slerp-like via normalize)
        const dir = new THREE.Vector3().lerpVectors(
            start.clone().sub(center).normalize(),
            end.clone().sub(center).normalize(),
            t
        ).normalize();
        const surfacePoint = findSurfacePoint(brainMeshes, dir, center);
        // Push slightly above surface so the line is visible
        const outward = surfacePoint.clone().sub(center).normalize().multiplyScalar(0.3);
        points.push(surfacePoint.add(outward));
    }

    points.push(end.clone());
    return points;
}

/* ─── Brain + Topology ─────────────────────────────────── */
function BrainModel({ isNightMode }: { isNightMode: boolean }) {
    const { scene } = useGLTF('/brain.glb');
    const groupRef = useRef<THREE.Group>(null);

    // State for computed surface positions
    const [hubPositions, setHubPositions] = useState<Record<string, THREE.Vector3> | null>(null);
    const [flowPaths, setFlowPaths] = useState<THREE.Vector3[][] | null>(null);

    useEffect(() => {
        if (!scene) return;

        // 1. Reset and Scale
        scene.position.set(0, 0, 0);
        scene.scale.set(1, 1, 1);
        scene.rotation.set(0, Math.PI / 2, 0);

        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 25 / maxDim;
        scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Re-center after scaling
        const scaledBox = new THREE.Box3().setFromObject(scene);
        const center = scaledBox.getCenter(new THREE.Vector3());
        scene.position.sub(center);

        // CRITICAL: update the entire world matrix hierarchy BEFORE raycasting
        scene.updateMatrixWorld(true);

        // Debug: log exact bounding box so we know the real dimensions
        const finalBox = new THREE.Box3().setFromObject(scene);
        const finalSize = finalBox.getSize(new THREE.Vector3());
        const finalCenter = finalBox.getCenter(new THREE.Vector3());
        console.log('[BRAIN] Size:', finalSize.toArray().map(v => v.toFixed(2)));
        console.log('[BRAIN] Min:', finalBox.min.toArray().map(v => v.toFixed(2)), 'Max:', finalBox.max.toArray().map(v => v.toFixed(2)));

        // 2. Apply dark material and collect meshes
        const meshes: THREE.Mesh[] = [];
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: isNightMode ? "#6a4520" : "#334455",
                    emissive: isNightMode ? "#1a0a00" : "#080e18",
                    emissiveIntensity: 0.3,
                    roughness: 0.4,
                    metalness: 0.3,
                    side: THREE.DoubleSide,
                });
                meshes.push(mesh);
            }
        });

        // 3. Raycast to find hub positions on the actual surface
        const worldCenter = new THREE.Vector3(0, 0, 0);

        // Anatomical directions (brain rotated 90° on Y, so adjust)
        const hubDirs = {
            core: new THREE.Vector3(0, 0.1, 1),     // Frontal
            library: new THREE.Vector3(0, 1, 0.3),     // Parietal top
            qdrant: new THREE.Vector3(1, 0.3, 0.2),   // Right temporal          
            sqlite: new THREE.Vector3(-1, 0.3, 0.2),  // Left temporal
            roadmap: new THREE.Vector3(0, 0.2, -1),    // Occipital
        };

        const positions: Record<string, THREE.Vector3> = {};
        for (const [key, dir] of Object.entries(hubDirs)) {
            const surfaceHit = findSurfacePoint(meshes, dir, worldCenter);
            console.log(`[BRAIN] Hub "${key}":`, surfaceHit.toArray().map(v => v.toFixed(2)));
            // Push hub slightly above surface so it's visible
            const outwardOffset = surfaceHit.clone().sub(worldCenter).normalize().multiplyScalar(0.5);
            positions[key] = surfaceHit.add(outwardOffset);
        }
        setHubPositions(positions);

        // 4. Trace surface paths for flows
        const flows = [
            traceSurfacePath(meshes, positions.library, positions.core, worldCenter),
            traceSurfacePath(meshes, positions.sqlite, positions.core, worldCenter),
            traceSurfacePath(meshes, positions.core, positions.qdrant, worldCenter),
            traceSurfacePath(meshes, positions.qdrant, positions.core, worldCenter),
            traceSurfacePath(meshes, positions.core, positions.roadmap, worldCenter),
        ];
        setFlowPaths(flows);

    }, [scene, isNightMode]);

    const hubMeta = {
        core: { color: "#a855f7", label: "Aether Core", sub: "Decision Center" },
        library: { color: "#10b981", label: "The Library", sub: "Knowledge Base" },
        qdrant: { color: "#3b82f6", label: "Qdrant", sub: "Vector Synapses" },
        sqlite: { color: "#cbd5e1", label: "Chronicles", sub: "Session Logs" },
        roadmap: { color: "#f59e0b", label: "Roadmap", sub: "Consolidation" },
    };

    const flowColors = ["#10b981", "#cbd5e1", "#3b82f6", "#3b82f6", "#f59e0b"];

    return (
        <group ref={groupRef}>
            <primitive object={scene} />

            {hubPositions && Object.entries(hubMeta).map(([key, meta]) => (
                <Hub
                    key={key}
                    position={hubPositions[key]}
                    color={meta.color}
                    label={meta.label}
                    subtitle={meta.sub}
                />
            ))}

            {flowPaths && flowPaths.map((path, i) => (
                <SurfaceFlow
                    key={i}
                    points={path}
                    color={flowColors[i]}
                    speed={0.3 + i * 0.1}
                />
            ))}
        </group>
    );
}

export default function NeuralTopologyView({ isNightMode = false }: NeuralTopologyViewProps) {
    return (
        <div className="w-full h-full relative bg-[#1e1e1e]">
            <Canvas
                camera={{ fov: 35, position: [0, 5, 35] }}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
                <color attach="background" args={['#1e1e1e']} />

                <ambientLight intensity={1.0} />
                <pointLight position={[30, 40, 30]} intensity={3} color="#ffffff" />
                <pointLight position={[-30, 20, -50]} intensity={2} color="#5588ff" />
                <pointLight position={[0, -50, 0]} intensity={1.5} color="#ffbb55" />

                <Suspense fallback={null}>
                    <BrainModel isNightMode={isNightMode} />
                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        autoRotate
                        autoRotateSpeed={0.5}
                        makeDefault
                    />
                </Suspense>
            </Canvas>

            <div className="absolute top-10 left-10 pointer-events-none select-none">
                <div className="flex flex-col gap-1">
                    <div className="text-[20px] font-mono text-white/95 uppercase tracking-[1em] font-black italic">Gallant Atlas Core</div>
                    <div className="text-[11px] font-mono text-neutral-600 uppercase tracking-widest border-t border-white/10 pt-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        3D Biological Mesh :: Synchronized
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 right-10 text-[10px] text-neutral-600 font-mono tracking-[0.4em] uppercase pointer-events-none select-none px-4 py-2 border border-white/5 bg-black/60 backdrop-blur-xl rounded-sm">
                Anatomical Scan V.2.0
            </div>
        </div>
    );
}
