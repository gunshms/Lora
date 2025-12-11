"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Manifesto() {
    const { dict } = useLanguage();

    return (
        <section className="relative w-full py-40 px-4 md:px-12 z-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-accent-blue/5 blur-[100px] pointer-events-none" />
            <div className="max-w-4xl mx-auto relative z-10">
                <p className="text-xs font-body uppercase tracking-[0.5em] text-white/50 mb-8">{dict.manifesto.label}</p>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-headline uppercase leading-[0.9] text-white mix-blend-screen">
                    {dict.manifesto.headline}
                    <br />
                    <span className="text-white/30 italic">{dict.manifesto.subheadline}</span>
                </h2>
                <div className="w-24 h-[1px] bg-accent-gold mx-auto my-12" />
                <p className="text-lg md:text-xl font-body text-white/70 max-w-2xl mx-auto leading-relaxed">
                    {dict.manifesto.text}
                </p>
            </div>
        </section>
    )
}
