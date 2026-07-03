'use client'
import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, KPICard, Badge, Button } from '@/components/ui'
import { Briefcase, GitPullRequest, Send, CheckCircle2, X, Sparkles, Calendar, Building2, MessageSquare } from 'lucide-react'

const STAGES = ['Submitted', 'L1', 'L2', 'L3', 'Test', 'Offered', 'Joined', 'Rejected']
const STAGE_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  Submitted: 'neutral', L1: 'info', L2: 'info', L3: 'info',
  Test: 'warning', Offered: 'warning', Joined: 'success', Rejected: 'error',
}

export default function ClientDashboard() {
  const [pipeline, setPipeline]         = useState<any[]>([])
  const [requirements, setRequirements] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState<any>(null)
  const [feedback, setFeedback]         = useState('')
  const [newStage, setNewStage]         = useState('')
  const [updating, setUpdating]         = useState(false)
  const [clientName, setClientName]     = useState('Enterprise Client')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.success) setClientName(d.data.clientName || 'Enterprise Client') }).catch(() => {})
    Promise.all([
      fetch('/api/submissions').then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/requirements').then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([p, r]) => {
      if (p.success) setPipeline(p.data)
      if (r.success) setRequirements(r.data)
      setLoading(false)
    })
  }, [])

  const stageCounts = STAGES.reduce((acc, s) => { acc[s] = pipeline.filter(e => e.currentStage === s).length; return acc }, {} as Record<string, number>)
  const joined  = stageCounts['Joined'] || 0
  const offered = (stageCounts['Offered'] || 0) + joined

  async function submitFeedback() {
    if (!selected || !newStage) return
    setUpdating(true)
    try {
      const res  = await fetch('/api/submissions', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: selected.id, newStage, stageData: newStage === 'Rejected' ? { dropoutReason: feedback } : {} }),
      })
      const data = await res.json()
      if (data.success) {
        setPipeline(prev => prev.map(e => e.id === selected.id ? { ...e, currentStage: newStage } : e))
        setSelected(null); setFeedback(''); setNewStage('')
      } else alert(data.error)
    } catch {
      alert('Error updating candidate status.')
    }
    setUpdating(false)
  }

  return (
    <AppLayout
      userName={clientName}
      roleLabel="Client SPOC"
      title={clientName}
      subtitle="Review candidates, provide feedback, and track your hiring pipeline"
    >

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Active Job Openings" value={requirements.filter(r => r.status === 'Active').length} icon={<Briefcase size={20} />} bg="#EEF2FF" color="#4F46E5" trend="Target Requisitions" loading={loading} />
        <KPICard label="Interview Pipeline" value={pipeline.filter(e => !['Joined', 'Rejected'].includes(e.currentStage)).length} icon={<GitPullRequest size={20} />} bg="#FFFBEB" color="#D97706" trend="In Review" loading={loading} />
        <KPICard label="Offers Extended" value={offered} icon={<Send size={20} />} bg="#FFF7ED" color="#EA580C" trend="Pending Acceptance" loading={loading} />
        <KPICard label="Successful Onboards" value={joined} icon={<CheckCircle2 size={20} />} bg="#ECFDF5" color="#059669" trend="Completed Hires" loading={loading} />
      </div>

      {/* Summary Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STAGES.map(stage => {
          const count = stageCounts[stage] || 0
          return (
            <div key={stage} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-xs">
              <Badge variant={STAGE_VARIANTS[stage] || 'neutral'} className="text-[10px] font-bold">{stage}</Badge>
              <span className="text-xs font-mono font-bold text-navy">{count}</span>
            </div>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-4 py-4">
          <div className="h-64 rounded-2xl bg-white animate-shimmer" />
        </div>
      ) : pipeline.length === 0 ? (
        <Card className="p-16 text-center space-y-3">
          <Send size={32} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-navy">No Candidates Submitted Yet</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">Your dedicated account recruitment team is screening candidates. Curated shortlists will appear here.</p>
        </Card>
      ) : (
        <>
          {/* Candidate Pipeline Review Table */}
          <Card title="Submitted Candidate Roster" subtitle="Provide evaluation feedback or advance candidate round" padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-muted uppercase tracking-wider">
                    <th className="p-4 pl-6">Candidate Specification</th>
                    <th className="p-4">Requisition Code</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Current Stage</th>
                    <th className="p-4 pr-6 text-right">SPOC Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pipeline.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6 font-bold text-navy">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {entry.candidateName?.charAt(0) || 'C'}
                          </div>
                          <span className="font-bold text-navy">{entry.candidateName}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-600">{entry.jobCode}</td>
                      <td className="p-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> {entry.submissionDate ? new Date(entry.submissionDate).toLocaleDateString() : 'Recent'}</span>
                      </td>
                      <td className="p-4"><Badge variant={STAGE_VARIANTS[entry.currentStage] || 'neutral'}>{entry.currentStage}</Badge></td>
                      <td className="p-4 pr-6 text-right">
                        {!['Joined', 'Rejected'].includes(entry.currentStage) && (
                          <Button size="sm" variant="secondary" onClick={() => { setSelected(entry); setNewStage(entry.currentStage) }} className="bg-slate-100 hover:bg-navy hover:text-white font-bold">
                            <MessageSquare size={13} className="mr-1" /> Evaluate &rarr;
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Active Open Requirements Grid */}
          {requirements.filter(r => r.status === 'Active').length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-base font-bold text-navy font-heading">Your Active Job Requisitions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {requirements.filter(r => r.status === 'Active').map(r => (
                  <Card key={r.jobCode} hover className="p-5 space-y-3 bg-white border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 block">
                        {r.jobCode}
                      </span>
                      <Badge variant="success">Active</Badge>
                    </div>

                    <h4 className="text-base font-bold text-navy font-heading leading-snug">{r.designation}</h4>
                    <p className="text-xs text-muted font-medium">{r.location} &middot; {r.employmentType}</p>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-center text-xs">
                      <div className="p-1.5 rounded bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Exp</span>
                        <span className="font-bold text-navy">{r.minExperience}{r.maxExperience ? `-${r.maxExperience}` : '+'} Yrs</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Budget</span>
                        <span className="font-bold text-emerald-600">{r.budgetMax > 0 ? `₹${r.budgetMax}L` : 'Norms'}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Open</span>
                        <span className="font-bold text-navy">{r.vacancies || 1} Role</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Evaluation / Feedback Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setSelected(null); setFeedback(''); setNewStage('') }}>
          <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy font-heading">Evaluate Candidate</h3>
                <p className="text-xs text-muted mt-0.5">{selected.candidateName} &middot; <code className="font-mono text-indigo-600">{selected.jobCode}</code></p>
              </div>
              <button onClick={() => { setSelected(null); setFeedback(''); setNewStage('') }} className="text-muted hover:text-navy cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">Update Interview Stage</label>
              <select
                value={newStage}
                onChange={e => setNewStage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-border rounded-xl text-sm font-bold text-navy outline-none focus:border-coral cursor-pointer"
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                {newStage === 'Rejected' ? 'Rejection Rationale' : 'Interviewer Feedback & Notes'}
              </label>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder={newStage === 'Rejected' ? 'Please specify why this profile was not suitable...' : 'Enter feedback notes or next round schedule...'}
                className="w-full p-3 bg-slate-50 border border-border rounded-xl text-sm text-navy outline-none focus:border-coral min-h-[100px] resize-y"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => { setSelected(null); setFeedback(''); setNewStage('') }}>Cancel</Button>
              <Button onClick={submitFeedback} loading={updating}>Confirm Decision &rarr;</Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
