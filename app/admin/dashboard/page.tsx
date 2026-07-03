'use client'
import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, KPICard, Badge, Button } from '@/components/ui'
import { ShieldCheck, Users, CheckCircle2, Search, Check, X, Sparkles, Building2, IdCard } from 'lucide-react'

export default function AdminDashboard() {
  const [passports, setPassports]   = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [queue, setQueue]           = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<'overview' | 'passports' | 'discovery' | 'users'>('overview')

  useEffect(() => {
    Promise.all([
      fetch('/api/candidates').then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/admin/passports').then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/admin/discovery').then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([c, p, q]) => {
      if (c.success) setCandidates(c.data)
      if (p.success) setPassports(p.data)
      if (q.success) setQueue(q.data)
      setLoading(false)
    })
  }, [])

  const verified    = passports.filter(p => p.passportStatus === 'COMPLETE' || p.passportStatus === 'VERIFIED').length
  const pending     = queue.filter(q => q.status === 'review').length
  const newKeywords = queue.filter(q => q.status === 'new').length

  async function approveKeyword(id: string) {
    try {
      await fetch('/api/admin/discovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', id }) })
      setQueue(prev => prev.map(k => k.id === id ? { ...k, status: 'approved' } : k))
    } catch {}
  }

  async function rejectKeyword(id: string) {
    try {
      await fetch('/api/admin/discovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', id }) })
      setQueue(prev => prev.map(k => k.id === id ? { ...k, status: 'rejected' } : k))
    } catch {}
  }

  const STATUS_BADGE: Record<string, 'neutral' | 'warning' | 'success' | 'info'> = {
    DRAFT: 'neutral', PARTIAL: 'warning', COMPLETE: 'success', VERIFIED: 'info',
  }

  const QUEUE_BADGE: Record<string, 'warning' | 'info' | 'success'| 'error'> = {
    new: 'warning', review: 'info', approved: 'success', rejected: 'error',
  }

  const tabs = [
    { key: 'overview' as const,  label: 'System Overview', icon: ShieldCheck },
    { key: 'passports' as const, label: 'Universal Passports', icon: IdCard },
    { key: 'discovery' as const, label: 'Discovery Queue', icon: Search },
    { key: 'users' as const,     label: 'Role Hierarchy',  icon: Users },
  ]

  return (
    <AppLayout
      roleLabel="Admin"
      title="Control Console"
      subtitle="Manage passports, discovery queue, and system access"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Total Candidates" value={candidates.length} icon={<Users size={20} />} bg="#EEF2FF" color="#4F46E5" trend="Platform Directory" loading={loading} />
        <KPICard label="Created Passports" value={passports.length} icon={<IdCard size={20} />} bg="#EEF2FF" color="#4F46E5" trend="Digital Identities" loading={loading} />
        <KPICard label="Verified Profiles" value={verified} icon={<CheckCircle2 size={20} />} bg="#ECFDF5" color="#059669" trend="Trust Score Verified" loading={loading} />
        <KPICard label="Discovery Queue" value={pending + newKeywords} icon={<Search size={20} />} bg="#FFFBEB" color="#D97706" trend="Pending Keyword Audit" loading={loading} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-xl overflow-x-auto">
        {tabs.map(tabItem => {
          const Icon = tabItem.icon
          return (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                tab === tabItem.key
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              <Icon size={14} />
              <span>{tabItem.label}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4 py-4">
          <div className="h-64 rounded-2xl bg-white animate-shimmer" />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Passport Distribution" subtitle="Verification status breakdown across candidates">
                <div className="space-y-4 pt-2">
                  {(['DRAFT', 'PARTIAL', 'COMPLETE', 'VERIFIED'] as const).map(status => {
                    const count = passports.filter(p => p.passportStatus === status).length
                    const pct   = passports.length > 0 ? Math.round((count / passports.length) * 100) : 0
                    return (
                      <div key={status} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <Badge variant={STATUS_BADGE[status]}>{status}</Badge>
                          <span className="font-mono text-slate-600">{count} Passports ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: status === 'DRAFT' ? '#64748B' : status === 'PARTIAL' ? '#F59E0B' : status === 'COMPLETE' ? '#10B981' : '#6366F1',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card title="Discovery Engine Queue" subtitle="Unverified skill keyword extraction ledger">
                <div className="space-y-3 pt-2">
                  {[
                    ['new', 'New Keywords Detected', '#D97706', 'bg-amber-50 border-amber-200'],
                    ['review', 'Under Expert Review', '#4F46E5', 'bg-indigo-50 border-indigo-200'],
                    ['approved', 'Approved to Taxonomy', '#059669', 'bg-emerald-50 border-emerald-200'],
                    ['rejected', 'Rejected / Spam', '#DC2626', 'bg-rose-50 border-rose-200'],
                  ].map(([status, label, color, bg]) => {
                    const count = queue.filter(q => q.status === status).length
                    return (
                      <div key={status} className={`flex items-center justify-between p-3.5 rounded-xl border ${bg as string}`}>
                        <span className="text-xs font-bold" style={{ color: color as string }}>{label as string}</span>
                        <span className="text-lg font-black font-mono" style={{ color: color as string }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: PASSPORTS */}
          {tab === 'passports' && (
            <Card title="Universal Digital Passport Ledger" subtitle="All cryptographic profiles generated in directory" padding={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-muted uppercase tracking-wider">
                      <th className="p-4 pl-6">Candidate Identity</th>
                      <th className="p-4">Contact Coordinate</th>
                      <th className="p-4">Profile Completeness</th>
                      <th className="p-4">Trust Score</th>
                      <th className="p-4">Verification State</th>
                      <th className="p-4 pr-6 text-right">Last Synchronized</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {passports.map((p) => (
                      <tr key={p.candidateId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 font-bold text-navy">{p.fullName || 'Anonymous Candidate'}</td>
                        <td className="p-4 text-xs text-muted font-medium">{p.email || 'N/A'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 max-w-[140px]">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-coral rounded-full" style={{ width: `${p.completionPercent || 0}%` }} />
                            </div>
                            <span className="text-xs font-mono font-bold text-navy">{p.completionPercent || 0}%</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-600">{p.trustScore || 0}/100</td>
                        <td className="p-4">
                          <Badge variant={STATUS_BADGE[p.passportStatus] || 'neutral'}>{p.passportStatus}</Badge>
                        </td>
                        <td className="p-4 pr-6 text-right text-xs text-slate-400 font-medium">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: DISCOVERY QUEUE */}
          {tab === 'discovery' && (
            <Card title="Skill Taxonomy Discovery Queue" subtitle="Approve or reject extracted keywords to refine global matching" padding={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-muted uppercase tracking-wider">
                      <th className="p-4 pl-6">Entity Classification</th>
                      <th className="p-4">Raw String Value</th>
                      <th className="p-4">Normalized Key</th>
                      <th className="p-4">Occurrences</th>
                      <th className="p-4">Audit Status</th>
                      <th className="p-4 pr-6 text-right">Governance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {queue.filter(k => k.status !== 'rejected').map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6"><Badge variant="info">{k.type}</Badge></td>
                        <td className="p-4 font-bold text-navy">{k.rawValue}</td>
                        <td className="p-4 font-mono text-xs text-indigo-600">{k.normalized}</td>
                        <td className="p-4 font-mono font-bold text-navy">{k.occurrences}</td>
                        <td className="p-4"><Badge variant={QUEUE_BADGE[k.status] || 'neutral'}>{k.status}</Badge></td>
                        <td className="p-4 pr-6 text-right">
                          {k.status !== 'approved' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="secondary" onClick={() => approveKeyword(k.id)} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                                <Check size={13} /> Approve
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => rejectKeyword(k.id)}>
                                <X size={13} /> Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 4: USERS */}
          {tab === 'users' && (
            <Card title="Role Security Hierarchy" subtitle="Access permissions grouped by account classification">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {[
                  { role: 'super_admin', label: 'Super Administrators', desc: 'Full root access to all databases', color: '#7C3AED', bg: '#F5F3FF' },
                  { role: 'recruiter',   label: 'Recruiter Operators',  desc: 'Shortlists, pipeline, requirements', color: '#2563EB', bg: '#EFF6FF' },
                  { role: 'client_spoc', label: 'Client Representatives', desc: 'Approve resumes, provide feedback', color: '#059669', bg: '#ECFDF5' },
                  { role: 'candidate',   label: 'Candidate Identities', desc: 'Digital passport access & applications', color: '#E8533A', bg: '#FFF5F3' },
                ].map(r => (
                  <div key={r.role} className="p-5 rounded-2xl border border-slate-200/80 space-y-3" style={{ background: r.bg }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: r.color }}>{r.label}</span>
                      <ShieldCheck size={18} style={{ color: r.color }} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                    <div className="pt-2 border-t border-slate-200/50 text-[11px] font-mono font-bold" style={{ color: r.color }}>
                      Role Identifier: <code className="bg-white/60 px-1.5 py-0.5 rounded">{r.role}</code>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </AppLayout>
  )
}
