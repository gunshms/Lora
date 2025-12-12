"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
    const { dict } = useLanguage();
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !message) return;

        const text = `Oi, meu nome é ${name} e eu queria saber um orçamento sobre ${message}`;
        // Using the user provided number: +55 11 964246388
        const url = `https://wa.me/5511964246388?text=${encodeURIComponent(text)}`;

        window.open(url, '_blank');
        onClose(); // Optional: close modal after sending
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center px-4 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl z-[1000000]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8 text-center">
                            <h3 className="text-2xl md:text-3xl font-headline uppercase text-white mb-2">
                                {dict.quote.title}
                            </h3>
                            <p className="text-white/60 font-body text-xs md:text-sm">
                                {dict.quote.subtitle}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="modal-name" className="text-xs uppercase tracking-widest text-white/40">{dict.quote.form.name}</label>
                                <input
                                    type="text"
                                    id="modal-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent-gold transition-colors font-body"
                                    placeholder="Gusta Lora"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="modal-message" className="text-xs uppercase tracking-widest text-white/40">{dict.quote.form.project}</label>
                                <textarea
                                    id="modal-message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-accent-gold transition-colors font-body resize-none"
                                    placeholder="Descreva sua ideia..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full bg-white text-black font-headline uppercase tracking-widest py-4 rounded-lg hover:bg-accent-gold transition-colors"
                            >
                                {dict.quote.form.send}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
