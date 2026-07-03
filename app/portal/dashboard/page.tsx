'use client'
import React, { useState, useEffect } from 'react'
import { Card, Badge, Button, Input } from '@/components/ui'
import { Briefcase, Search, MapPin, Clock, DollarSign, Building2, ExternalLink, User, CheckCircle2, XCircle, AlertCircle, Sparkles, Send } from 'lucide-react'

const STAGES = ['Submitted', 'L1', 'L2', 'L3', 'Test', 'Offered', 'Joined', 'Rejected']
const STAGE_VARIANTS: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'error'> = {
  Submitted: 'neutral', L1: 'info', L2: 'info', L3: 'info',
  Test: 'warning', Offered: 'warning', Joined: 'success', Rejected: 'error',
}

export default function CandidatePortal() {
  const [jobs, setJobs]                 = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [view, setView]                 = useState<'jobs' | 'applications' | 'profile'>('jobs')
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [applying, setApplying]         = useState<string | null>(null)
  const [applied, setApplied]           = useState<Set<string>>(new Set())
  const [saved, setSaved]               = useState(false)
  const [profile, setProfile]           = useState({
    name: '', email: '', phone: '', skills: '', location: '', experience: '', expectedCTC: '', noticePeriod: ''
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/requirements?status=Active').then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/submissions').then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([j, a]) => {
      if (j.success) setJobs(j.data)
      if (a.success) setApplications(a.data)
      setLoading(false)
    })
  }, [])

  const filteredJobs = jobs.filter(j =>
    !search ||
    j.designation.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase()) ||
    j.jobCode.toLowerCase().includes(search.toLowerCase())
  )

  async function applyToJob(job: any) {
    setApplying(job.jobCode)
    try {
      const res  = await fetch('/api/submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobCode: job.jobCode,
          candidateId: `PORTAL-${Date.now()}`,
          candidateName: profile.name || 'Portal Candidate',
          clientName: job.clientName
        }),
      })
      const data = await res.json()
      if (data.success) {
        setApplied(prev => new Set([...prev, job.jobCode]))
        setApplications(prev => [...prev, data.data])
      } else alert(data.error)
    } catch {
      alert('Network error while applying.')
    }
    setApplying(null)
  }

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-navy text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OrqoHire Logo" className="h-10 w-auto object-contain" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold hidden sm:block border-l border-white/10 pl-3">Candidate Portal</span>
          </div>

          <nav className="flex gap-1 bg-white/10 p-1 rounded-xl">
            {[
              { key: 'jobs' as const,         label: 'Opportunities', icon: <Briefcase size={14} /> },
              { key: 'applications' as const, label: `My Applications (${applications.length})`, icon: <Send size={14} /> },
              { key: 'profile' as const,      label: 'Digital Passport', icon: <User size={14} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === tab.key
                    ? 'bg-coral text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {view === 'jobs' && (
          <div className="space-y-5">
            {/* Compact title + search row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold font-heading text-navy">Open positions</h2>
                <p className="text-xs text-muted">{filteredJobs.length} active opportunities matched to your profile</p>
              </div>
              <div className="sm:ml-auto relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  placeholder="Search roles, skills, or city..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-navy placeholder:text-slate-400 outline-none focus:border-coral focus:ring-4 focus:ring-coral/10 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3].map(i => <div key={i} className="h-36 rounded-2xl bg-white animate-shimmer" />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="p-16 text-center space-y-3">
                <Briefcase size={32} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-navy">No Matching Roles Found</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">Try clearing your search query to view all open organizational opportunities.</p>
                {search && <Button size="sm" variant="secondary" onClick={() => setSearch('')}>Clear Filter</Button>}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <Card key={job.jobCode} hover className="p-6 bg-white border-slate-200/80 group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-bold font-heading text-navy group-hover:text-coral transition-colors leading-snug">
                            {job.designation}
                          </h3>
                          <Badge variant="info" className="font-mono text-[10px]">{job.jobCode}</Badge>
                        </div>

                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                          <span>{job.clientName?.trim() || 'Confidential Client'}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1"><MapPin size={13} className="text-slate-400" /> {job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase size={13} className="text-slate-400" /> {job.employmentType}</span>
                          <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400" /> {job.minExperience}{job.maxExperience ? `-${job.maxExperience}` : '+'} Yrs Exp</span>
                          <span className="flex items-center gap-1 font-bold text-emerald-600"><DollarSign size={13} /> {job.budgetMax > 0 ? `₹${job.budgetMax}L` : 'As per norms'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-none border-slate-100">
                        <Button
                          onClick={() => applyToJob(job)}
                          disabled={applied.has(job.jobCode) || applying === job.jobCode}
                          variant={applied.has(job.jobCode) ? 'secondary' : 'primary'}
                          className="w-full sm:w-auto font-bold shadow-sm"
                        >
                          {applying === job.jobCode ? (
                            'Submitting...'
                          ) : applied.has(job.jobCode) ? (
                            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={15} /> Application Sent</span>
                          ) : (
                            'One-Click Apply &rarr;'
                          )}
                        </Button>

                        {job.jobDescription?.startsWith('http') && (
                          <a
                            href={job.jobDescription}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                          >
                            View Role Document <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: APPLICATIONS */}
        {view === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-heading text-navy">Application Tracker</h2>
                <p className="text-xs text-muted">Real-time status updates across your interview rounds</p>
              </div>
              <Badge variant="info">{applications.length} Submitted Roles</Badge>
            </div>

            {applications.length === 0 ? (
              <Card className="p-16 text-center space-y-3">
                <Send size={32} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-navy">No Applications Tracked</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">Explore open positions in our marketplace to start applying with your OrqoHire passport.</p>
                <Button size="sm" onClick={() => setView('jobs')}>Browse Opportunities</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <Card key={app.id} className="p-6 bg-white border-slate-200 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 block w-fit mb-1">
                          {app.jobCode}
                        </span>
                        <h3 className="text-base font-bold font-heading text-navy">{app.candidateName || 'Candidate Application'}</h3>
                        <p className="text-xs text-muted mt-0.5">Submitted on {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : 'Recent'}</p>
                      </div>
                      <Badge variant={STAGE_VARIANTS[app.currentStage] || 'neutral'}>{app.currentStage}</Badge>
                    </div>

                    {/* Stepper Timeline */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between overflow-x-auto pb-2 min-w-[550px]">
                        {STAGES.filter(s => s !== 'Rejected').map((stage, i, arr) => {
                          const stageIdx  = STAGES.indexOf(app.currentStage)
                          const thisIdx   = STAGES.indexOf(stage)
                          const isDone    = stageIdx > thisIdx
                          const isCurrent = stageIdx === thisIdx
                          const color     = isCurrent || isDone ? 'bg-coral text-white border-coral shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200'
                          return (
                            <React.Fragment key={stage}>
                              <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${color}`}>
                                  {isDone ? <CheckCircle2 size={14} /> : i + 1}
                                </div>
                                <span className={`text-[10px] font-bold ${isCurrent ? 'text-coral' : isDone ? 'text-navy' : 'text-slate-400'}`}>
                                  {stage}
                                </span>
                              </div>
                              {i < arr.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-all ${isDone ? 'bg-coral' : 'bg-slate-200'}`} />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>

                    {app.currentStage === 'Offered' && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <span>Congratulations! You have received a formal offer for this role.</span>
                      </div>
                    )}

                    {app.currentStage === 'Rejected' && app.dropoutReason && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                        <XCircle size={16} className="text-rose-600 shrink-0" />
                        <span>Recruiter Evaluation Note: {app.dropoutReason}</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PROFILE */}
        {view === 'profile' && (
          <Card
            title="Cryptographic Candidate Passport"
            subtitle="Maintain your verified profile details for AI semantic matching"
            className="p-8 bg-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <Input
                label="Full Legal Name"
                placeholder="e.g. Alex Rivera"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Email Coordinate"
                type="email"
                placeholder="you@domain.com"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="Contact Phone"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                label="Current Residence City"
                placeholder="Bengaluru, India"
                value={profile.location}
                onChange={e => setProfile(prev => ({ ...prev, location: e.target.value }))}
              />
              <Input
                label="Total Experience (Years)"
                placeholder="e.g. 5.5"
                value={profile.experience}
                onChange={e => setProfile(prev => ({ ...prev, experience: e.target.value }))}
              />
              <Input
                label="Expected Annual CTC (LPA)"
                placeholder="e.g. 24"
                value={profile.expectedCTC}
                onChange={e => setProfile(prev => ({ ...prev, expectedCTC: e.target.value }))}
              />

              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-navy uppercase tracking-wider">Verified Technical Skills (Comma Separated)</label>
                <textarea
                  placeholder="React, Next.js, TypeScript, Node.js, Python, System Design..."
                  value={profile.skills}
                  onChange={e => setProfile(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full p-3.5 bg-slate-50 border border-border rounded-xl text-sm font-semibold text-navy outline-none focus:border-coral min-h-[90px] transition-all"
                />
              </div>
            </div>

            {saved && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Your digital passport configuration has been successfully updated!
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setView('jobs')}>Explore Jobs</Button>
              <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }} className="font-bold">
                Save & Synchronize Passport
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
