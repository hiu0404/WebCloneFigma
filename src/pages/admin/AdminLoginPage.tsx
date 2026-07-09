import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { completeAdminLogin, getAdminSession, startAdminLogin } from '../../lib/adminAuthApi'

type LoginForm = {
  email: string
  password: string
  totp: string
}

type LoginStep = 'credentials' | 'totp'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/products'
  const [checking, setChecking] = useState(true)
  const [alreadyAuthed, setAlreadyAuthed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<LoginStep>('credentials')
  const [challengeId, setChallengeId] = useState('')
  const [loginEmail, setLoginEmail] = useState('')

  const form = useForm<LoginForm>({
    shouldUnregister: true,
    defaultValues: { email: '', password: '', totp: '' },
  })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = form

  useEffect(() => {
    let alive = true
    getAdminSession()
      .then((session) => {
        if (!alive) return
        setAlreadyAuthed(Boolean(session))
      })
      .finally(() => {
        if (alive) setChecking(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const cardStyle: CSSProperties = useMemo(
    () => ({
      width: 'min(440px, 100%)',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 18,
      boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
      background: '#fff',
    }),
    [],
  )
  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '11px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    fontSize: 14,
    outline: 'none',
  }
  const labelStyle: CSSProperties = { display: 'block', marginBottom: 12 }
  const labelTextStyle: CSSProperties = { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }
  const errorStyle: CSSProperties = { color: '#b91c1c', fontSize: 13, fontWeight: 700, marginBottom: 10 }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
        <div style={cardStyle}>Dang kiem tra phien dang nhap...</div>
      </div>
    )
  }

  if (alreadyAuthed) return <Navigate to={from} replace />

  const goBackToCredentials = () => {
    setStep('credentials')
    setChallengeId('')
    setLoginEmail('')
    clearErrors()
    reset({ email: '', password: '', totp: '' })
  }

  const onSubmit = handleSubmit(async (data) => {
    clearErrors('root')
    setBusy(true)
    try {
      if (step === 'credentials') {
        const email = data.email.trim().toLowerCase()
        const result = await startAdminLogin(email, data.password)
        setChallengeId(result.challengeId)
        setLoginEmail(email)
        setStep('totp')
        reset({ email: '', password: '', totp: '' })
        return
      }

      await completeAdminLogin(challengeId, data.totp)
      navigate(from, { replace: true })
    } catch (err) {
      setError('root', {
        type: 'server',
        message: err instanceof Error ? err.message : 'Dang nhap khong thanh cong',
      })
    } finally {
      setBusy(false)
    }
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: '#f8fafc',
      }}
    >
      <form style={cardStyle} onSubmit={onSubmit}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Admin dang nhap</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 16 }}>
          {step === 'credentials'
            ? 'Nhap email va mat khau admin de tiep tuc.'
            : `Nhap ma 6 so trong Google Authenticator hoac recovery code cho ${loginEmail}.`}
        </div>

        {step === 'credentials' ? (
          <>
            <label style={labelStyle}>
              <div style={labelTextStyle}>Email admin *</div>
              <input
                {...register('email', {
                  required: 'Vui long nhap email admin',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email khong hop le' },
                })}
                autoComplete="username"
                inputMode="email"
                placeholder="admin@example.com"
                style={inputStyle}
              />
              {errors.email ? <div style={{ ...errorStyle, marginTop: 6, marginBottom: 0 }}>{errors.email.message}</div> : null}
            </label>

            <label style={labelStyle}>
              <div style={labelTextStyle}>Mat khau *</div>
              <input
                {...register('password', { required: 'Vui long nhap mat khau' })}
                type="password"
                autoComplete="current-password"
                style={inputStyle}
              />
              {errors.password ? (
                <div style={{ ...errorStyle, marginTop: 6, marginBottom: 0 }}>{errors.password.message}</div>
              ) : null}
            </label>
          </>
        ) : (
          <label style={labelStyle}>
            <div style={labelTextStyle}>Ma Google Authenticator *</div>
            <input
              {...register('totp', {
                required: 'Vui long nhap ma xac thuc',
                validate: (value) => {
                  const trimmed = value.trim()
                  const recovery = trimmed.toUpperCase().replace(/[^A-Z2-9]/g, '')
                  return /^\d{6}$/.test(trimmed) || recovery.length === 12 || 'Nhap ma 6 so hoac recovery code'
                },
              })}
              autoComplete="one-time-code"
              maxLength={19}
              placeholder="123456 hoac ABCD-EFGH-IJKL"
              style={{ ...inputStyle, fontWeight: 800 }}
            />
            {errors.totp ? <div style={{ ...errorStyle, marginTop: 6, marginBottom: 0 }}>{errors.totp.message}</div> : null}
          </label>
        )}

        {errors.root?.message ? <div style={errorStyle}>{errors.root.message}</div> : null}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%',
            padding: '11px 12px',
            borderRadius: 10,
            border: '1px solid #111827',
            background: busy ? '#4b5563' : '#111827',
            color: '#fff',
            fontWeight: 800,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? 'Dang xu ly...' : step === 'credentials' ? 'Tiep tuc' : 'Xac thuc va dang nhap'}
        </button>

        {step === 'totp' ? (
          <button
            type="button"
            disabled={busy}
            onClick={goBackToCredentials}
            style={{
              width: '100%',
              padding: '10px 12px',
              marginTop: 10,
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#111827',
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            Doi email hoac mat khau
          </button>
        ) : null}
      </form>
    </div>
  )
}
