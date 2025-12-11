"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function QuotePage() {
    const { dict } = useLanguage();

    return (
        <main className="min-h-screen bg-bg-base text-white pt-32 px-4 md:px-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 blur-[150px] pointer-events-none" />

            <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white/50 hover:text-white mb-12 transition-colors relative z-10">
                <ArrowLeft size={16} /> Voltar
            </Link>

            <div className="max-w-3xl mx-auto relative z-10">
                <h1 className="text-5xl md:text-7xl font-headline uppercase leading-none mb-4 text-white">
                    {dict.quote.title}
                </h1>
                <p className="text-lg font-body text-white/60 mb-12">
                    {dict.quote.subtitle}
                </p>

                <form className="space-y-6 glass-panel p-8 md:p-12 rounded-xl border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40">{dict.quote.form.name}</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-white focus:outline-none focus:border-accent-gold transition-colors font-body" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40">{dict.quote.form.email}</label>
                            <input type="email" className="w-full bg-white/5 border border-white/10 p-4 text-white focus:outline-none focus:border-accent-gold transition-colors font-body" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">{dict.quote.form.project}</label>
                        <textarea rows={5} className="w-full bg-white/5 border border-white/10 p-4 text-white focus:outline-none focus:border-accent-gold transition-colors font-body" />
                    </div>

                    <button type="submit" className="w-full bg-accent-gold text-black font-body uppercase text-sm tracking-widest py-4 hover:bg-white transition-colors">
                        {dict.quote.form.send}
                    </button>
                </form>
            </div>
        </main>
    )
}
