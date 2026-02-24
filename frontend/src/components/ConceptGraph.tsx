"use client";

import { useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GraphNode = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GraphLink = Record<string, any>;

interface ConceptGraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export default function ConceptGraph({ conceptGraph, onNodeClick }: { conceptGraph: ConceptGraphData, onNodeClick?: (node: GraphNode) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        // We only execute this client-side
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const graphData = useMemo(() => {
        if (!conceptGraph) return { nodes: [], links: [] };

        // Copy the objects to avoid modifying Next.js state
        const nodes = (conceptGraph.nodes || []).map((n: GraphNode) => ({ ...n, val: 2 }));
        const links = (conceptGraph.links || []).map((l: GraphLink) => ({
            ...l,
            source: l.source_id,
            target: l.target_id,
            name: l.relation || 'LINK',
        }));

        return { nodes, links };
    }, [conceptGraph]);

    return (
        <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeLabel="name"
                nodeColor={() => '#f59e0b'} // Amber color
                nodeRelSize={4}
                linkColor={() => 'rgba(245, 158, 11, 0.4)'}
                linkWidth={1.5}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                onNodeClick={onNodeClick}
                backgroundColor="#1e1e1e" // Match background color
                nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    // Setup basic node
                    const label = node.name || 'Unknown';
                    const fontSize = 12 / globalScale;

                    ctx.beginPath();
                    // Keep circle size reasonable at all zoom levels
                    const nodeR = 5;
                    ctx.arc(node.x, node.y, nodeR, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#f59e0b';
                    ctx.fill();

                    // Text label
                    if (globalScale > 0.8) {
                        ctx.font = `bold ${fontSize}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        const textY = node.y + nodeR + (8 / globalScale);
                        const bckgDimensions = ctx.measureText(label);

                        // Draw nice pill background for node label
                        ctx.fillStyle = 'rgba(24, 24, 24, 0.85)';
                        ctx.beginPath();
                        ctx.roundRect(
                            node.x - bckgDimensions.width / 2 - 1,
                            textY - fontSize / 2 - 1,
                            bckgDimensions.width + 2,
                            fontSize + 2,
                            2 / globalScale // border radius
                        );
                        ctx.fill();

                        // Draw text
                        ctx.fillStyle = '#ffffff'; // strict white text for max contrast
                        ctx.fillText(label, node.x, textY);
                    }
                }}
                // Link label rendering
                linkCanvasObjectMode={() => 'after'}
                linkCanvasObject={(link: GraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    if (globalScale < 1.2) return; // Only show link labels when zoomed in

                    const start = link.source;
                    const end = link.target;

                    // ignore unbound links
                    if (typeof start !== 'object' || typeof end !== 'object') return;

                    // calculate label positioning
                    const textPos = {
                        x: start.x + (end.x - start.x) / 2,
                        y: start.y + (end.y - start.y) / 2
                    };

                    const relLink = { x: end.x - start.x, y: end.y - start.y };
                    let textAngle = Math.atan2(relLink.y, relLink.x);
                    // maintain label vertical orientation
                    if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                    if (textAngle < -Math.PI / 2) textAngle = -(Math.PI + textAngle);

                    const fontSize = 8 / globalScale;
                    ctx.font = `${fontSize}px block, monospace`;

                    ctx.save();
                    ctx.translate(textPos.x, textPos.y);
                    ctx.rotate(textAngle);

                    // Draw nice pill background for label
                    const label = link.relation || '';
                    const bckgDimensions = ctx.measureText(label);
                    ctx.fillStyle = 'rgba(24, 24, 24, 0.8)'; // Dark background
                    ctx.fillRect(- bckgDimensions.width / 2, - fontSize / 2, bckgDimensions.width, fontSize);

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#f59e0b'; // Amber text
                    ctx.fillText(label, 0, 0);
                    ctx.restore();
                }}
            />
        </div>
    );
}
