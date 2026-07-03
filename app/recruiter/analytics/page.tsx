'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, KPICard } from '@/components/ui'
import { Users, Briefcase, Send, CheckCircle2, RotateCcw, Building2, MapPin, Clock } from 'lucide-react'

export default function AnalyticsPage() {
  const [candidates, setCandidates]     = useState<any[]>([])
  const [requirements, setRequirements] = useState<any[]>([])
  const [pipeline, setPipeline]         = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const loadData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const [c, r, p] = await Promise.all([
        fetch('/api/candidates').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/requirements').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/submissions').then(r => r.json()).catch(() => ({ success: false })),
      ])
      if (c.success) setCandidates(c.data)
      if (r.success) setRequirements(r.data)
      if (p.success) setPipeline(p.data)
      setLastRefreshed(new Date())
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const STAGES = ['Submitted', 'L1', 'L2', 'L3', 'Test', 'Offered', 'Joined', 'Rejected']
  const STAGE_COLORS: Record<string, string> = {
    Submitted: '#64748B', L1: '#3B82F6', L2: '#6366F1', L3: '#8B5CF6',
    Test: '#F59E0B', Offered: '#F97316', Joined: '#10B981', Rejected: '#EF4444',
  }

  const stageCounts = STAGES.reduce((acc, s) => { acc[s] = pipeline.filter(e => e.currentStage === s).length; return acc }, {} as Record<string, number>)
  const joined  = stageCounts['Joined'] || 0
  const offered = (stageCounts['Offered'] || 0) + joined
  const oar     = offered > 0 ? Math.round((joined / offered) * 100) : 0
  const activeReqs = requirements.filter(r => r.status === 'Active')

  const clientCounts: Record<string, number> = {}
  pipeline.forEach(e => { if (e.clientName) clientCounts[e.clientName] = (clientCounts[e.clientName] || 0) + 1 })
  const topClients = Object.entries(clientCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxClient  = topClients[0]?.[1] || 1

  const locCounts: Record<string, number> = {}
  candidates.forEach(c => { if (c.locationCurrent) locCounts[c.locationCurrent] = (locCounts[c.locationCurrent] || 0) + 1 })
  const topLocs = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxLoc  = topLocs[0]?.[1] || 1

  const expBands: Record<string, number> = { '0–2': 0, '2–5': 0, '5–8': 0, '8–12': 0, '12+': 0 }
  candidates.forEach(c => {
    const e = Number(c.totalExperience) || 0
    if (e <= 2) expBands['0–2']++
    else if (e <= 5) expBands['2–5']++
    else if (e <= 8) expBands['5–8']++
    else if (e <= 12) expBands['8–12']++
    else expBands['12+']++
  })
  const maxExp = Math.max(...Object.values(expBands)) || 1

  return (
    <AppLayout
      roleLabel="Recruiter"
      title="Analytics"
      subtitle="Recruitment funnel metrics and talent pool insights"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Total candidates"     value={candidates.length}  icon={<Users size={20} />}        bg="#EEF2FF" color="#4F46E5" trend="In database"     loading={loading} />
        <KPICard label="Active requisitions"  value={activeReqs.length}  icon={<Briefcase size={20} />}    bg="#ECFDF5" color="#059669" trend="Sourcing now"     loading={loading} />
        <KPICard label="Total submissions"    value={pipeline.length}    icon={<Send size={20} />}         bg="#FFFBEB" color="#D97706" trend="In pipeline"      loading={loading} />
        <KPICard label="Offer acceptance"     value={`${oar}%`}          icon={<CheckCircle2 size={20} />} bg="#FFF5F3" color="#FF5A36" trend={`${joined} hires`} loading={loading} />
      </div>

      {loading ? (
        <div className="space-y-5">
          <div className="h-56 rounded-2xl bg-white border border-border animate-shimmer" />
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-white border border-border animate-shimmer" />)}
          </div>
        </div>
      ) : (
        <>
          {/* Funnel */}
          <Card
            title="Pipeline conversion funnel"
            action={
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-navy cursor-pointer transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RotateCcw size={13} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : `Refreshed ${lastRefreshed.toLocaleTimeString()}`}
              </button>
            }
          >
            <div className="space-y-2.5">
              {STAGES.map(stage => {
                const count = stageCounts[stage] || 0
                const pct   = pipeline.length > 0 ? Math.round((count / pipeline.length) * 100) : 0
                return (
                  <div key={stage} className="flex items-center gap-3 group">
                    <span className="text-xs font-bold text-navy w-20 text-right shrink-0">{stage}</span>
                    <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center pl-3 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 3)}%`, background: STAGE_COLORS[stage] }}
                      >
                        <span className="text-white text-xs font-bold whitespace-nowrap">{count > 0 ? count : ''}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 w-10 text-right shrink-0">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Distribution charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card title="Submissions by client">
              <div className="space-y-3.5">
                {topClients.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6">No data</p>
                ) : topClients.map(([client, count]) => (
                  <div key={client} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-navy truncate max-w-[70%] flex items-center gap-1.5"><Building2 size={11} className="text-slate-400 shrink-0" />{client}</span>
                      <span className="font-mono font-bold text-coral">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-coral rounded-full" style={{ width: `${(count / maxClient) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Candidates by city">
              <div className="space-y-3.5">
                {topLocs.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6">No data</p>
                ) : topLocs.map(([loc, count]) => (
                  <div key={loc} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-navy truncate max-w-[70%] flex items-center gap-1.5"><MapPin size={11} className="text-slate-400 shrink-0" />{loc}</span>
                      <span className="font-mono font-bold text-indigo-600">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / maxLoc) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Experience bands">
              <div className="space-y-3.5">
                {Object.entries(expBands).map(([band, count]) => (
                  <div key={band} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-navy flex items-center gap-1.5"><Clock size={11} className="text-slate-400" /> {band} yrs</span>
                      <span className="font-mono font-bold text-emerald-600">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / maxExp) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Active requisitions table */}
          <Card title="Active requisitions" subtitle={`${activeReqs.length} open positions`} padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-muted uppercase tracking-wider bg-slate-50/80">
                    <th className="px-5 py-3.5">Job code</th>
                    <th className="px-4 py-3.5">Designation</th>
                    <th className="px-4 py-3.5 hidden md:table-cell">Client</th>
                    <th className="px-4 py-3.5 hidden lg:table-cell">Location</th>
                    <th className="px-4 py-3.5 hidden lg:table-cell">Experience</th>
                    <th className="px-4 py-3.5">Budget</th>
                    <th className="px-5 py-3.5 text-center">Vacancies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {activeReqs.map(r => (
                    <tr key={r.jobCode} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-indigo-600 text-xs">{r.jobCode}</td>
                      <td className="px-4 py-3.5 font-semibold text-navy">{r.designation}</td>
                      <td className="px-4 py-3.5 text-muted text-xs hidden md:table-cell">{r.clientName?.trim()}</td>
                      <td className="px-4 py-3.5 text-muted text-xs hidden lg:table-cell">{r.location}</td>
                      <td className="px-4 py-3.5 text-xs hidden lg:table-cell">{r.minExperience}{r.maxExperience ? `-${r.maxExperience}` : '+'} yrs</td>
                      <td className="px-4 py-3.5 text-xs font-bold text-emerald-600">{r.budgetMax > 0 ? `₹${r.budgetMax}L` : 'Norms'}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-navy">{r.vacancies || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </AppLayout>
  )
}
