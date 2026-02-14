'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';


interface TerminalLine {
    text: string;
    type: 'info' | 'error' | 'success' | 'warning' | 'input';
    timestamp: string;
}

export const Terminal = () => {
    const [lines, setLines] = useState<TerminalLine[]>([
        { text: 'SYSTEM INITIALIZED: BIEG_WSTECZNY_V1.0', type: 'info', timestamp: '16:40:23' },
        { text: 'CONNECTING TO ANALOG_SUBSYSTEM... OK', type: 'success', timestamp: '16:40:24' },
        { text: 'WARNING: HIGH LEVELS OF BUREAUCRACY DETECTED', type: 'warning', timestamp: '16:40:25' },
        { text: 'SCANNING FOR LOGIC... ERROR: 404_LOGIC_NOT_FOUND', type: 'error', timestamp: '16:40:26' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [lines]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newLines: TerminalLine[] = [
            ...lines,
            { text: `> ${inputValue}`, type: 'input', timestamp: new Date().toLocaleTimeString() }
        ];

        setLines(newLines);
        setInputValue('');

        // Simulate system response
        setTimeout(() => {
            let response: TerminalLine;
            const cmd = inputValue.toLowerCase();

            if (cmd.includes('scan')) {
                response = { text: 'SCANNING NATIONAL REGISTERS... [PROGRESS: 12%]', type: 'info', timestamp: new Date().toLocaleTimeString() };
            } else if (cmd.includes('help')) {
                response = { text: 'AVAILABLE COMMANDS: SCAN, STATUS, LOGS, DECRYPT', type: 'info', timestamp: new Date().toLocaleTimeString() };
            } else {
                response = { text: `SYSTEM_REJECTION: COMMAND '${cmd.toUpperCase()}' NOT RECOGNIZED IN ANALOG MODE`, type: 'error', timestamp: new Date().toLocaleTimeString() };
            }

            setLines(prev => [...prev, response]);
        }, 500);
    };

    return (
        <div className="terminal-container" style={{
            background: 'rgba(5, 5, 5, 0.9)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            boxShadow: '0 0 20px rgba(255, 140, 0, 0.1)',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="terminal-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '15px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '10px',
                color: 'var(--accent)',
                fontSize: '12px',
                textTransform: 'uppercase'
            }}>
                <span>Terminal Diagnostyczny RP v1.0</span>
                <span>Status: ONLINE</span>
            </div>

            <div ref={terminalRef} className="terminal-body" style={{
                overflowY: 'auto',
                flex: 1,
                marginBottom: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                {lines.map((line, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            color: line.type === 'error' ? '#ff3333' :
                                line.type === 'success' ? '#00ff41' :
                                    line.type === 'warning' ? '#ff8c00' :
                                        line.type === 'input' ? '#ffffff' : '#888'
                        }}
                    >
                        <span style={{ opacity: 0.5, marginRight: '10px' }}>[{line.timestamp}]</span>
                        <span>{line.text}</span>
                    </motion.div>
                ))}
            </div>

            <form onSubmit={handleCommand} style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--accent)' }}>&gt;</span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'white',
                        flex: 1,
                        fontFamily: 'inherit'
                    }}
                    placeholder="Wpisz komendę..."
                />
            </form>

            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
                backgroundSize: '100% 4px',
                pointerEvents: 'none'
            }} />
        </div>
    );
};
