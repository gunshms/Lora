"use client";

import { Instagram, Mail, Linkedin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Contact() {
    const { dict } = useLanguage();

    return (
        <footer className="relative w-full py-24 px-4 md:px-12 z-20 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                <div className="flex flex-col gap-4">
                    <h2 className="text-8xl md:text-[10rem] font-headline uppercase leading-[0.8] tracking-tighter text-white/10 select-none">
                        LORA
                    </h2>
                    <p className="text-xs font-body uppercase tracking-widest text-white/40">
                        {dict.contact.location}
                    </p>
                </div>

                <div className="flex flex-col gap-8 text-right">
                    <a href="mailto:dumarq.prod@gmail.com" className="text-xl md:text-3xl font-headline uppercase hover:text-accent-gold transition-colors">
                        dumarq.prod@gmail.com
                    </a>

                    <div className="flex justify-end gap-6 text-white/50">
                        <a href="https://instagram.com/prod.lora" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
                        <a href="mailto:dumarq.prod@gmail.com" className="hover:text-white transition-colors"><Mail size={20} /></a>
                    </div>

                    <p className="text-[10px] font-body uppercase tracking-widest text-white/20 mt-8">
                        {dict.contact.rights}
                    </p>
                </div>
            </div>
        </footer>
    )
}
