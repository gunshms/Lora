"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { dictionary, Dictionary } from '@/constants/dictionary';

type Language = 'pt' | 'en';

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('pt');

    const value = {
        language,
        setLanguage,
        dict: dictionary[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
