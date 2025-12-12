"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { useEffect } from "react";

export type ClientData = {
    id: string;
    name: string;
    logo: string;
    description: string;
    metrics?: string[];
};

interface ClientModalProps {
    client: ClientData | null;
    layoutId?: string; // Derived from the specific clicked instance
    onClose: () => void;
}

export default function ClientModal({ client, layoutId, onClose }: ClientModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!client) return null;

    return (
        <AnimatePresence>
            {client && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-pointer"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()} // Prevent click through
                            className="bg-[#0a0a0a]/90 border border-white/10 rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl overflow-hidden"
                            style={{
                                boxShadow: "0 0 50px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)"
                            }}
                        >
                            {/* Glass Reflection Effect */}
                            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Logo Section */}
                                <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 bg-white/5 rounded-xl flex items-center justify-center p-4 border border-white/10">
                                    <motion.div
                                        className="relative w-full h-full"
                                        layoutId={layoutId || `client-logo-${client.id}`}
                                    >
                                        <Image
                                            src={client.logo}
                                            alt={client.name}
                                            fill
                                            className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                        />
                                    </motion.div>
                                </div>

                                {/* Content Section */}
                                <div className="text-center md:text-left">
                                    <motion.h3
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-2xl md:text-3xl font-headline font-bold text-white mb-2"
                                    >
                                        {client.name}
                                    </motion.h3>

                                    <div className="w-12 h-[1px] bg-gradient-to-r from-accent-gold to-transparent mx-auto md:mx-0 mb-4" />

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-white/80 font-body leading-relaxed text-sm md:text-base"
                                    >
                                        {client.description}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
