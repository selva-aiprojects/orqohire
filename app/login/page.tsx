'use client'
import React, { useState } from 'react'
import { Eye, EyeOff, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Briefcase, Building2, User } from 'lucide-react'
import Link from 'next/link'

/* ── tiny reusable primitives ── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{children}</label>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 ' +
        'placeholder:text-slate-400 outline-none transition-all duration-200 ' +
        'focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 ' +
        (props.className ?? '')
      }
    />
  )
}

const demoAccounts = [
  { role: 'recruiter', email: 'admin@orqohire.com', label: 'Recruiter Admin', icon: <Briefcase size={13} />, accent: '#6366F1' },
  { role: 'client', email: 'client@company.com', label: 'Client SPOC', icon: <Building2 size={13} />, accent: '#0D9488' },
  { role: 'candidate', email: 'candidate@email.com', label: 'Candidate', icon: <User size={13} />, accent: '#F59E0B' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Invalid credentials. Please try again.'); setLoading(false); return }
      const role = data.data.user.role
      if (role === 'client_spoc') window.location.href = '/client/dashboard'
      else if (role === 'candidate') window.location.href = '/portal/dashboard'
      else window.location.href = '/recruiter/dashboard'
    } catch {
      setError('Network error. Please check your connection.')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── LEFT: Brand hero ── */}
      <div style={{
        width: '58%',
        background: 'linear-gradient(135deg, #0B132B 0%, #16223D 50%, #0B132B 100%)',
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
      }}>
        {/* ambient orbs */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(6,182,212,0.18)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-40px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(99,102,241,0.18)', filter: 'blur(100px)', pointerEvents: 'none' }} />

        {/* top bar */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="OrqoHire Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
            fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.8)',
          }}>
            <Sparkles size={11} style={{ color: '#06B6D4' }} />
            AI Recruitment Engine v2.0
          </span>
        </div>

        {/* hero copy */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '460px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '999px',
            background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
            fontSize: '10px', fontWeight: 800, color: '#38BDF8',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            Next-Gen Talent Acquisition
          </div>

          <h1 style={{
            fontSize: '44px', fontWeight: 900, lineHeight: 1.1,
            fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-1px',
            marginBottom: '16px',
          }}>
            Recruitment Intelligence,{' '}
            <span style={{ background: 'linear-gradient(90deg, #00D2FF, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Supercharged.
            </span>
          </h1>

          <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
            OrqoHire automates candidate shortlisting, pipeline tracking, and client collaboration with enterprise-grade precision.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { title: '99.4% AI Match Rate', desc: 'Instant candidate-JD compatibility scoring' },
              { title: 'Unified SPOC Portal', desc: 'Seamless client feedback loops' },
              { title: 'Automated Shortlists', desc: 'Eliminate manual screening bottlenecks' },
              { title: 'Enterprise Security', desc: 'SOC2 & role-based data encryption' },
            ].map(f => (
              <div key={f.title} style={{
                padding: '16px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'background 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <CheckCircle2 size={14} style={{ color: '#0EA5E9', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, paddingLeft: '22px' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#475569' }}>
          <span>© 2026 OrqoHire · A Whitekraaft Company</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/opportunities" style={{ color: '#475569', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>Browse Jobs</Link>
            <Link href="/register" style={{ color: '#475569', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>Candidate Portal</Link>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth panel ── */}
      <div style={{
        flex: 1,
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* heading */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>Sign in to access your workspace</p>
          </div>

          {/* error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 14px', borderRadius: '12px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#B91C1C', fontSize: '13px', fontWeight: 500,
              marginBottom: '20px',
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Field label="Work email">
              <TextInput
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
              />
            </Field>

            <Field label="Password">
              <div style={{ position: 'relative' }}>
                <TextInput
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex',
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: '6px' }}>
                <a href="#" style={{ fontSize: '12px', fontWeight: 600, color: '#0EA5E9' }}>Forgot password?</a>
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: loading ? '#94A3B8' : '#0F172A',
                color: '#fff', fontWeight: 700, fontSize: '14px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s, transform 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1E293B' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0F172A' }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 0.8s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign in to portal <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* dev quick login */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <ShieldCheck size={13} style={{ color: '#94A3B8' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dev quick login</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {demoAccounts.map(d => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword('Admin@123') }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: '10px',
                    background: '#fff', border: '1px solid #E2E8F0',
                    fontSize: '12px', fontWeight: 600, color: '#334155',
                    cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                    fontFamily: 'inherit', textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = d.accent; e.currentTarget.style.background = '#F8FAFC' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: d.accent }}>{d.icon}</span>
                    <span>{d.label}</span>
                    <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#94A3B8' }}>{d.email}</code>
                  </span>
                  <ArrowRight size={11} style={{ color: '#CBD5E1' }} />
                </button>
              ))}
            </div>
          </div>

          {/* sign up link */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', marginTop: '24px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ fontWeight: 700, color: '#0EA5E9' }}>
              Create candidate profile →
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}
