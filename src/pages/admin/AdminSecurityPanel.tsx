import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import {
  cancelTotpReset,
  confirmTotpReset,
  getAdminSecurityStatus,
  startTotpReset,
  type AdminSecurityStatus,
  type TotpResetStart,
} from '../../lib/adminAuthApi'

type ResetForm = {
  code: string
}

function formatDate(value: number | null) {
  if (!value) return 'Chua co'
  return new Date(value).toLocaleString()
}

export function AdminSecurityPanel() {
  const [status, setStatus] = useState<AdminSecurityStatus | null>(null)
  const [setup, setSetup] = useState<TotpResetStart | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const form = useForm<ResetForm>({ defaultValues: { code: '' } })
  const { register, handleSubmit, reset, formState: { errors } } = form

  async function reload() {
    setStatus(await getAdminSecurityStatus())
  }

  useEffect(() => {
    void reload().catch((err) => setMessage(err instanceof Error ? err.message : 'Khong tai duoc bao mat admin'))
  }, [])

  const sectionStyle: CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    background: '#fff',
  }
  const buttonStyle: CSSProperties = {
    border: '1px solid #111827',
    background: '#111827',
    color: '#fff',
    borderRadius: 10,
    padding: '9px 11px',
    cursor: busy ? 'not-allowed' : 'pointer',
    fontWeight: 700,
  }
  const secondaryButtonStyle: CSSProperties = {
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#111827',
    borderRadius: 10,
    padding: '9px 11px',
    cursor: busy ? 'not-allowed' : 'pointer',
    fontWeight: 700,
  }
  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    fontSize: 14,
  }

  const beginReset = async () => {
    if (!window.confirm('Reset Google Authenticator? Ma cu se bi thay the sau khi xac nhan ma moi.')) return
    setBusy(true)
    setMessage('')
    setRecoveryCodes(null)
    try {
      const next = await startTotpReset()
      setSetup(next)
      reset({ code: '' })
      await reload()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Khong reset duoc Google Authenticator')
    } finally {
      setBusy(false)
    }
  }

  const confirmReset = handleSubmit(async (values) => {
    setBusy(true)
    setMessage('')
    try {
      const result = await confirmTotpReset(values.code)
      setRecoveryCodes(result.recoveryCodes)
      setSetup(null)
      reset({ code: '' })
      await reload()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Ma xac thuc khong dung')
    } finally {
      setBusy(false)
    }
  })

  const cancelReset = async () => {
    setBusy(true)
    setMessage('')
    try {
      await cancelTotpReset()
      setSetup(null)
      reset({ code: '' })
      await reload()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Khong huy duoc reset')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Bao mat admin</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            JWT 12 gio · Recovery con lai: {status?.recoveryCodesRemaining ?? '-'} · TOTP cap nhat: {formatDate(status?.totpUpdatedAt ?? null)}
          </div>
        </div>
        <button type="button" disabled={busy} onClick={beginReset} style={buttonStyle}>
          Reset Google Authenticator
        </button>
      </div>

      {message ? <div style={{ color: '#b91c1c', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{message}</div> : null}

      {setup ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: '#f9fafb' }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Khoa thiet lap Google Authenticator</div>
            <code style={{ display: 'block', wordBreak: 'break-all', fontSize: 14, lineHeight: 1.6 }}>{setup.manualKey}</code>
          </div>
          <form onSubmit={(e) => void confirmReset(e)} style={{ display: 'grid', gap: 10 }}>
            <label style={{ display: 'block' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Ma 6 so tu app moi *</div>
              <input
                {...register('code', {
                  required: 'Vui long nhap ma 6 so',
                  pattern: { value: /^\d{6}$/, message: 'Ma xac thuc gom dung 6 so' },
                })}
                inputMode="numeric"
                maxLength={6}
                style={inputStyle}
              />
              {errors.code ? <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 6 }}>{errors.code.message}</div> : null}
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" disabled={busy} style={buttonStyle}>Xac nhan reset</button>
              <button type="button" disabled={busy} onClick={cancelReset} style={secondaryButtonStyle}>Huy</button>
            </div>
          </form>
        </div>
      ) : null}

      {recoveryCodes ? (
        <div style={{ marginTop: 14, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Recovery codes moi</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {recoveryCodes.map((code) => (
              <code key={code} style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
                {code}
              </code>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
