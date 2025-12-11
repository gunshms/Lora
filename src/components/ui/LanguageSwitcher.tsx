"use client";

import { useLanguage } from '@/context/LanguageContext';
import clsx from 'clsx';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="fixed top-8 right-8 z-[100] flex items-center gap-2 glass-panel rounded-full p-1 px-2 pointer-events-auto">
            <button
                onClick={() => setLanguage('pt')}
                className={clsx(
                    "text-[10px] font-body uppercase tracking-widest px-2 py-1 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/10",
                    language === 'pt' ? "bg-white text-black hover:bg-white" : "text-white/50 hover:text-white"
                )}
            >
                PT
            </button>
            <div className="w-[1px] h-3 bg-white/10" />
            <button
                onClick={() => setLanguage('en')}
                className={clsx(
                    "text-[10px] font-body uppercase tracking-widest px-2 py-1 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/10",
                    language === 'en' ? "bg-white text-black hover:bg-white" : "text-white/50 hover:text-white"
                )}
            >
                EN
            </button>
        </div>
    );
}
