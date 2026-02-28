"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Maximize2, Download, Copy, Check, ZoomIn, ZoomOut, RotateCcw, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Configure mermaid once
mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",
    themeVariables: {
        fontFamily: "Inter, system-ui, sans-serif",
        primaryColor: "#9333ea", // purple-600
        primaryTextColor: "#fff",
        primaryBorderColor: "#a855f7",
        lineColor: "#6b7280",
        secondaryColor: "#3b82f6",
        tertiaryColor: "#10b981",
        mainBkg: "rgba(255, 255, 255, 0.05)",
        nodeBorder: "rgba(168, 85, 247, 0.4)",
        clusterBkg: "rgba(255, 255, 255, 0.02)",
        clusterBorder: "rgba(255, 255, 255, 0.1)",
        defaultLinkColor: "#6366f1",
        titleColor: "#e9d5ff",
        edgeLabelBackground: "#1e1e1e",
        nodeTextColor: "#f3f4f6"
    }
});

interface MermaidRendererProps {
    chart: string;
}

const MermaidRenderer = ({ chart }: MermaidRendererProps) => {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart) return;
            try {
                // Generate a unique ID for this chart instance
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                // Use mermaid.render to get the SVG code
                const { svg: renderedSvg } = await mermaid.render(id, chart);
                setSvg(renderedSvg);
                setError(null);
                setIsLoaded(true);
            } catch (err: unknown) {
                console.error("Mermaid rendering failed:", err);
                setError("Failed to render neural topology diagram.");
            }
        };

        renderChart();
    }, [chart]);

    const handleCopy = () => {
        navigator.clipboard.writeText(chart);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aether-diagram-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!isFullscreen) return;
        // Don't preventDefault here as it might interfere with React's event system on some browsers
        // instead handling it via container styling or simple delta checks
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.2, Math.min(5, prev + delta)));
    };

    const resetView = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="my-6 group"
            >
                <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                    {/* Header Strip */}
                    <div className="bg-white/[0.03] border-b border-white/5 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Neural_Schema_Viz</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCopy}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-all flex items-center gap-1.5"
                                title="Copy Mermaid Code"
                            >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span className="text-[9px] font-mono">{isCopied ? "Copied" : "Source"}</span>
                            </button>
                            <button
                                onClick={handleDownload}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-all flex items-center gap-1.5"
                                title="Download SVG"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-mono">SVG</span>
                            </button>
                        </div>
                    </div>

                    {/* Diagram Area */}
                    <div className="p-8 flex justify-center items-center min-h-[150px] relative overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {error ? (
                            <div className="flex flex-col items-center gap-3 text-red-400/60 p-10">
                                <span className="text-xs font-mono">{error}</span>
                                <pre className="text-[9px] bg-red-500/5 p-4 rounded-lg max-w-full overflow-hidden">
                                    {chart.slice(0, 100)}...
                                </pre>
                            </div>
                        ) : (
                            <div
                                className={`transition-all duration-700 w-full flex justify-center ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                dangerouslySetInnerHTML={{ __html: svg }}
                            />
                        )}

                        {!isLoaded && !error && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Footer Glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                </div>

                <div className="mt-2 flex justify-center">
                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="text-[9px] text-neutral-600 hover:text-purple-400 font-mono flex items-center gap-1.5 transition-colors group/btn"
                    >
                        <Maximize2 className="w-2.5 h-2.5 group-hover/btn:scale-110 transition-transform" />
                        Click to enter Neural Focus Mode (Pan & Zoom)
                    </button>
                </div>
            </motion.div>

            {/* Neural Focus Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-10 flex flex-col items-center justify-center overflow-hidden"
                        onWheel={handleWheel}
                    >
                        {/* Modal Header Controls */}
                        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <h4 className="text-xs font-bold text-white uppercase tracking-[0.3em]">Neural_Focus_Viewer</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                                    <button onClick={() => setScale(prev => Math.max(0.2, prev - 0.2))} className="p-2 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-all" title="Zoom Out">
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <button onClick={resetView} className="p-2 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-all" title="Reset">
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setScale(prev => Math.min(5, prev + 0.2))} className="p-2 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-all" title="Zoom In">
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => { setIsFullscreen(false); resetView(); }}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all active:scale-95"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Canvas */}
                        <div
                            ref={dragRef}
                            className="w-full h-full flex items-center justify-center cursor-move overflow-hidden select-none"
                            onMouseDown={() => setIsDragging(true)}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                            onMouseMove={(e) => {
                                if (isDragging) {
                                    setPosition(prev => ({
                                        x: prev.x + e.movementX,
                                        y: prev.y + e.movementY
                                    }));
                                }
                            }}
                        >
                            <motion.div
                                animate={{
                                    x: position.x,
                                    y: position.y,
                                    scale: scale
                                }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="bg-transparent p-10 flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: svg }}
                            />
                        </div>

                        {/* HUD Info */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                                Zoom_Ratio: {Math.round(scale * 100)}% • Drag to navigate • Scroll to zoom
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MermaidRenderer;
