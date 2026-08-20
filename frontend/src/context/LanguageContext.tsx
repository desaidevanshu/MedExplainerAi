import React, { createContext, useContext, useState, useEffect } from 'react'

export const LANGUAGES: Record<string, { label: string; native: string; prompt: string }> = {
    en: { label: 'English', native: 'English', prompt: 'Respond entirely in English.' },
    hi: { label: 'Hindi', native: 'हिंदी', prompt: 'Respond entirely in Hindi (हिंदी). Use Devanagari script for all explanations, summaries and questions.' },
    mr: { label: 'Marathi', native: 'मराठी', prompt: 'Respond entirely in Marathi (मराठी). Use Devanagari script for all explanations, summaries and questions.' },
    gu: { label: 'Gujarati', native: 'ગુજરાતી', prompt: 'Respond entirely in Gujarati (ગુજરાતી). Use Gujarati script for all content.' },
    ta: { label: 'Tamil', native: 'தமிழ்', prompt: 'Respond entirely in Tamil (தமிழ்). Use Tamil script for all content.' },
    te: { label: 'Telugu', native: 'తెలుగు', prompt: 'Respond entirely in Telugu (తెలుగు). Use Telugu script for all content.' },
    bn: { label: 'Bengali', native: 'বাংলা', prompt: 'Respond entirely in Bengali (বাংলা). Use Bengali script for all content.' },
    fr: { label: 'French', native: 'Français', prompt: 'Respond entirely in French.' },
    de: { label: 'German', native: 'Deutsch', prompt: 'Respond entirely in German.' },
    es: { label: 'Spanish', native: 'Español', prompt: 'Respond entirely in Spanish.' },
    ar: { label: 'Arabic', native: 'العربية', prompt: 'Respond entirely in Arabic. Use Arabic script and right-to-left conventions.' },
}

const STORAGE_KEY = 'medexplain_language'

interface LanguageContextType {
    language: string
    setLanguage: (lang: string) => void
    langConfig: typeof LANGUAGES['en']
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    langConfig: LANGUAGES['en'],
})

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY) || 'en'
    })

    const setLanguage = (lang: string) => {
        localStorage.setItem(STORAGE_KEY, lang)
        setLanguageState(lang)
    }

    const langConfig = LANGUAGES[language] || LANGUAGES['en']

    return (
        <LanguageContext.Provider value={{ language, setLanguage, langConfig }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
