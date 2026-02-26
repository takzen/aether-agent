"use client";

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ConceptNode {
    id: string;
    name: string;
    position?: THREE.Vector3;
}

interface ConceptLink {
    source_id: string;
    target_id: string;
    relation: string;
}

interface NeuralTopologyViewProps {
    isNightMode?: boolean;
    memories: unknown[];
    conceptGraph: { nodes: ConceptNode[], links: ConceptLink[] };
}

/* ─── Hub: a glowing point on the brain surface ──────── */
function Hub({ position, color, label, subtitle, size = 0.3 }: {
    position: THREE.Vector3;
    color: string;
    label: string;
    subtitle?: string;
    size?: number;
}) {
    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
                <mesh>
                    <sphereGeometry args={[size, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={4}
                        toneMapped={false}
                    />
                    <pointLight distance={3} intensity={3} color={color} />
                </mesh>
                <Html distanceFactor={25} position={[0, size * 2, 0]} center>
                    <div className="pointer-events-none select-none flex flex-col items-center">
                        <div className="bg-black/80 border border-white/5 px-2 py-0.5 rounded-sm text-[9px] font-mono text-white/90 whitespace-nowrap uppercase tracking-[0.1em] shadow-xl text-center backdrop-blur-md">
                            {label}
                            {subtitle && <div className="text-[7px] text-neutral-500 tracking-normal mt-0 opacity-70">{subtitle}</div>}
                        </div>
                    </div>
                </Html>
            </Float>
        </group>
    );
}

/* ─── SurfaceFlow: a dashed line + pulse that follows the brain surface ── */
function SurfaceFlow({ points, color, speed = 1, opacity = 0.4 }: {
    points: THREE.Vector3[];
    color: string;
    speed?: number;
    opacity?: number;
}) {
    const pulseRef = useRef<THREE.Mesh>(null);
    const curve = useMemo(() => {
        if (points.length < 2) return null;
        return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    }, [points]);

    // Create line geometry from curve
    const lineGeom = useMemo(() => {
        if (!curve) return null;
        const pts = curve.getPoints(60);
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        return geom;
    }, [curve]);

    useFrame(({ clock }) => {
        if (!pulseRef.current || !curve) return;
        const t = (clock.elapsedTime * speed * 0.2) % 1;
        pulseRef.current.position.copy(curve.getPoint(t));
    });

    if (!curve || !lineGeom) return null;

    return (
        <group>
            <line>
                <bufferGeometry attach="geometry" {...lineGeom} />
                <lineBasicMaterial
                    attach="material"
                    color={color}
                    transparent
                    opacity={opacity}
                />
            </line>
            <mesh ref={pulseRef}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial color={color} toneMapped={false} />
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
    segments: number = 16
): THREE.Vector3[] {
    const points: THREE.Vector3[] = [start.clone()];

    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        // Use spherical linear interpolation for the direction vector relative to center
        const startDir = start.clone().sub(center).normalize();
        const endDir = end.clone().sub(center).normalize();

        // Quaternions for smooth spherical interpolation (slerp)
        const qStart = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), startDir);
        const qEnd = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), endDir);
        const qCurrent = new THREE.Quaternion().copy(qStart).slerp(qEnd, t);

        const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(qCurrent).normalize();

        const surfacePoint = findSurfacePoint(brainMeshes, dir, center);

        // Dynamic offset: follow the surface closely but keep it visible (0.15 - 0.25)
        const outward = dir.clone().multiplyScalar(0.2);
        points.push(surfacePoint.add(outward));
    }

    points.push(end.clone());
    return points;
}

const worldCenter = new THREE.Vector3(0, 0, 0);

