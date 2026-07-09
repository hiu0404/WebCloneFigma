import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 100, left: 0, behavior: 'auto' })
  }, [pathname, search])

  useEffect(() => {
    const scrollAfterInternalLink = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a[href]')
      if (!(link instanceof HTMLAnchorElement)) return

      const url = new URL(link.href)
      if (url.origin !== window.location.origin || url.hash) return

      window.setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }, 0)
    }

    document.addEventListener('click', scrollAfterInternalLink)
    return () => document.removeEventListener('click', scrollAfterInternalLink)
  }, [])

  return null
}
