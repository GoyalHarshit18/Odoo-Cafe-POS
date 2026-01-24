import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '../data/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    // Load language from local storage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('odoo-pos-language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('odoo-pos-language', lang);
    };

    const t = (key: TranslationKey): string => {
        const translation = translations[key];
        if (!translation) {
            console.warn(`Missing translation for key: ${key}`);
            return key;
        }
        return translation[language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
