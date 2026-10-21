import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// A GA4 Measurement ID is public in the browser bundle. Allow deployments to override it.
const measurementId = String(import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-JF10P3GNXS').trim()
const isConfigured = import.meta.env.PROD && /^G-[A-Z0-9]+$/i.test(measurementId)

let initialized = false
let lastTrackedLocation = ''

const gtag: (...args: unknown[]) => void = function () {
  const analyticsWindow = window as Window & { dataLayer?: unknown[] }
  analyticsWindow.dataLayer ??= []
  // gtag.js expects the function's Arguments object, not a plain array.
  // eslint-disable-next-line prefer-rest-params
  analyticsWindow.dataLayer.push(arguments)
}

function initializeAnalytics() {
  if (initialized) return
  initialized = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)

  gtag('js', new Date())
  // React Router sends page views below. Disable the initial automatic view.
  gtag('config', measurementId, { send_page_view: false })
}

export function GoogleAnalytics() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (!isConfigured) return

    // Never collect admin/login pages.
    if (pathname.startsWith('/admin')) {
      lastTrackedLocation = ''
      return
    }
    // Redirect targets should count once, not once for each URL in the chain.
    if (pathname === '/san-pham-chi-tiet' || pathname === '/san-pham') return

    initializeAnalytics()
    const pageLocation = `${window.location.origin}${pathname}${search}`
    const timeout = window.setTimeout(() => {
      if (pageLocation === lastTrackedLocation) return

      gtag('event', 'page_view', {
        send_to: measurementId,
        page_title: document.title,
        page_location: pageLocation,
        page_referrer: lastTrackedLocation || document.referrer,
      })
      lastTrackedLocation = pageLocation
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [pathname, search])

  return null
}