/* ─── Brain + Topology ─────────────────────────────────── */
function BrainModel({ isNightMode, conceptGraph }: { isNightMode: boolean, conceptGraph: { nodes: ConceptNode[], links: ConceptLink[] } }) {
    const { scene } = useGLTF('/brain.glb');

    // 1. Prepare and Scale the Scene (once when it loads)
    useMemo(() => {
        if (!scene) return;
        scene.position.set(0, 0, 0);
        scene.scale.set(1, 1, 1);
        scene.rotation.set(0, Math.PI / 2, 0);

        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 18 / maxDim;
        scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

        const scaledBox = new THREE.Box3().setFromObject(scene);
        const center = scaledBox.getCenter(new THREE.Vector3());
        scene.position.sub(center);
        scene.updateMatrixWorld(true);
    }, [scene]);

    // 2. Extract Meshes and apply materials
    const meshes = useMemo(() => {
        if (!scene) return [];
        const foundMeshes: THREE.Mesh[] = [];
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshStandardMaterial({
                    color: isNightMode ? "#4a3520" : "#444444",
                    emissive: isNightMode ? "#2a1a0a" : "#111111",
                    emissiveIntensity: 0.4,
                    roughness: 0.5,
                    metalness: 0.4,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.95
                });
                foundMeshes.push(mesh);
            }
        });
        return foundMeshes;
    }, [scene, isNightMode]);



    // 3. Compute Fixed Hubs
    const hubPositions = useMemo(() => {
        if (!meshes.length) return null;
        const hubDirs: Record<string, THREE.Vector3> = {
            core: new THREE.Vector3(0, 0.2, 1),
            library: new THREE.Vector3(0, 1, 0.4),
            qdrant: new THREE.Vector3(1, 0.5, 0.2),
            sqlite: new THREE.Vector3(-1, 0.5, 0.2),
            roadmap: new THREE.Vector3(0, 0, -1),
        };

        const positions: Record<string, THREE.Vector3> = {};
        for (const [key, dir] of Object.entries(hubDirs)) {
            const surfaceHit = findSurfacePoint(meshes, dir, worldCenter);
            const outwardOffset = surfaceHit.clone().sub(worldCenter).normalize().multiplyScalar(0.4);
            positions[key] = surfaceHit.add(outwardOffset);
        }
        return positions;
    }, [meshes]);

    // 4. Compute Dynamic Concepts and Links
    const { nodesWithPos, graphFlows } = useMemo(() => {
        if (!meshes.length || !conceptGraph?.nodes) {
            return { nodesWithPos: [], graphFlows: [] };
        }

        const nodes = conceptGraph.nodes.map((node) => {
            const hash = node.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const phi = (hash % 100) / 100 * Math.PI * 2;
            const theta = (hash % 100) / 100 * Math.PI;

            const dir = new THREE.Vector3(
                Math.sin(theta) * Math.cos(phi),
                Math.cos(theta),
                Math.sin(theta) * Math.sin(phi)
            ).normalize();

            const surfaceHit = findSurfacePoint(meshes, dir, worldCenter);
            const outwardOffset = surfaceHit.clone().sub(worldCenter).normalize().multiplyScalar(0.2);
            const pos = surfaceHit.add(outwardOffset);

            return { ...node, position: pos };
        });

        const flows: THREE.Vector3[][] = [];
        conceptGraph.links.forEach((link) => {
            const sNode = nodes.find((n) => n.id === link.source_id);
            const tNode = nodes.find((n) => n.id === link.target_id);
            if (sNode && tNode && sNode.position && tNode.position) {
                flows.push(traceSurfacePath(meshes, sNode.position, tNode.position, worldCenter));
            }
        });

        return { nodesWithPos: nodes, graphFlows: flows };
    }, [meshes, conceptGraph]);

    const hubMeta = {
        core: { color: "#a855f7", label: "Kernel", sub: "Aether Agent" },
        library: { color: "#10b981", label: "Library", sub: "Documents" },
        qdrant: { color: "#3b82f6", label: "Synapses", sub: "Memories" },
        sqlite: { color: "#94a3b8", label: "Chronicles", sub: "SQL Logs" },
        roadmap: { color: "#f59e0b", label: "Roadmap", sub: "Timeline" },
    };

    return (
        <group>
            <primitive object={scene} />

            {/* Infrastructure hubs */}
            {hubPositions && Object.entries(hubMeta).map(([key, meta]) => (
                <Hub
                    key={key}
                    position={hubPositions[key]}
                    color={meta.color}
                    label={meta.label}
                    subtitle={meta.sub}
                    size={0.15}
                />
            ))}

            {/* Dynamic concept nodes */}
            {nodesWithPos.map((node) => (
                node.position && (
                    <Hub
                        key={node.id}
                        position={node.position}
                        color="#f59e0b"
                        label={node.name}
                        size={0.08}
                    />
                )
            ))}

            {/* Connection flows */}
            {graphFlows.map((path, i) => (
                <SurfaceFlow
                    key={i}
                    points={path}
                    color="#f59e0b"
                    speed={0.5}
                    opacity={0.3}
                />
            ))}
        </group>
    );
}

export default function NeuralTopologyView({ isNightMode = false, conceptGraph }: NeuralTopologyViewProps) {
    return (
        <div className="w-full h-full relative bg-[#0a0a0a]">
            <Canvas
                camera={{ fov: 35, position: [0, 10, 38] }}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
                {/* Background color */}
                <color attach="background" args={['#050505']} />

                {/* Lighting setup */}
                <ambientLight intensity={1.2} />
                <pointLight position={[20, 30, 20]} intensity={2.5} color="#ffffff" />
                <pointLight position={[-20, 10, -20]} intensity={1.5} color="#4444ff" />
                <pointLight position={[0, -30, 0]} intensity={1.0} color="#ffaa00" />

                <Suspense fallback={null}>
                    <BrainModel isNightMode={isNightMode} conceptGraph={conceptGraph} />
                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        autoRotate
                        autoRotateSpeed={0.3}
                        makeDefault
                    />
                </Suspense>
            </Canvas>

            <div className="absolute top-10 left-10 pointer-events-none select-none space-y-4">
                <div className="flex flex-col gap-1">
                    <div className="text-[14px] font-mono text-white/60 uppercase tracking-[0.6em] font-light italic">Neural Topology V2</div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest border-t border-white/5 pt-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Active SQL Concepts: {conceptGraph?.nodes?.length || 0}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-600 uppercase tracking-tighter">
                        <div className="w-6 h-px bg-white/10" />
                        Interface Controls
                    </div>
                    <div className="flex flex-col gap-1 pl-8">
                        <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">• Left Click: Rotate View</div>
                        <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">• Right Click: Pan Space</div>
                        <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">• Scroll: Zoom Logic Lattice</div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2 pointer-events-none select-none">
                <div className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase px-4 py-2 border border-white/5 bg-black/40 backdrop-blur-md rounded-sm">
                    Status: <span className="text-amber-500/80">Synchronized</span>
                </div>
                <div className="text-[8px] text-neutral-700 font-mono tracking-[0.3em] uppercase pr-1">
                    Gallant Atlas :: Cognitive Layer :: 1.0.0
                </div>
            </div>
        </div>
    );
}
