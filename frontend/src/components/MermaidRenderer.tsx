"use client";

import React, { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";

const MermaidRenderer = ({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [scale, setScale] = useState(1);

    // Panning state
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Zoom Functions
    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 4));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.25));

    const resetView = () => {
        if (containerRef.current && contentRef.current) {
            const svgEl = contentRef.current.querySelector("svg");
            if (svgEl) {
                const vb = (svgEl as SVGSVGElement).viewBox?.baseVal;
                const bbox = svgEl.getBBox();
                const graphWidth = (vb && vb.width > 0) ? vb.width : bbox.width;
                const graphHeight = (vb && vb.height > 0) ? vb.height : bbox.height;
                const cw = containerRef.current.clientWidth;
                const ch = containerRef.current.clientHeight;
                const fitScale = Math.max(0.5, Math.min((cw * 0.9) / graphWidth, (ch * 0.9) / graphHeight, 1.8));
                setScale(fitScale);
            } else {
                setScale(1);
            }
        } else {
            setScale(1);
        }
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

    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.25, Math.min(prev + delta, 4)));
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

            try {
                const id = `mermaid-render-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: renderedSvg } = await mermaid.render(id, chart);

                // Keep Mermaid native dimensions; only disable max-width shrinking.
                const cleanedSvg = renderedSvg
                    .replace(/max-width:\s*[^;"]+;?/g, "max-width: none;");

                setSvg(cleanedSvg);
                setIsLoaded(true);
                setScale(1);
                setPosition({ x: 0, y: 0 });
            } catch (err) {
                console.error("Mermaid render error:", err);
                setIsLoaded(true);
            }
        };

        renderChart();
    }, [chart]);

    useEffect(() => {
        if (!svg || !containerRef.current || !contentRef.current) return;
        const id = requestAnimationFrame(() => {
            resetView();
        });
        return () => cancelAnimationFrame(id);
    }, [svg]);

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
                        onClick={resetView}
                        className="px-6 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-[11px] font-mono text-purple-400 hover:text-purple-300 transition-all uppercase tracking-widest active:scale-95 font-bold"
                    >
                        FIT {Math.round(scale * 100)}%
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
                onWheel={onWheel}
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
                <span className="text-neutral-700 select-none">|</span>
                <span>Drag to pan, wheel to zoom</span>
            </div>
        </div>
    );
};

export default MermaidRenderer;

