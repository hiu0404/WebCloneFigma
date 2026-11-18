import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from './language'
import { localTranslation, needsMachineTranslation, normalizeTranslationKey } from './uiTranslations'

type OriginalValue = { source: string; applied: string }
type TranslationResponse = { translations?: Record<string, string> }

const translatedAttributes = ['placeholder', 'title', 'aria-label', 'alt'] as const
const skippedParents = 'script, style, noscript, textarea, input, select, option, [contenteditable], [data-no-translate]'
const skippedAttributeParents = 'script, style, noscript, [data-no-translate]'

function withOriginalSpacing(original: string, translated: string) {
  return `${original.match(/^\s*/u)?.[0] ?? ''}${translated}${original.match(/\s*$/u)?.[0] ?? ''}`
}

export function DocumentTranslator() {
  const { language } = useLanguage()
  const location = useLocation()
  const textValues = useRef(new WeakMap<Text, OriginalValue>())
  const attributeValues = useRef(new WeakMap<Element, Map<string, OriginalValue>>())
  const cache = useRef(new Map<string, string>())
  const failures = useRef(new Map<string, number>())

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return
    let cancelled = false
    let scanTimer: number | undefined
    let requestTimer: number | undefined
    let requesting = false
    const queue = new Set<string>()

    function translationFor(source: string) {
      const key = normalizeTranslationKey(source)
      return localTranslation(key) ?? cache.current.get(key)
    }

    function requestTranslation(source: string) {
      const key = normalizeTranslationKey(source)
      if (!key || !needsMachineTranslation(key)) return
      if ((failures.current.get(key) ?? 0) > Date.now()) return
      queue.add(key)
      if (requestTimer === undefined && !requesting) requestTimer = window.setTimeout(flushQueue, 30)
    }

    function applyText(node: Text) {
      const parent = node.parentElement
      if (!parent || parent.closest(skippedParents) || parent.closest('[hidden]')) return
      const current = node.data
      let value = textValues.current.get(node)
      if (!value || current !== value.applied) {
        value = { source: current, applied: current }
        textValues.current.set(node, value)
      }
      const source = normalizeTranslationKey(value.source)
      if (!source) return
      const translated = language === 'vi' ? value.source : translationFor(source)
      if (language === 'en' && translated === undefined) requestTranslation(source)
      if (translated === undefined) return
      const next = language === 'vi' ? value.source : withOriginalSpacing(value.source, translated)
      if (current !== next) node.data = next
      value.applied = next
    }

    function applyAttribute(element: Element, name: string) {
      if (element.closest(skippedAttributeParents) || element.closest('[hidden]')) return
      const current = element.getAttribute(name)
      if (current === null) return
      let values = attributeValues.current.get(element)
      if (!values) {
        values = new Map()
        attributeValues.current.set(element, values)
      }
      let value = values.get(name)
      if (!value || current !== value.applied) {
        value = { source: current, applied: current }
        values.set(name, value)
      }
      const source = normalizeTranslationKey(value.source)
      if (!source) return
      const translated = language === 'vi' ? value.source : translationFor(source)
      if (language === 'en' && translated === undefined) requestTranslation(source)
      if (translated === undefined) return
      if (current !== translated) element.setAttribute(name, translated)
      value.applied = translated
    }

    function scan() {
      if (cancelled) return
      document.querySelectorAll('[data-i18n-root]').forEach((root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        let node: Node | null
        while ((node = walker.nextNode())) applyText(node as Text)
        root.querySelectorAll('[placeholder], [title], [aria-label], [alt]').forEach((element) => {
          for (const name of translatedAttributes) applyAttribute(element, name)
        })
        for (const name of translatedAttributes) applyAttribute(root, name)
      })
      const title = document.querySelector('title')?.firstChild
      if (title?.nodeType === Node.TEXT_NODE) applyText(title as Text)
    }

    function scheduleScan() {
      if (scanTimer !== undefined) return
      scanTimer = window.setTimeout(() => { scanTimer = undefined; scan() }, 0)
    }

    async function flushQueue() {
      requestTimer = undefined
      if (cancelled || requesting || language !== 'en') return
      requesting = true
      try {
        while (!cancelled && queue.size > 0) {
          const texts = [...queue].slice(0, 20)
          texts.forEach((text) => queue.delete(text))
          try {
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: 'en', texts }),
            })
            if (!response.ok) throw new Error(`Translation request failed: ${response.status}`)
            const result = await response.json() as TranslationResponse
            for (const text of texts) {
              const translated = result.translations?.[text]
              if (translated) cache.current.set(text, translated)
              else failures.current.set(text, Date.now() + 60_000)
            }
            scheduleScan()
          } catch {
            texts.forEach((text) => failures.current.set(text, Date.now() + 60_000))
          }
        }
      } finally {
        requesting = false
      }
    }

    scan()
    const observer = new MutationObserver(scheduleScan)
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', ...translatedAttributes] })
    const headObserver = new MutationObserver(scheduleScan)
    headObserver.observe(document.head, { subtree: true, childList: true, characterData: true })
    return () => {
      cancelled = true
      observer.disconnect()
      headObserver.disconnect()
      if (scanTimer !== undefined) window.clearTimeout(scanTimer)
      if (requestTimer !== undefined) window.clearTimeout(requestTimer)
    }
  }, [language, location.pathname])

  return null
}
