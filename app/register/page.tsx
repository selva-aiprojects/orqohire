'use client'
import React, { useState } from 'react'
import { Sparkles, CheckCircle2, ArrowLeft, Eye, EyeOff, AlertTriangle, ArrowRight, User, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display:'block', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'#64748B', marginBottom:'7px' }}>{children}</label>
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  const { icon, ...rest } = props
  return (
    <div style={{ position:'relative' }}>
      {icon && (
        <div style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}>
          {icon}
        </div>
      )}
      <input
        {...rest}
        style={{
          width:'100%',
          padding: icon ? '11px 14px 11px 38px' : '11px 14px',
          borderRadius:'10px',
          border:'1px solid #E2E8F0',
          background:'#fff',
          fontSize:'14px',
          color:'#0F172A',
          outline:'none',
          fontFamily:'inherit',
          transition:'border-color 0.2s, box-shadow 0.2s',
          boxSizing:'border-box',
          ...rest.style,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#0F172A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)' }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [showCp, setShowCp]   = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const data = await res.json()
      if (!data.success) { setError(data.error); setLoading(false); return }
      setDone(true)
      setTimeout(() => window.location.href = '/portal/dashboard', 1500)
    } catch {
      setError('Registration failed. Please check your connection.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #0B132B, #16223D)', fontFamily:'Inter, sans-serif' }}>
        <div style={{ background:'#fff', borderRadius:'20px', padding:'48px 40px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle2 size={32} style={{ color:'#059669' }} />
          </div>
          <h2 style={{ fontSize:'22px', fontWeight:800, fontFamily:'Space Grotesk, sans-serif', color:'#0F172A', marginBottom:'10px' }}>Welcome to OrqoHire!</h2>
          <p style={{ fontSize:'14px', color:'#64748B', lineHeight:1.6 }}>Your candidate account has been created. Redirecting you to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>

      {/* ── LEFT: Perks panel ── */}
      <div style={{
        width:'42%',
        background:'linear-gradient(135deg, #0B132B 0%, #131F37 50%, #0F172A 100%)',
        padding:'48px 48px',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        position:'relative',
        overflow:'hidden',
        color:'#fff',
      }}>
        {/* ambient orb */}
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,90,54,0.18)', filter:'blur(90px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(99,102,241,0.15)', filter:'blur(80px)', pointerEvents:'none' }} />

        {/* top nav */}
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:700, color:'#94A3B8', transition:'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='#fff'}
            onMouseLeave={e => e.currentTarget.style.color='#94A3B8'}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
          <span style={{ fontSize:'11px', fontWeight:800, color:'#FF7A5C', textTransform:'uppercase', letterSpacing:'0.1em' }}>Candidate Profile</span>
        </div>

        {/* hero content */}
        <div style={{ position:'relative', zIndex:1, maxWidth:'380px' }}>
          <div style={{
            width:'48px', height:'48px', borderRadius:'14px',
            background:'linear-gradient(135deg, #FF5A36, #E04825)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 24px rgba(255,90,54,0.4)',
            marginBottom:'24px',
          }}>
            <Sparkles size={22} style={{ color:'#fff' }} />
          </div>

          <h1 style={{
            fontSize:'36px', fontWeight:900, lineHeight:1.1,
            fontFamily:'Space Grotesk, sans-serif', letterSpacing:'-0.8px',
            marginBottom:'14px',
          }}>
            Accelerate Your Career<br />with AI Matching
          </h1>

          <p style={{ color:'#94A3B8', fontSize:'14px', lineHeight:1.65, marginBottom:'32px' }}>
            Join OrqoHire&apos;s elite talent pool. Get discovered by top recruiters and client organizations hiring for high-growth roles.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              'One-click profile submission to active requisitions',
              'Real-time interview pipeline status tracking',
              'Direct communication with hiring managers',
              'AI skill enhancement recommendations',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <CheckCircle2 size={16} style={{ color:'#FF5A36', flexShrink:0 }} />
                <span style={{ fontSize:'13px', color:'#CBD5E1', lineHeight:1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ position:'relative', zIndex:1, fontSize:'12px', color:'#334155' }}>
          © 2026 OrqoHire · A Whitekraaft Company
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div style={{
        flex:1,
        background:'#F8FAFC',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        padding:'48px 48px',
      }}>
        <div style={{ width:'100%', maxWidth:'420px' }}>

          <div style={{ marginBottom:'32px' }}>
            <h2 style={{ fontSize:'26px', fontWeight:800, fontFamily:'Space Grotesk, sans-serif', color:'#0F172A', letterSpacing:'-0.5px', marginBottom:'6px' }}>
              Create Candidate Account
            </h2>
            <p style={{ fontSize:'14px', color:'#64748B' }}>Fill in your details below to set up your profile</p>
          </div>

          {error && (
            <div style={{
              display:'flex', alignItems:'flex-start', gap:'10px',
              padding:'12px 14px', borderRadius:'12px',
              background:'#FEF2F2', border:'1px solid #FECACA',
              color:'#B91C1C', fontSize:'13px', fontWeight:500,
              marginBottom:'20px',
            }}>
              <AlertTriangle size={15} style={{ flexShrink:0, marginTop:'1px' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <Label>Full Name</Label>
              <TextInput
                type="text"
                placeholder="e.g. Alex Rivera"
                icon={<User size={15} />}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <TextInput
                type="email"
                placeholder="alex.rivera@example.com"
                icon={<Mail size={15} />}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div>
                <Label>Password</Label>
                <div style={{ position:'relative' }}>
                  <TextInput
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 chars"
                    icon={<Lock size={15} />}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ paddingRight:'38px' }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', display:'flex' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <Label>Confirm Password</Label>
                <div style={{ position:'relative' }}>
                  <TextInput
                    type={showCp ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    icon={<Lock size={15} />}
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    required
                    style={{ paddingRight:'38px' }}
                  />
                  <button type="button" onClick={() => setShowCp(!showCp)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', display:'flex' }}>
                    {showCp ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop:'8px',
                width:'100%', padding:'13px', borderRadius:'12px',
                background: loading ? '#94A3B8' : 'linear-gradient(135deg, #FF5A36, #E04825)',
                color:'#fff', fontWeight:700, fontSize:'14px',
                border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                transition:'opacity 0.2s',
                fontFamily:'inherit',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,90,54,0.35)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.92' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? (
                <>
                  <svg style={{ animation:'spin 0.8s linear infinite', width:16, height:16 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating Account…
                </>
              ) : (
                <>Get Started <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#64748B', marginTop:'24px', paddingTop:'20px', borderTop:'1px solid #E2E8F0' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ fontWeight:700, color:'#FF5A36' }}>
              Sign In Here →
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}