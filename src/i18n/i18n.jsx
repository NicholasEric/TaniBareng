import { createContext, useContext, useMemo, useState } from 'react'
import { dict } from './translations.js'
import { setLocale } from '../lib/format.js'

export const LANGS = [
  { code: 'id', label: 'ID', name: 'Bahasa Indonesia' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ja', label: '日本語', name: '日本語' },
]

const LangCtx = createContext(null)
const LS_KEY = 'tanibareng.lang'

function loadLang() {
  try {
    const v = localStorage.getItem(LS_KEY)
    if (v && dict[v]) return v
  } catch {
    /* ignore */
  }
  return 'id'
}

function makeT(lang) {
  const table = dict[lang] || dict.id
  return (key, vars) => {
    let s = table[key] ?? dict.en[key] ?? dict.id[key] ?? key
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k])
    return s
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(loadLang)

  // Keep the formatter locale in sync synchronously so dates/numbers render
  // in the right locale on the same pass children render.
  setLocale(lang)

  const setLang = (l) => {
    if (!dict[l]) return
    setLocale(l)
    setLangState(l)
    try {
      localStorage.setItem(LS_KEY, l)
    } catch {
      /* ignore */
    }
  }

  const t = useMemo(() => makeT(lang), [lang])
  const value = useMemo(() => ({ lang, setLang, t, langs: LANGS }), [lang, t])

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang() {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

export function useT() {
  return useLang().t
}
