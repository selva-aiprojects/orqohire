'use client'
import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { Kanban, X, Calendar, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

const STAGES = ['Submitted', 'L1', 'L2', 'L3', 'Test', 'Offered', 'Joined', 'Rejected']

const STAGE_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  Submitted: 'neutral', L1: 'info', L2: 'info', L3: 'info',
  Test: 'warning', Offered: 'warning', Joined: 'success', Rejected: 'error',
}

const STAGE_COLORS: Record<string, string> = {
  Submitted: 'border-t-slate-400',
  L1: 'border-t-blue-400',
  L2: 'border-t-indigo-400',
  L3: 'border-t-violet-500',
  Test: 'border-t-amber-500',
  Offered: 'border-t-orange-500',
  Joined: 'border-t-emerald-500',
  Rejected: 'border-t-rose-500',
}

export default function PipelinePage() {
  const [entries, setEntries]             = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [selected, setSelected]           = useState<any>(null)
  const [newStage, setNewStage]           = useState('')
  const [updating, setUpdating]           = useState(false)
  const [filterClient, setFilterClient]   = useState('')
  const [focusStage, setFocusStage]       = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const url = filterClient ? `/api/submissions?client=${encodeURIComponent(filterClient)}` : '/api/submissions'
      const res  = await fetch(url)
      const data = await res.json()
      if (data.success) setEntries(data.data)
      else setError(data.error)
    } catch {
      setError('Failed to load pipeline.')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [filterClient])

  async function updateStage() {
    if (!selected || !newStage) return
    setUpdating(true)
    try {
      const res  = await fetch('/api/submissions', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: selected.id, newStage }),
      })
      const data = await res.json()
      if (data.success) {
        setEntries(prev => prev.map(e => e.id === selected.id ? { ...e, currentStage: newStage } : e))
        setSelected(null); setNewStage('')
      } else alert(data.error)
    } catch {
      alert('Error updating stage.')
    }
    setUpdating(false)
  }

  const byStage = STAGES.reduce((acc, s) => {
    acc[s] = entries.filter(e => e.currentStage === s); return acc
  }, {} as Record<string, any[]>)

  const clients = [...new Set(entries.map(e => e.clientName))].filter(Boolean)
  const activeStages = STAGES.filter(s => s !== 'Rejected')
  const displayedStages = focusStage ? [focusStage] : activeStages

  return (
    <AppLayout
      roleLabel="Recruiter"
      title="Pipeline"
      subtitle={`${entries.length} total submissions across ${clients.length} clients`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Stage filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STAGES.map(stage => {
            const count = byStage[stage]?.length || 0
            const active = focusStage === stage
            return (
              <button
                key={stage}
                onClick={() => setFocusStage(active ? null : stage)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  active
                    ? 'bg-navy text-white border-navy shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Badge variant={STAGE_VARIANTS[stage]} className="text-[9px] px-1.5 py-0.5">{stage}</Badge>
                <span className="font-mono">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {focusStage && (
            <button onClick={() => setFocusStage(null)} className="text-xs font-bold text-muted hover:text-navy flex items-center gap-1 cursor-pointer">
              <X size={13} /> Clear filter
            </button>
          )}
          {clients.length > 0 && (
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              className="px-3 py-1.5 bg-white border border-border rounded-xl text-xs font-semibold text-navy outline-none focus:border-coral cursor-pointer"
            >
              <option value="">All clients</option>
              {clients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-56 h-80 rounded-2xl bg-white border border-border animate-shimmer shrink-0" />)}
        </div>
      ) : entries.length === 0 ? (
        <Card className="py-16 text-center space-y-3">
          <Kanban size={28} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-navy">No submissions yet</p>
          <p className="text-xs text-muted">Use the Smart Shortlist to submit candidates to client openings</p>
          <Link href="/recruiter/shortlist"><Button size="sm">Go to AI Shortlist</Button></Link>
        </Card>
      ) : (
        <>
          {/* Kanban board — horizontally scrollable, columns have fixed width */}
          <div className="overflow-x-auto pb-4 -mx-2 px-2">
            <div className="flex gap-4" style={{ minWidth: `${displayedStages.length * 248}px` }}>
              {displayedStages.map(stage => {
                const items = byStage[stage] || []
                return (
                  <div key={stage} className={`w-[232px] shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border-t-2 ${STAGE_COLORS[stage]} overflow-hidden`}>
                    {/* Column header */}
                    <div className="flex items-center justify-between px-3.5 py-3 bg-white border-b border-slate-100">
                      <Badge variant={STAGE_VARIANTS[stage]}>{stage}</Badge>
                      <span className="w-6 h-6 rounded-lg bg-slate-100 font-mono text-xs font-bold text-navy flex items-center justify-center">
                        {items.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="p-2 space-y-2 overflow-y-auto flex-1 max-h-[600px]">
                      {items.map(entry => (
                        <div
                          key={entry.id}
                          onClick={() => { setSelected(entry); setNewStage(entry.currentStage) }}
                          className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs hover:shadow-sm hover:border-coral/50 transition-all cursor-pointer group"
                        >
                          <p className="text-xs font-bold text-navy group-hover:text-coral transition-colors truncate mb-0.5">
                            {entry.candidateName}
                          </p>
                          <p className="text-[10px] font-mono font-bold text-indigo-600 mb-1">{entry.jobCode}</p>
                          <p className="text-[11px] text-slate-500 truncate mb-2">{entry.clientName}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar size={10} />
                            {entry.submissionDate ? new Date(entry.submissionDate).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="py-8 text-center text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/40">
                          No candidates
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rejected section */}
          {!focusStage && byStage['Rejected']?.length > 0 && (
            <Card title="Rejected / archived" subtitle={`${byStage['Rejected'].length} candidates`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {byStage['Rejected'].map(entry => (
                  <div key={entry.id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 opacity-80">
                    <p className="text-xs font-bold text-navy truncate">{entry.candidateName}</p>
                    <p className="text-[10px] font-mono font-bold text-indigo-500 mt-0.5">{entry.jobCode}</p>
                    <p className="text-[11px] text-slate-500 truncate">{entry.clientName}</p>
                    {entry.dropoutReason && (
                      <p className="text-[10px] text-rose-700 font-semibold mt-1.5 pt-1.5 border-t border-rose-200/50">
                        {entry.dropoutReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Stage update modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setSelected(null); setNewStage('') }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-navy">Move candidate stage</h3>
                <p className="text-xs text-muted mt-1">{selected.candidateName} · <code className="font-mono text-indigo-600">{selected.jobCode}</code></p>
              </div>
              <button onClick={() => { setSelected(null); setNewStage('') }} className="text-muted hover:text-navy cursor-pointer mt-0.5"><X size={17} /></button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">New stage</label>
              <select
                value={newStage}
                onChange={e => setNewStage(e.target.value)}
                className="w-full p-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-navy outline-none focus:border-coral cursor-pointer"
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => { setSelected(null); setNewStage('') }}>Cancel</Button>
              <Button size="sm" onClick={updateStage} loading={updating} disabled={newStage === selected.currentStage}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
