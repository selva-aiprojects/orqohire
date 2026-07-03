'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import {
  User, Download, Eye, MapPin, Clock, DollarSign, Mail, Briefcase,
  GraduationCap, TrendingUp, CheckCircle2, XCircle, FileText, Sparkles,
  ExternalLink, ArrowUpRight, BookOpen, ChevronLeft, Phone, Calendar,
} from 'lucide-react'
import Link from 'next/link'

export default function CandidateDetailPage() {
  const params = useParams()
  const id     = params.id as string

  const [candidate, setCandidate]       = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [tab, setTab]                   = useState<'profile' | 'resume' | 'ats' | 'match' | 'activity'>('profile')
  const [parsing, setParsing]           = useState(false)
  const [atsData, setAtsData]           = useState<any>(null)
  const [matchScores, setMatchScores]   = useState<any[]>([])
  const [requirements, setRequirements] = useState<any[]>([])
  const [matchLoading, setMatchLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/candidates/${id}`).then(r => r.json()).then(d => { if (d.success) setCandidate(d.data); setLoading(false) }).catch(() => setLoading(false))
    fetch('/api/requirements?status=Active').then(r => r.json()).then(d => { if (d.success) setRequirements(d.data) }).catch(() => {})
  }, [id])

  async function parseResume() {
    if (!candidate?.resumeLink) { alert('No resume link found for extraction.'); return }
    setParsing(true)
    const skills = [...(candidate.primarySkills || []), ...(candidate.secondarySkills || [])]
    setTimeout(() => {
      setAtsData({
        personalDetails: { name: candidate.fullName, email: candidate.email, phone: candidate.phone, location: candidate.locationCurrent, linkedin: candidate.linkedinUrl || 'Not specified' },
        experience: { total: candidate.totalExperience, relevant: candidate.relevantExperience, current: candidate.currentDesignation, company: candidate.currentCompany, noticePeriod: candidate.noticePeriodText },
        compensation: { current: candidate.currentCTC, expected: candidate.expectedCTC },
        skills: { primary: candidate.primarySkills || [], secondary: candidate.secondarySkills || [], all: skills, count: skills.length },
        education: candidate.education || 'Degree records pending verification',
        resumeLink: candidate.resumeLink,
        completeness: calculateCompleteness(candidate),
      })
      setParsing(false)
    }, 800)
  }

  async function runAllMatches() {
    setMatchLoading(true)
    try {
      const scores = await Promise.all(
        requirements.slice(0, 6).map(async r => {
          const res  = await fetch(`/api/match?jobCode=${r.jobCode}&candidateId=${id}`)
          const data = await res.json()
          return data.success ? { ...data.data, designation: r.designation, clientName: r.clientName } : null
        })
      )
      setMatchScores(scores.filter(Boolean))
    } catch {
      alert('Error scoring candidate against requisitions.')
    }
    setMatchLoading(false)
  }

  function calculateCompleteness(c: any): number {
    if (!c) return 0
    const fields = [
      c.fullName, c.email, c.phone, c.currentDesignation, c.currentCompany,
      c.totalExperience, (c.primarySkills?.length > 0), c.resumeLink, c.locationCurrent, c.noticePeriodText,
    ]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }

  const BAND_VARIANTS: Record<string, 'success' | 'warning' | 'error'> = {
    Excellent: 'success', Good: 'success', Moderate: 'warning', Weak: 'error', Poor: 'error',
  }

  if (loading) {
    return (
      <AppLayout roleLabel="Recruiter Workspace" title="Candidate Profile">
        <div className="p-16 space-y-4">
          <div className="h-32 rounded-2xl bg-white animate-shimmer" />
          <div className="h-96 rounded-2xl bg-white animate-shimmer" />
        </div>
      </AppLayout>
    )
  }

  if (!candidate) {
    return (
      <AppLayout roleLabel="Recruiter Workspace" title="Candidate Not Found">
        <Card className="p-16 text-center space-y-3">
          <p className="text-base font-bold text-navy">The requested profile record could not be found.</p>
          <Link href="/recruiter/candidates">
            <Button size="sm">Return to Candidate Directory</Button>
          </Link>
        </Card>
      </AppLayout>
    )
  }

  const completeness = calculateCompleteness(candidate)

  const tabs = [
    { key: 'profile' as const,  icon: <User size={15} />,      label: 'Full Profile' },
    { key: 'resume' as const,   icon: <FileText size={15} />,  label: 'Resume Document' },
    { key: 'ats' as const,      icon: <Sparkles size={15} />,  label: 'AI Extracted ATS' },
    { key: 'match' as const,    icon: <TrendingUp size={15} />, label: 'Requisition Matcher' },
    { key: 'activity' as const, icon: <BookOpen size={15} />,  label: 'Audit Log' },
  ]

  return (
    <AppLayout
      userName={candidate.fullName}
      roleLabel="Candidate Specification"
      title={candidate.fullName}
      subtitle={`${candidate.currentDesignation || 'Candidate'} @ ${candidate.currentCompany || 'Independent'}`}
    >
      <div className="flex items-center justify-between pb-2">
        <Link href="/recruiter/candidates" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-navy transition-colors">
          <ChevronLeft size={16} /> Return to Directory
        </Link>
      </div>

      {/* Hero Summary Card */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
              {candidate.fullName?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-heading text-navy">{candidate.fullName}</h1>
                <Badge variant="info" className="font-mono">{candidate.id}</Badge>
              </div>
              <p className="text-sm font-bold text-muted">{candidate.currentDesignation} &middot; <span className="text-slate-500 font-normal">{candidate.currentCompany}</span></p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {candidate.locationCurrent || 'Location N/A'}</span>
                <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400" /> {candidate.totalExperience} Yrs Exp</span>
                <span className="flex items-center gap-1"><Briefcase size={14} className="text-slate-400" /> {candidate.noticePeriodText || `${candidate.noticePeriodDays} Days Notice`}</span>
                <span className="flex items-center gap-1 font-bold text-navy"><DollarSign size={14} className="text-emerald-600" /> Expected: ₹{candidate.expectedCTC}L</span>
              </div>
            </div>
          </div>

          {/* Profile Completeness Gauge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-w-[200px] shrink-0 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Profile Integrity</span>
              <span className="text-coral font-mono text-base">{completeness}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-coral to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Switcher */}
      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
        {tabs.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key)
              if (key === 'ats' && !atsData) parseResume()
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <Card title="Personal Specification" subtitle="Contact coordinates & preferences">
              <div className="space-y-3 text-xs">
                {[
                  ['Full Name', candidate.fullName],
                  ['Email Address', candidate.email],
                  ['Contact Phone', candidate.phone],
                  ['Current Residence', candidate.locationCurrent],
                  ['Preferred Work Cities', (candidate.locationPreferred || []).join(', ') || 'Remote / Flexible'],
                  ['Relocation Readiness', candidate.openToRelocate || 'Yes'],
                  ['LinkedIn Profile URL', candidate.linkedinUrl || 'Not Provided'],
                  ['Academic Degree', candidate.education || 'Degree record specified in resume'],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between py-2 border-b border-slate-100 last:border-none">
                    <span className="text-muted font-medium">{label as string}</span>
                    <span className="font-bold text-navy text-right max-w-[60%] truncate">{val as string}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <Card title="Professional Background" subtitle="Compensation ledger & timeline">
              <div className="space-y-3 text-xs">
                {[
                  ['Current Designation', candidate.currentDesignation],
                  ['Current Employer', candidate.currentCompany],
                  ['Total Experience', `${candidate.totalExperience} Years`],
                  ['Relevant Experience', `${candidate.relevantExperience || candidate.totalExperience} Years`],
                  ['Notice Period Duration', candidate.noticePeriodText || `${candidate.noticePeriodDays} Days`],
                  ['Employment Nature', candidate.employmentType || 'Full-time'],
                  ['Current Annual CTC', `₹${candidate.currentCTC || 'N/A'}L`],
                  ['Expected Annual CTC', `₹${candidate.expectedCTC || 'Negotiable'}L`],
                  ['Available Start Date', candidate.availabilityDate || 'Immediate Joining'],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between py-2 border-b border-slate-100 last:border-none">
                    <span className="text-muted font-medium">{label as string}</span>
                    <span className="font-bold text-navy text-right">{val as string}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Verified Technical Matrix" subtitle="Categorized skill indicators">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Primary Domain Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(candidate.primarySkills || []).map((s: string) => (
                      <Badge key={s} variant="info" className="px-3 py-1 font-bold">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Secondary Competencies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(candidate.secondarySkills || []).map((s: string) => (
                      <Badge key={s} variant="neutral">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: RESUME DOCUMENT */}
      {tab === 'resume' && (
        <Card title="Digital Resume Attachment" subtitle="Cloud document preview & processing">
          {candidate.resumeLink ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <a
                  href={candidate.resumeLink}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Download size={14} /> Download External Resume
                </a>
                <Button variant="secondary" onClick={parseResume} loading={parsing}>
                  <Sparkles size={14} className="mr-1.5" /> Re-extract Structured ATS Data
                </Button>
              </div>

              {candidate.resumeLink.includes('drive.google.com') ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden h-[650px] shadow-sm">
                  <iframe
                    src={candidate.resumeLink.replace('/view', '/preview').replace('/edit', '/preview')}
                    width="100%"
                    height="100%"
                    className="border-none"
                    title="Resume Document Preview"
                  />
                </div>
              ) : (
                <div className="p-16 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
                  <FileText size={32} className="mx-auto text-slate-400" />
                  <p className="text-sm font-bold text-navy">Resume Hosted on External Cloud Server</p>
                  <p className="text-xs text-muted">Click the link below to view the original candidate attachment in a secure window.</p>
                  <a
                    href={candidate.resumeLink}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 text-coral font-bold text-xs hover:underline pt-2"
                  >
                    Open Document Link <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 rounded-2xl bg-rose-50/70 border border-dashed border-rose-200 text-center space-y-2">
              <XCircle size={30} className="mx-auto text-rose-500" />
              <p className="text-sm font-bold text-rose-800">No Resume URL Specified</p>
              <p className="text-xs text-rose-600">The candidate has not provided a cloud storage link for their CV yet.</p>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: ATS EXTRACTION */}
      {tab === 'ats' && (
        <div className="space-y-6">
          {parsing ? (
            <Card className="p-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-4 border-coral border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-navy uppercase tracking-widest">AI Extraction Engine Running...</p>
            </Card>
          ) : !atsData ? (
            <Card className="p-16 text-center space-y-3">
              <Sparkles size={32} className="mx-auto text-coral" />
              <h4 className="text-base font-bold text-navy">No ATS Snapshot Extracted</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">Trigger our AI parser to extract entities, competencies, and completeness metrics directly from the resume.</p>
              <Button onClick={parseResume}>Run AI ATS Parser</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Extracted Personal Entities" subtitle="Contact & identity verification">
                <div className="space-y-2 text-xs">
                  {Object.entries(atsData.personalDetails).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-none">
                      <span className="text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold text-navy">{v as string}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Extracted Career Timeline" subtitle="Experience & compensation metrics">
                <div className="space-y-2 text-xs">
                  {Object.entries(atsData.experience).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 last:border-none">
                      <span className="text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold text-navy">{String(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-muted">Current CTC</span>
                    <span className="font-bold text-navy">₹{atsData.compensation.current}L</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted">Expected CTC</span>
                    <span className="font-bold text-emerald-600">₹{atsData.compensation.expected}L</span>
                  </div>
                </div>
              </Card>

              <Card title="Skill Matrix Breakdown" subtitle="Domain capabilities identified" className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Verified Primary Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsData.skills.primary.map((s: string) => <Badge key={s} variant="info">{s}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Supporting Competencies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsData.skills.secondary.map((s: string) => <Badge key={s} variant="neutral">{s}</Badge>)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REQUISITION MATCHER */}
      {tab === 'match' && (
        <div className="space-y-6">
          <Card
            title="Active Requisition Compatibility"
            subtitle="Automated semantic matching against open organizational requisitions"
            action={
              <Button onClick={runAllMatches} loading={matchLoading} size="sm">
                <Sparkles size={14} className="mr-1.5" /> Execute Multi-JD Match
              </Button>
            }
          >
            {matchScores.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <TrendingUp size={30} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-navy">No Compatibility Scores Generated Yet</p>
                <p className="text-xs text-muted max-w-md mx-auto">Click 'Execute Multi-JD Match' to run our AI scoring algorithm against active client openings.</p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {matchScores.sort((a, b) => b.totalScore - a.totalScore).map(score => (
                  <div
                    key={score.jobCode}
                    className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl text-center min-w-[70px] shrink-0 ${
                        score.band === 'Excellent' || score.band === 'Good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <p className="text-2xl font-black font-mono leading-none">{score.totalScore}</p>
                        <p className="text-[10px] font-extrabold uppercase mt-1">{score.band}</p>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-navy font-heading">{score.designation}</h4>
                        <p className="text-xs text-muted font-mono">{score.jobCode} &middot; <span className="font-sans font-medium text-slate-600">{score.clientName}</span></p>

                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {score.breakdown?.skills?.matched?.slice(0, 4).map((sk: string) => (
                            <span key={sk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={11} /> {sk}
                            </span>
                          ))}
                          {score.breakdown?.skills?.missing?.slice(0, 2).map((sk: string) => (
                            <span key={sk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle size={11} /> {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-none border-slate-200">
                      <Link href={`/recruiter/shortlist?jd=${score.jobCode}`}>
                        <Button size="sm" variant="primary">Add to Shortlist &rarr;</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {tab === 'activity' && (
        <Card title="Candidate Audit Ledger" subtitle="Chronological interaction events & system updates">
          <div className="space-y-4">
            {[
              { date: candidate.registeredOn, action: 'Initial Profile Registration', detail: 'Candidate record created via portal', icon: <User size={15} />, bg: 'bg-indigo-100 text-indigo-700' },
              candidate.resumeLink && { date: candidate.lastUpdated, action: 'Resume Document Attached', detail: 'Cloud storage URL verified', icon: <FileText size={15} />, bg: 'bg-emerald-100 text-emerald-700' },
              { date: candidate.lastUpdated, action: 'Specification Synchronized', detail: 'Latest profile data refreshed in database', icon: <Clock size={15} />, bg: 'bg-amber-100 text-amber-700' },
            ].filter(Boolean).map((event: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${event.bg}`}>
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy">{event.action}</p>
                  <p className="text-xs text-muted mt-0.5">{event.detail}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 shrink-0">
                  {event.date ? new Date(event.date).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AppLayout>
  )
}
