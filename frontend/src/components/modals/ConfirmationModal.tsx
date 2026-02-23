import { AlertTriangle, Trash } from "lucide-react";
import Modal from "./Modal";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    {isDestructive && (
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500 shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <p className="text-sm text-neutral-400 font-mono leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#303030]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-xs font-mono font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors ${isDestructive
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                            }`}
                    >
                        {isDestructive && <Trash className="w-3.5 h-3.5" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
