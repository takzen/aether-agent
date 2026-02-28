"use client";

import React, { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";

const MermaidRenderer = ({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(2.5); // Default start BIG (250% scale)

    // Panning state
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Zoom Functions
    const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 10));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.4));

    // Fixed Reset to BIG scale
    const resetToBig = () => {
        setScale(2.5);
        setPosition({ x: 0, y: 0 });
    };

    // Drag Handlers
    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            fontFamily: "Inter, system-ui, sans-serif",
            flowchart: { useMaxWidth: false, htmlLabels: true },
            themeVariables: {
                primaryColor: "#9333ea",
                primaryTextColor: "#fff",
                primaryBorderColor: "#9333ea",
                lineColor: "#4b5563",
                secondaryColor: "#18181b",
                tertiaryColor: "#f59e0b",
                mainBkg: "rgba(255, 255, 255, 0.03)",
                nodeBorder: "rgba(147, 81, 234, 0.3)",
                clusterBkg: "rgba(255, 255, 255, 0.01)",
                clusterBorder: "rgba(255, 255, 255, 0.1)",
                defaultLinkColor: "#6b7280",
                titleColor: "#f59e0b",
                edgeLabelBackground: "#0a0a0b",
                nodeTextColor: "#e5e7eb"
            }
        });
    }, []);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart) return;
            setIsLoaded(false);
            setError(null);

            try {
                const id = `mermaid-render-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: renderedSvg } = await mermaid.render(id, chart);

                // FORCE HUGE DIMENSIONS
                const cleanedSvg = renderedSvg
                    .replace(/width="[^"]*"/, 'width="2500px"')
                    .replace(/height="[^"]*"/, 'height="auto"');

                setSvg(cleanedSvg);
                setIsLoaded(true);
                // Start with BIG scale
                setScale(1.5);
                setPosition({ x: 0, y: 0 });
            } catch (err) {
                console.error("Mermaid render error:", err);
                setError("Diagram rendering failed. Check syntax.");
                setIsLoaded(true);
            }
        };

        renderChart();
    }, [chart]);

    return (
        <div className="w-full h-full relative flex flex-col bg-[#1e1e1e] overflow-hidden">
            {/* Toolbar */}
            <div className="absolute top-6 right-6 flex items-center gap-2 z-50">
                <div className="bg-[#181818]/90 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl flex items-center gap-1">
                    <button
                        onClick={zoomOut}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all active:scale-95"
                    >
                        <span className="text-xl font-light">-</span>
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button
                        onClick={resetToBig}
                        className="px-6 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-[11px] font-mono text-purple-400 hover:text-purple-300 transition-all uppercase tracking-widest active:scale-95 font-bold"
                    >
                        V-MAX {Math.round(scale * 100)}%
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button
                        onClick={zoomIn}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all active:scale-95"
                    >
                        <span className="text-xl font-light">+</span>
                    </button>
                </div>
            </div>

            {/* Main Interactive Area */}
            <div
                ref={containerRef}
                className={`flex-1 w-full h-full overflow-hidden relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoaded ? 1 : 0 }}
                        ref={contentRef}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                            transformOrigin: "center center",
                            pointerEvents: "auto"
                        }}
                        className="flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                </div>
            </div>

            {/* Instruction Banner */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 text-[10px] text-neutral-400 font-mono whitespace-nowrap pointer-events-none flex items-center gap-3">
                <span className="flex items-center gap-1.5 underline decoration-purple-500/50 underline-offset-4 font-bold text-white uppercase italic">Ultra-Wide Architecture Map</span>
                <span className="text-neutral-700 select-none">•</span>
                <span>Chwyć łapką, by przesuwać ogromny schemat</span>
            </div>
        </div>
    );
};

export default MermaidRenderer;
