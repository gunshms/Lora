"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Founders() {
    const { dict } = useLanguage();

    return (
        <section className="relative w-full py-24 px-4 md:px-12 z-20 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-sm font-body tracking-[0.3em] uppercase mb-12 text-accent-gold">{dict.founders.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Founder 1 */}
                    <div className="glass-panel p-8 md:p-12 flex flex-col items-start gap-6 group hover:border-white/20 transition-colors">
                        <div className="w-24 h-24 bg-white/5 rounded-full mb-4 border border-white/10 overflow-hidden relative">
                            {/* Placeholder generic avatar */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-headline uppercase text-white mb-2">{dict.founders.gustavo.name}</h3>
                            <p className="text-xs font-body uppercase tracking-widest text-accent-gold">{dict.founders.gustavo.role}</p>
                        </div>
                        <p className="text-white/60 font-body text-sm leading-relaxed max-w-sm">
                            {dict.founders.gustavo.bio}
                        </p>
                    </div>

                    {/* Founder 2 */}
                    <div className="glass-panel p-8 md:p-12 flex flex-col items-start gap-6 group hover:border-white/20 transition-colors">
                        <div className="w-24 h-24 bg-white/5 rounded-full mb-4 border border-white/10 overflow-hidden relative">
                            {/* Placeholder generic avatar */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-headline uppercase text-white mb-2">{dict.founders.guilherme.name}</h3>
                            <p className="text-xs font-body uppercase tracking-widest text-accent-gold">{dict.founders.guilherme.role}</p>
                        </div>
                        <p className="text-white/60 font-body text-sm leading-relaxed max-w-sm">
                            {dict.founders.guilherme.bio}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
