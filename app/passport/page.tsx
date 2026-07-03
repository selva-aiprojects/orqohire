'use client'
import React, { useState, useEffect } from 'react'
import { Card, Badge, Button, Input } from '@/components/ui'
import { User, Building2, ShieldCheck, CheckCircle2, Clock, Copy, X, Plus, ArrowLeft, ArrowUpRight, Sparkles, Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { variant: 'neutral' | 'warning' | 'success' | 'info', label: string }> = {
  DRAFT:    { variant: 'neutral', label: 'Draft Profile' },
  PARTIAL:  { variant: 'warning', label: 'Partially Verified' },
  COMPLETE: { variant: 'success', label: 'Complete Passport' },
  VERIFIED: { variant: 'info',    label: 'Fully Verified' },
}

export default function PassportPage() {
  const [candidateId, setCandidateId] = useState('CAN-0001')
  const [passport, setPassport]       = useState<any>(null)
  const [employment, setEmployment]   = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [addingEmp, setAddingEmp]     = useState(false)
  const [requestingVrf, setReqVrf]    = useState<string | null>(null)
  const [vrfLink, setVrfLink]         = useState<string | null>(null)
  const [showAddEmp, setShowAddEmp]   = useState(false)
  const [tab, setTab]                 = useState<'profile' | 'employment' | 'verification'>('profile')

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', currentRole: '', totalExperience: '',
    skills: '', location: '', noticePeriod: '', linkedinUrl: '', resumeLink: '', consentGiven: false,
  })

  const [empForm, setEmpForm] = useState({
    companyName: '', designation: '', employmentType: 'Full-time',
    startDate: '', endDate: '', officialEmail: '', isCurrent: false,
  })

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch(`/api/passport?candidateId=${candidateId}`)
      const data = await res.json()
      if (data.success) {
        if (data.data.passport) { setPassport(data.data.passport); setForm({ ...form, ...data.data.passport }) }
        setEmployment(data.data.employment || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [candidateId])

  async function savePassport() {
    setSaving(true)
    try {
      const res  = await fetch('/api/passport', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert_passport', candidateId, data: form })
      })
      const data = await res.json()
      if (data.success) await load()
      else alert(data.error)
    } catch {
      alert('Error saving passport data.')
    }
    setSaving(false)
  }

  async function addEmploymentRecord() {
    setAddingEmp(true)
    try {
      const res  = await fetch('/api/passport', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_employment', candidateId, data: empForm })
      })
      const data = await res.json()
      if (data.success) {
        await load()
        setShowAddEmp(false)
        setEmpForm({ companyName: '', designation: '', employmentType: 'Full-time', startDate: '', endDate: '', officialEmail: '', isCurrent: false })
      } else alert(data.error)
    } catch {
      alert('Failed to add employment record.')
    }
    setAddingEmp(false)
  }

  async function requestVerification(empId: string, employerEmail: string) {
    if (!employerEmail) { alert('No official employer email on record for verification'); return }
    setReqVrf(empId)
    try {
      const res  = await fetch('/api/passport', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_verification', candidateId, employmentId: empId, employerEmail })
      })
      const data = await res.json()
      if (data.success) setVrfLink(`${window.location.origin}/verify/${data.data.token}`)
      else alert(data.error)
    } catch {
      alert('Error generating verification link.')
    }
    setReqVrf(null)
  }

  const sc = STATUS_CONFIG[passport?.passportStatus || 'DRAFT']

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-coral border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16 selection:bg-coral selection:text-white">
      {/* Navbar */}
      <nav className="h-16 px-6 sm:px-12 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-white/10 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="OrqoHire Logo" className="h-10 w-auto object-contain" />
          <span className="text-[10px] text-coral font-bold tracking-widest uppercase hidden sm:block border-l border-white/10 pl-3">Verified Passport</span>
        </div>
        <Link href="/portal/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors">
          <ArrowLeft size={15} /> Return to Portal Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-8">
        {/* Hero Passport Badge Card */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#131F37] to-[#1E293B] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-coral/20 blur-[100px] pointer-events-none animate-glow" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-coral to-amber-500 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg">
                {passport?.fullName?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Universal Digital Passport</span>
                  <Badge variant={sc.variant}>{sc.label}</Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">{passport?.fullName || 'Candidate Profile'}</h1>
                <p className="text-slate-300 text-sm mt-0.5">{passport?.currentRole || 'Designation Not Specified'}</p>
              </div>
            </div>

            {/* Trust Score & Metrics */}
            <div className="grid grid-cols-3 gap-4 bg-white/[0.06] border border-white/10 rounded-xl p-4 shrink-0">
              <div className="text-center px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> Trust Score
                </p>
                <p className="text-2xl font-black font-heading text-emerald-400 mt-0.5">{passport?.trustScore || 0}/100</p>
              </div>
              <div className="text-center border-x border-white/10 px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Jobs</p>
                <p className="text-2xl font-black font-heading text-white mt-0.5">
                  {employment.filter(e => e.verificationStatus === 'VERIFIED').length}
                </p>
              </div>
              <div className="text-center px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion</p>
                <p className="text-2xl font-black font-heading text-coral mt-0.5">{passport?.completionPercent || 0}%</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 relative z-10">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
              <span>Profile Progress</span>
              <span>{passport?.completionPercent || 0}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-coral to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${passport?.completionPercent || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-200/70 rounded-xl max-w-md">
          {[
            { key: 'profile', icon: <User size={15} />, label: 'Personal Details' },
            { key: 'employment', icon: <Building2 size={15} />, label: 'Work History' },
            { key: 'verification', icon: <ShieldCheck size={15} />, label: 'Verifications' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === key
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE */}
        {tab === 'profile' && (
          <Card className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-navy font-heading">Core Profile Specification</h3>
              <p className="text-xs text-muted">Update your contact information, compensation preferences, and skills.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Full Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} icon={<User size={16} />} />
              <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} icon={<Mail size={16} />} />
              <Input label="Phone Number" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} icon={<Phone size={16} />} />
              <Input label="Current Role Title" value={form.currentRole} onChange={e => setForm({ ...form, currentRole: e.target.value })} icon={<Briefcase size={16} />} />
              <Input label="Total Experience (Yrs)" value={form.totalExperience} onChange={e => setForm({ ...form, totalExperience: e.target.value })} />
              <Input label="Current Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} icon={<MapPin size={16} />} />
              <Input label="Notice Period (Days)" value={form.noticePeriod} onChange={e => setForm({ ...form, noticePeriod: e.target.value })} />
              <Input label="LinkedIn Profile URL" type="url" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} />
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Technical & Leadership Skills</label>
                <textarea
                  placeholder="React, TypeScript, Python, Strategic Planning..."
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 border border-border rounded-xl text-sm text-navy outline-none focus:border-coral focus:ring-4 focus:ring-coral/10 min-h-[90px]"
                />
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-border flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={form.consentGiven}
                  onChange={e => setForm({ ...form, consentGiven: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-coral rounded"
                />
                <label htmlFor="consent" className="text-xs text-navy font-medium cursor-pointer leading-relaxed">
                  I explicitly consent to OrqoHire sharing my verified digital passport credentials with authorized client hiring managers for active job applications.
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={savePassport} loading={saving} size="lg">Save Profile Changes</Button>
            </div>
          </Card>
        )}

        {/* TAB 2: EMPLOYMENT */}
        {tab === 'employment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy font-heading">Employment Timeline</h3>
                <p className="text-xs text-muted">Add your professional work history to request third-party employer verifications.</p>
              </div>
              <Button onClick={() => setShowAddEmp(true)} size="sm">
                <Plus size={15} /> Record Work History
              </Button>
            </div>

            {employment.length === 0 ? (
              <Card className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-muted">
                  <Building2 size={26} />
                </div>
                <h4 className="text-base font-bold text-navy">No Employment Records</h4>
                <p className="text-xs text-muted max-w-sm mx-auto">Click 'Record Work History' above to add past roles and increase your candidate Trust Score.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {employment.map(emp => {
                  const vrfStyles: Record<string, { variant: 'neutral' | 'warning' | 'success' | 'error', label: string }> = {
                    NOT_REQUESTED: { variant: 'neutral', label: 'Unverified' },
                    PENDING:       { variant: 'warning', label: 'Pending HR Review' },
                    VERIFIED:      { variant: 'success', label: 'Verified by Employer' },
                    REJECTED:      { variant: 'error',   label: 'Verification Disputed' },
                  }
                  const vc = vrfStyles[emp.verificationStatus] || vrfStyles.NOT_REQUESTED
                  return (
                    <Card key={emp.id} hover className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-navy font-heading">{emp.designation}</h4>
                          <Badge variant={vc.variant}>{vc.label}</Badge>
                        </div>
                        <p className="text-sm font-semibold text-muted">{emp.companyName} &middot; <span className="text-xs text-slate-400 font-normal">{emp.employmentType}</span></p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock size={12} /> {emp.startDate} &mdash; {emp.isCurrent ? 'Present Role' : emp.endDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {emp.verificationStatus === 'NOT_REQUESTED' && emp.officialEmail && (
                          <Button size="sm" variant="outline" onClick={() => requestVerification(emp.id, emp.officialEmail)} disabled={requestingVrf === emp.id}>
                            {requestingVrf === emp.id ? 'Sending Link...' : 'Request Verification'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VERIFICATION */}
        {tab === 'verification' && (
          <Card className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-navy font-heading">Verification Control Center</h3>
              <p className="text-xs text-muted">Manage employer attestation links sent to HR departments.</p>
            </div>

            {vrfLink && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Secure Employer Verification Link Generated</span>
                </div>
                <p className="text-xs text-emerald-700">Send this cryptographic link to your supervisor or HR representative to verify your employment:</p>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                  <code className="text-xs font-mono text-emerald-600 truncate">{vrfLink}</code>
                  <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(vrfLink)}>
                    <Copy size={13} /> Copy Link
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {employment.map(emp => {
                const vrfStyles: Record<string, { variant: 'neutral' | 'warning' | 'success' | 'error', label: string }> = {
                  NOT_REQUESTED: { variant: 'neutral', label: 'Unverified' },
                  PENDING:       { variant: 'warning', label: 'Pending HR Review' },
                  VERIFIED:      { variant: 'success', label: 'Verified by Employer' },
                  REJECTED:      { variant: 'error',   label: 'Disputed' },
                }
                const vc = vrfStyles[emp.verificationStatus] || vrfStyles.NOT_REQUESTED
                return (
                  <div key={emp.id} className="p-4 rounded-xl bg-slate-50 border border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-navy">{emp.designation} @ {emp.companyName}</p>
                      <p className="text-xs text-muted mt-0.5">Contact HR: {emp.officialEmail || 'No official email specified'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={vc.variant}>{vc.label}</Badge>
                      {emp.verificationStatus === 'NOT_REQUESTED' && (
                        <Button size="sm" variant="secondary" onClick={() => requestVerification(emp.id, emp.officialEmail)}>
                          Trigger Request <ArrowUpRight size={13} />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Add Employment Modal */}
      {showAddEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddEmp(false)}>
          <div className="bg-white rounded-2xl p-7 max-w-lg w-full shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-navy font-heading">Add Professional Role</h3>
              <button onClick={() => setShowAddEmp(false)} className="text-muted hover:text-navy transition-colors cursor-pointer"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Company Name" placeholder="e.g. Acme Corp" value={empForm.companyName} onChange={e => setEmpForm({ ...empForm, companyName: e.target.value })} required />
              <Input label="Designation / Role" placeholder="e.g. Tech Lead" value={empForm.designation} onChange={e => setEmpForm({ ...empForm, designation: e.target.value })} required />
              <Input label="Start Date" placeholder="MM/YYYY" value={empForm.startDate} onChange={e => setEmpForm({ ...empForm, startDate: e.target.value })} required />
              <Input label="End Date" placeholder="MM/YYYY or leave blank" value={empForm.endDate} onChange={e => setEmpForm({ ...empForm, endDate: e.target.value })} disabled={empForm.isCurrent} />
              
              <div className="sm:col-span-2">
                <Input label="Official HR / Supervisor Email" type="email" placeholder="hr@acmecorp.com" value={empForm.officialEmail} onChange={e => setEmpForm({ ...empForm, officialEmail: e.target.value })} helperText="Used exclusively for automated employment verification." />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="current"
                  checked={empForm.isCurrent}
                  onChange={e => setEmpForm({ ...empForm, isCurrent: e.target.checked })}
                  className="w-4 h-4 accent-coral rounded"
                />
                <label htmlFor="current" className="text-xs font-semibold text-navy cursor-pointer">I am currently employed in this role</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setShowAddEmp(false)}>Cancel</Button>
              <Button onClick={addEmploymentRecord} loading={addingEmp} disabled={!empForm.companyName || !empForm.designation}>Record Role</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
