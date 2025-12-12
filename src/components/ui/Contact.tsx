"use client";

import { Instagram, Mail, Linkedin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

export default function Contact() {
    const { dict } = useLanguage();
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !message) return;

        // "Oi, meu nome é [Nome] e eu queria saber um orçamento sobre [Texto]"
        const text = `Oi, meu nome é ${name} e eu queria saber um orçamento sobre ${message}`;
        const url = `https://wa.me/5511964246388?text=${encodeURIComponent(text)}`;

        window.open(url, '_blank');
    };

    return (
        <footer className="relative w-full py-24 px-4 md:px-12 z-20 border-t border-white/10 bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-16">

                {/* Brand & Socials Section */}
                <div className="flex flex-col gap-8 lg:w-1/2">
                    <div>
                        <h2 className="text-6xl md:text-9xl font-headline uppercase leading-[0.8] tracking-tighter text-white/10 select-none">
                            LORA
                        </h2>
                        <p className="text-xs font-body uppercase tracking-widest text-white/40 mt-4">
                            {dict.contact.location}
                        </p>
                    </div>

                    <div className="flex gap-6 text-white/50 mt-auto">
                        <a href="https://instagram.com/prod.lora" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram size={24} /></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin size={24} /></a>
                        <a href="mailto:dumarq.prod@gmail.com" className="hover:text-white transition-colors"><Mail size={24} /></a>
                    </div>
                </div>

                {/* Budget Form Section */}
                <div className="lg:w-1/2 bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
                    <h3 className="text-3xl font-headline uppercase text-white mb-2">
                        {dict.quote.title}
                    </h3>
                    <p className="text-white/60 font-body text-sm mb-8">
                        {dict.quote.subtitle}
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-xs uppercase tracking-widest text-white/40">{dict.quote.form.name}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors font-body"
                                placeholder="Gusta Lora"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="message" className="text-xs uppercase tracking-widest text-white/40">{dict.quote.form.project}</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-accent-gold transition-colors font-body resize-none"
                                placeholder="Descreva sua ideia..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-4 bg-white text-black font-headline uppercase tracking-widest py-4 rounded hover:bg-accent-gold transition-colors"
                        >
                            {dict.quote.form.send}
                        </button>
                    </form>
                </div>

            </div>

            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-body uppercase tracking-widest text-white/20">
                <p>{dict.contact.rights}</p>
                <a href="mailto:dumarq.prod@gmail.com" className="hover:text-white transition-colors">dumarq.prod@gmail.com</a>
            </div>
        </footer>
    )
}
