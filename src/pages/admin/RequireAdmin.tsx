import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAdminSession, type AdminSession } from '../../lib/adminAuthApi'

export function RequireAdmin() {
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [session, setSession] = useState<AdminSession | null>(null)

  useEffect(() => {
    let alive = true
    let expireTimer: number | undefined

    async function verify() {
      const current = await getAdminSession()
      if (!alive) return
      setSession(current)
      setChecking(false)

      window.clearTimeout(expireTimer)
      if (current?.expiresAt) {
        const msUntilExpire = Math.max(current.expiresAt - Date.now(), 0)
        expireTimer = window.setTimeout(() => {
          if (alive) setSession(null)
        }, msUntilExpire + 250)
      }
    }

    void verify()
    const interval = window.setInterval(() => {
      void verify()
    }, 60_000)

    return () => {
      alive = false
      window.clearInterval(interval)
      window.clearTimeout(expireTimer)
    }
  }, [])

  if (checking) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 16 }}>
        Dang kiem tra quyen admin...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
