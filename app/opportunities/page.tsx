'use client'
import React, { useState, useEffect } from 'react'
import { Card, Badge, Button } from '@/components/ui'
import { Search, Briefcase, Clock, DollarSign, MapPin, Building2, ExternalLink, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['All','Technology','Human Resources','Construction','Safety','Sales','Management','Analysis']
const SOURCES    = ['All','Direct Client','Trainer Network','Partner Recruiter','Community','Internal']

const CAT_STYLES: Record<string, string> = {
  Technology:       'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
  'Human Resources':'bg-rose-50 text-rose-700 border border-rose-200/60',
  Construction:     'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  Safety:           'bg-amber-50 text-amber-700 border border-amber-200/60',
  Sales:            'bg-purple-50 text-purple-700 border border-purple-200/60',
  Management:       'bg-blue-50 text-blue-700 border border-blue-200/60',
  Analysis:         'bg-cyan-50 text-cyan-700 border border-cyan-200/60',
}

export default function OpportunitiesPage() {
  const [jobs, setJobs]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [source, setSource]   = useState('All')
  const [applying, setApplying] = useState<string|null>(null)
  const [applied, setApplied] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/requirements?status=Active').then(r => r.json()).then(d => {
      if (d.success) {
        setJobs(d.data.map((j: any) => ({ ...j, category: detectCategory(j.designation), source: 'Direct Client' })))
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function detectCategory(title: string): string {
    const t = title.toLowerCase()
    if (/engineer|developer|data|cloud|devops/.test(t)) return 'Technology'
    if (/hr|human|talent|recruiter/.test(t)) return 'Human Resources'
    if (/site|civil|architect|construction/.test(t)) return 'Construction'
    if (/safety|ehs|hse/.test(t)) return 'Safety'
    if (/sales|account|business development/.test(t)) return 'Sales'
    if (/manager|lead|head/.test(t)) return 'Management'
    if (/analyst|analysis/.test(t)) return 'Analysis'
    return 'Technology'
  }

  const filtered = jobs.filter(j => {
    if (search && !j.designation.toLowerCase().includes(search.toLowerCase()) && !j.location.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'All' && j.category !== category) return false
    if (source !== 'All' && j.source !== source) return false
    return true
  })

  async function apply(job: any) {
    setApplying(job.jobCode)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobCode: job.jobCode, candidateId: `OPP-${Date.now()}`, candidateName: 'Applicant', clientName: job.clientName })
      })
      const data = await res.json()
      if (data.success) setApplied(prev => new Set([...prev, job.jobCode]))
      else alert(data.error)
    } catch {
      alert('Failed to submit application. Please verify login.')
    }
    setApplying(null)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-coral selection:text-white">
      {/* Top Navbar */}
      <nav className="h-16 px-6 sm:px-12 bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-white/10 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="OrqoHire Logo" className="h-10 w-auto object-contain" />
          <span className="text-[10px] text-coral font-bold tracking-widest uppercase hidden sm:block border-l border-white/10 pl-3">Opportunity Hub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/register">
            <Button size="sm" variant="primary">Create Candidate Profile</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#0F172A] via-[#131F37] to-[#1E293B] text-white px-6 py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-coral/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold text-coral">
            <Sparkles size={13} /> Active Requisitions
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight">
            Explore Open Career Opportunities
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Discover {jobs.length} vetted positions matched with cutting-edge AI scoring across top enterprise organizations.
          </p>

          {/* Search Bar Container */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="p-2 bg-white rounded-2xl shadow-xl flex items-center gap-2 border border-slate-200">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search role title, technical skill, or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none rounded-xl text-navy text-sm font-medium outline-none placeholder:text-slate-400"
                />
              </div>
              <Button size="md" className="shrink-0 px-6">Search Positions</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Filters */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? jobs.length : jobs.filter(j => j.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  category === cat
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-muted hover:text-navy border border-border hover:border-slate-300'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  category === cat ? 'bg-coral text-white' : 'bg-slate-100 text-muted'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Job Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-border p-6 animate-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-muted">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-navy">No Matching Positions</h3>
            <p className="text-xs text-muted max-w-md mx-auto">Try adjusting your search query or category filters to discover active opportunities.</p>
            <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setCategory('All') }}>Clear All Filters</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(job => (
              <Card
                key={job.jobCode}
                hover
                className="flex flex-col justify-between p-6 bg-white border-slate-200/80 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${CAT_STYLES[job.category] || CAT_STYLES.Technology}`}>
                      {job.category}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {job.jobCode}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-navy text-base font-bold font-heading group-hover:text-coral transition-colors leading-snug">
                      {job.designation}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted font-medium">
                      <span className="flex items-center gap-1"><Building2 size={13} /> {job.clientName?.trim() || 'Confidential Client'}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                    </div>
                  </div>

                  {/* Key Stats Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100">
                    <div className="text-center p-1.5 rounded-lg bg-slate-50/80">
                      <Briefcase size={14} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-[11px] font-bold text-navy truncate">{job.employmentType || 'Full-time'}</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg bg-slate-50/80">
                      <Clock size={14} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-[11px] font-bold text-navy">{job.minExperience}{job.maxExperience ? `-${job.maxExperience}` : '+'} Yrs</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg bg-slate-50/80">
                      <DollarSign size={14} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-[11px] font-bold text-navy">{job.budgetMax > 0 ? `₹${job.budgetMax}L` : 'Best in Industry'}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 space-y-2">
                  {job.jobDescription?.startsWith('http') && (
                    <a
                      href={job.jobDescription}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View External Specification <ExternalLink size={12} />
                    </a>
                  )}

                  <Button
                    onClick={() => apply(job)}
                    disabled={applied.has(job.jobCode) || applying === job.jobCode}
                    variant={applied.has(job.jobCode) ? 'secondary' : 'primary'}
                    className="w-full py-2.5 font-bold shadow-sm"
                  >
                    {applying === job.jobCode ? (
                      'Submitting...'
                    ) : applied.has(job.jobCode) ? (
                      <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={16} /> Application Submitted</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">Apply for Role <ArrowRight size={14} /></span>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
