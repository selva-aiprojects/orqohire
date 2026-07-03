'use client'
import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import { Zap, ChevronDown, CheckCircle2, ArrowRight, XCircle, Sparkles, SlidersHorizontal, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function ShortlistPage() {
  const [requirements, setRequirements] = useState<any[]>([])
  const [selectedJD, setSelectedJD]     = useState('')
  const [requirement, setRequirement]   = useState<any>(null)
  const [scores, setScores]             = useState<any[]>([])
  const [loading, setLoading]           = useState(false)
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [submitting, setSubmitting]     = useState<string | null>(null)
  const [submitted, setSubmitted]       = useState<Set<string>>(new Set())

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jd = params.get('jd')
    fetch('/api/requirements?status=Active').then(r => r.json()).then(d => {
      if (d.success) {
        setRequirements(d.data)
        if (jd) {
          setSelectedJD(jd)
          setRequirement(d.data.find((r: any) => r.jobCode === jd) || null)
        }
      }
    })
  }, [])

  useEffect(() => {
    if (selectedJD && requirements.length) {
      setRequirement(requirements.find(r => r.jobCode === selectedJD) || null)
      setScores([]) // Reset scores when JD changes
      setExpanded(null)
    }
  }, [selectedJD, requirements])

  async function runShortlist() {
    if (!selectedJD) return
    setLoading(true); setScores([])
    try {
      const res  = await fetch(`/api/match?jobCode=${selectedJD}&limit=20`)
      const data = await res.json()
      if (data.success) setScores(data.data)
      else alert(data.error)
    } catch {
      alert('Network error during matching.')
    }
    setLoading(false)
  }

  async function submitCandidate(s: any) {
    if (!requirement) return
    setSubmitting(s.candidateId)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobCode: selectedJD, candidateId: s.candidateId, candidateName: s.candidateName || s.candidateId, clientName: requirement.clientName })
      })
      const data = await res.json()
      if (data.success) setSubmitted(prev => new Set([...prev, s.candidateId]))
      else alert(data.error)
    } catch {
      alert('Failed to submit candidate.')
    }
    setSubmitting(null)
  }

  const bandConfig: Record<string, { bg: string; text: string; label: string }> = {
    Excellent: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Excellent' },
    Good:      { bg: 'bg-teal-100',    text: 'text-teal-800',    label: 'Good' },
    Moderate:  { bg: 'bg-amber-100',   text: 'text-amber-800',   label: 'Moderate' },
    Weak:      { bg: 'bg-orange-100',  text: 'text-orange-800',  label: 'Weak' },
    Poor:      { bg: 'bg-rose-100',    text: 'text-rose-800',    label: 'Poor' },
  }

  return (
    <AppLayout
      roleLabel="Recruiter"
      title="AI Shortlist"
      subtitle="Deterministic candidate ranking against job requirements"
    >
      {/* JD Selector */}
      <Card title="Select a requisition to match against">
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-navy mb-1.5">Active requisition</label>
              <select
                value={selectedJD}
                onChange={e => setSelectedJD(e.target.value)}
                className="w-full p-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-navy outline-none focus:border-coral focus:ring-4 focus:ring-coral/10 transition-all cursor-pointer"
              >
                <option value="">— Choose a job code —</option>
                {requirements.map(r => (
                  <option key={r.jobCode} value={r.jobCode}>
                    [{r.jobCode}] {r.designation} · {r.clientName?.trim()} ({r.location})
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={runShortlist}
              disabled={!selectedJD || loading}
              loading={loading}
              className="shrink-0 px-6"
            >
              <Sparkles size={15} /> Run matcher
            </Button>
          </div>

          {requirement && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t border-slate-100 text-xs">
              {[
                ['Designation', requirement.designation],
                ['Client', requirement.clientName?.trim() || 'Confidential'],
                ['Experience', `${requirement.minExperience}${requirement.maxExperience ? `-${requirement.maxExperience}` : '+'} yrs`],
                ['Location', requirement.location],
                ['Budget', requirement.budgetMax > 0 ? `₹${requirement.budgetMax}L` : 'As per norms'],
              ].map(([l, v]) => (
                <div key={l} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{l}</span>
                  <span className="font-bold text-navy truncate block">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Empty states */}
      {!selectedJD && !loading && (
        <Card className="py-14 text-center space-y-2">
          <SlidersHorizontal size={28} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-navy">Select a requisition above to begin</p>
          <p className="text-xs text-muted">The matcher will rank all candidates by compatibility score</p>
        </Card>
      )}

      {selectedJD && !loading && scores.length === 0 && (
        <Card className="py-14 text-center space-y-2">
          <Zap size={28} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-navy">Ready to match</p>
          <p className="text-xs text-muted">Click "Run matcher" to score candidates against this requisition</p>
        </Card>
      )}

      {/* Skeleton while loading */}
      {loading && (
        <div className="space-y-3">
          <p className="text-xs text-muted font-semibold flex items-center gap-2">
            <Sparkles size={13} className="text-coral animate-pulse" /> Analyzing compatibility across candidate pool...
          </p>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 animate-shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-slate-100 animate-shimmer" />
                <div className="h-3 w-full max-w-xs rounded bg-slate-100 animate-shimmer" />
                <div className="flex gap-2">
                  {[1, 2, 3].map(j => <div key={j} className="h-5 w-16 rounded bg-slate-100 animate-shimmer" />)}
                </div>
              </div>
              <div className="w-24 h-9 rounded-lg bg-slate-100 animate-shimmer shrink-0 hidden sm:block" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && scores.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-bold text-navy">{scores.length} candidates ranked</span>
            <span>Sorted by compatibility score · Click a row to expand breakdown</span>
          </div>

          <div className="space-y-2">
            {scores.map((s, idx) => {
              const bc = bandConfig[s.band] || bandConfig.Poor
              const isExp = expanded === s.candidateId
              return (
                <div key={s.candidateId} className="bg-white border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
                  {/* Main row */}
                  <div
                    onClick={() => setExpanded(isExp ? null : s.candidateId)}
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <span className="text-xs font-mono font-bold text-slate-400 w-6 shrink-0 text-center">#{idx + 1}</span>

                    <div className={`px-3 py-2 rounded-xl text-center min-w-[72px] shrink-0 ${bc.bg}`}>
                      <p className={`text-xl font-black font-mono leading-none ${bc.text}`}>{s.totalScore}</p>
                      <p className={`text-[10px] font-bold mt-0.5 ${bc.text}`}>{bc.label}</p>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-navy truncate">{s.candidateName || s.candidateId}</h4>
                        <Link
                          href={`/recruiter/candidates/${s.candidateId}`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-indigo-600 font-bold hover:underline shrink-0"
                        >
                          Profile →
                        </Link>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.breakdown?.skills?.matched?.slice(0, 5).map((sk: string) => (
                          <span key={sk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={10} /> {sk}
                          </span>
                        ))}
                        {s.breakdown?.skills?.missing?.slice(0, 2).map((sk: string) => (
                          <span key={sk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={10} /> {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-navy">{s.breakdown?.experience?.actual || '—'} yrs</p>
                        <p className="text-[11px] text-muted">{s.breakdown?.noticePeriod?.candidateDays || '—'}d notice</p>
                      </div>
                      <Button
                        variant={submitted.has(s.candidateId) ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={e => { e.stopPropagation(); submitCandidate(s) }}
                        disabled={submitted.has(s.candidateId) || submitting === s.candidateId}
                        loading={submitting === s.candidateId}
                        className="shrink-0"
                      >
                        {submitted.has(s.candidateId) ? (
                          <><CheckCircle2 size={13} /> Submitted</>
                        ) : (
                          <>Submit <ArrowRight size={13} /></>
                        )}
                      </Button>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-300 shrink-0 ${isExp ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expandable breakdown — smooth animation via max-height */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExp ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-slate-50 border-t border-slate-100 p-5 space-y-4">
                      <p className="text-[11px] font-bold text-navy uppercase tracking-wider">Score breakdown</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          ['Domain skills', s.breakdown?.skills?.score, 40],
                          ['Experience', s.breakdown?.experience?.score, 25],
                          ['Secondary skills', s.breakdown?.goodToHave?.score, 15],
                          ['Location', s.breakdown?.location?.score, 10],
                          ['Notice period', s.breakdown?.noticePeriod?.score, 5],
                          ['CTC alignment', s.breakdown?.budget?.score, 5],
                        ].map(([label, score, max]) => {
                          const pct = Math.round(((score as number) || 0) / (max as number) * 100)
                          return (
                            <div key={label as string} className="p-3 rounded-xl bg-white border border-border space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 leading-tight">{label as string}</span>
                                <span className="text-xs font-mono font-bold text-navy">{((score as number) || 0).toFixed(0)}/{max}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-border space-y-1">
                        {(s.explanation || []).map((line: string, i: number) => (
                          <p key={i} className="text-xs font-mono text-slate-600 leading-relaxed">· {line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
