'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, Badge, Button, Input } from '@/components/ui'
import { Briefcase, Clock, Banknote, Sparkles, Search, X } from 'lucide-react'

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<any[]>([])
  const [submissions, setSubmissions]   = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [error, setError]               = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/requirements').then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/submissions').then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([req, sub]) => {
      if (req.success) setRequirements(req.data)
      else setError('Failed to load requisitions.')
      if (sub.success) setSubmissions(sub.data)
      setLoading(false)
    })
  }, [])

  const filtered = requirements.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.designation.toLowerCase().includes(q) || r.clientName?.toLowerCase().includes(q) || r.jobCode.toLowerCase().includes(q)
  })

  // Submission count per job code
  const submissionCount = (jobCode: string) => submissions.filter(s => s.jobCode === jobCode).length

  const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    Active: 'success', 'On Hold': 'warning', Closed: 'neutral',
  }

  const groups = [
    { label: 'Active',   items: filtered.filter(r => r.status === 'Active') },
    { label: 'On Hold',  items: filtered.filter(r => r.status === 'On Hold') },
    { label: 'Closed',   items: filtered.filter(r => r.status === 'Closed') },
  ].filter(g => g.items.length > 0)

  return (
    <AppLayout
      roleLabel="Recruiter"
      title="Requisitions"
      subtitle="Active client job openings"
    >
      {/* Slim toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold text-navy">{requirements.filter(r => r.status === 'Active').length}</span>
          <span className="text-muted">active</span>
          <span className="text-slate-300">·</span>
          <span className="font-bold text-navy">{requirements.filter(r => r.status === 'On Hold').length}</span>
          <span className="text-muted">on hold</span>
          <span className="text-slate-300">·</span>
          <span className="font-bold text-navy">{requirements.filter(r => r.status === 'Closed').length}</span>
          <span className="text-muted">closed</span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search by role, client, or job code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-border rounded-xl text-sm text-navy placeholder:text-slate-400 outline-none focus:border-coral focus:ring-4 focus:ring-coral/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-52 rounded-2xl bg-white border border-border animate-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center space-y-2">
          <Briefcase size={28} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-navy">No requisitions found</p>
          <p className="text-xs text-muted">Try a different search term</p>
          {search && <Button size="sm" variant="secondary" onClick={() => setSearch('')}>Clear search</Button>}
        </Card>
      ) : (
        <div className="space-y-8">
          {groups.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={statusVariant[group.label] || 'neutral'}>{group.label}</Badge>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-mono font-bold text-slate-400">{group.items.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.items.map(r => {
                  const count = submissionCount(r.jobCode)
                  return (
                    <div key={r.jobCode} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                      <div className="p-5 flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 block w-fit mb-1.5">
                              {r.jobCode}
                            </span>
                            <h3 className="text-sm font-bold text-navy leading-snug">{r.designation}</h3>
                          </div>
                          {count > 0 && (
                            <span className="shrink-0 px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 whitespace-nowrap">
                              {count} submitted
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted font-medium mb-3 truncate">{r.clientName?.trim() || 'Confidential'} · {r.location}</p>

                        {/* Specs */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Clock size={10} /> Exp</span>
                            <span className="font-bold text-navy">{r.minExperience}{r.maxExperience ? `-${r.maxExperience}` : '+'} yrs</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Banknote size={10} /> Budget</span>
                            <span className="font-bold text-emerald-600">{r.budgetMax > 0 ? `₹${r.budgetMax}L` : 'Norms'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Briefcase size={10} /> Notice</span>
                            <span className="font-bold text-navy">≤{r.noticePeriodMax || 30}d</span>
                          </div>
                        </div>
                      </div>

                      {r.status === 'Active' && (
                        <div className="px-5 pb-5">
                          <Link href={`/recruiter/shortlist?jd=${r.jobCode}`} className="block">
                            <Button className="w-full text-sm" size="sm">
                              <Sparkles size={14} /> Run AI matcher
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
