import { CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
}

export default function NotificationModal({
    isOpen,
    onClose,
    title,
    message,
    type = "success"
}: NotificationModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-full max-w-sm bg-[#181818] border border-[#303030] rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 flex flex-col items-center text-center gap-4">
                            <div className={`p-4 rounded-full ${type === 'success' ? 'bg-green-500/10 text-green-500' :
                                    type === 'error' ? 'bg-red-500/10 text-red-500' :
                                        'bg-blue-500/10 text-blue-500'
                                }`}>
                                {type === 'success' && <CheckCircle className="w-8 h-8" />}
                                {type === 'error' && <XCircle className="w-8 h-8" />}
                                {type === 'info' && <CheckCircle className="w-8 h-8" />}
                            </div>

                            <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
                            <p className="text-sm text-neutral-400 font-mono leading-relaxed">
                                {message}
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-2.5 mt-4 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-mono text-xs font-bold transition-colors border border-white/5"
                            >
                                CONTINUE
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
