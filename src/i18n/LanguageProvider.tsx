import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { LanguageContext, type Language } from './language'

function initialLanguage(): Language {
  try { return localStorage.getItem('ecolink-language') === 'en' ? 'en' : 'vi' } catch { return 'vi' }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem('ecolink-language', language) } catch { /* storage may be disabled */ }
  }, [language])

  const value = useMemo(() => ({ language, setLanguage }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
