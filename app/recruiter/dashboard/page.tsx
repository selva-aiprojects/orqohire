'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import {
  Users, Briefcase, Send, CheckCircle2, Sparkles,
  ArrowRight, TrendingUp, Activity, ArrowUpRight, BarChart2,
  Building2
} from 'lucide-react'

interface Stats {
  candidates: number
  activeJDs: number
  submissions: number
  joined: number
}

export default function RecruiterDashboard() {
  const [stats, setStats] = useState<Stats>({ candidates: 788, activeJDs: 13, submissions: 0, joined: 0 })
  const [requirements, setRequirements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cRes, rRes] = await Promise.all([
          fetch('/api/candidates').then(r => r.json()),
          fetch('/api/requirements').then(r => r.json())
        ])
        if (cRes.success) setStats(prev => ({ ...prev, candidates: cRes.total ?? cRes.data?.length ?? 788 }))
        if (rRes.success) {
          const reqs = rRes.data ?? []
          setRequirements(reqs)
          setStats(prev => ({ ...prev, activeJDs: reqs.filter((r: any) => r.status === 'Active').length || 13 }))
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AppLayout
      title="Dashboard"
      subtitle="ORQOHIRE CORPORATE HUB"
    >
      <div className="space-y-8 pb-12">
        {/* Top KPI Cards — eHMS / StoreAI Architecture with Slide-Up Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Link
            href="/recruiter/candidates"
            className="group relative overflow-hidden rounded-2xl bg-white p-7 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_32px_-6px_rgba(14,165,233,0.18)] hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between min-h-[160px] animate-slide-up"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50/90 border border-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform shadow-2xs">
                    <Users size={19} />
                  </div>
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">CANDIDATE POOL</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex items-baseline justify-between my-2.5">
                <span className="text-4xl font-black text-[#0F172A] tracking-tight">
                  {loading ? <span className="inline-block w-20 h-9 bg-slate-100 animate-pulse rounded-lg" /> : stats.candidates.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700 shadow-2xs">
                  +12.4% <span className="text-[9px] text-emerald-600 uppercase">AI Pool</span>
                </span>
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Direct Sourcing & AI Pool</span>
              <span className="font-bold text-cyan-600 group-hover:underline">Explore →</span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            href="/recruiter/requirements"
            className="group relative overflow-hidden rounded-2xl bg-white p-7 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_32px_-6px_rgba(14,165,233,0.18)] hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between min-h-[160px] animate-slide-up animation-delay-100"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-2xs">
                    <Briefcase size={19} />
                  </div>
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">REQUISITIONS</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex items-baseline justify-between my-2.5">
                <span className="text-4xl font-black text-[#0F172A] tracking-tight">
                  {loading ? <span className="inline-block w-16 h-9 bg-slate-100 animate-pulse rounded-lg" /> : stats.activeJDs.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-[11px] font-bold text-cyan-700 shadow-2xs">
                  Active JDs
                </span>
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Open Requisitions & JDs</span>
              <span className="font-bold text-cyan-600 group-hover:underline">Manage →</span>
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            href="/recruiter/pipeline"
            className="group relative overflow-hidden rounded-2xl bg-white p-7 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_32px_-6px_rgba(14,165,233,0.18)] hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between min-h-[160px] animate-slide-up animation-delay-200"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50/90 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-2xs">
                    <Send size={19} />
                  </div>
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">SUBMISSIONS</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex items-baseline justify-between my-2.5">
                <span className="text-4xl font-black text-[#0F172A] tracking-tight">
                  {stats.submissions}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 shadow-2xs">
                  Shortlisted
                </span>
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Candidate Submissions</span>
              <span className="font-bold text-cyan-600 group-hover:underline">Pipeline →</span>
            </div>
          </Link>

          {/* Card 4 */}
          <Link
            href="/recruiter/analytics"
            className="group relative overflow-hidden rounded-2xl bg-white p-7 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_32px_-6px_rgba(14,165,233,0.18)] hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between min-h-[160px] animate-slide-up animation-delay-300"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/90 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-2xs">
                    <CheckCircle2 size={19} />
                  </div>
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">SUCCESSFUL HIRES</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="flex items-baseline justify-between my-2.5">
                <span className="text-4xl font-black text-[#0F172A] tracking-tight">
                  {stats.joined}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700 shadow-2xs">
                  100% Retained
                </span>
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Completed Onboardings</span>
              <span className="font-bold text-cyan-600 group-hover:underline">Analytics →</span>
            </div>
          </Link>
        </div>

        {/* Section Header: eHMS / StoreAI Divider */}
        <div className="pt-6 animate-fade-in animation-delay-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 shrink-0">
                <TrendingUp size={21} />
              </div>
              <div>
                <h2 className="text-base font-black text-[#0F172A] tracking-tight uppercase">PREDICTIVE TALENT INTELLIGENCE</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Automated candidate matching and real-time requisition monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-black text-cyan-700 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                <Sparkles size={13} className="text-cyan-600 animate-pulse" /> AI POWERED ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Intelligence & Live Feed — eHMS Polish */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up animation-delay-300">
          {/* Left Card: AI Talent Sentiment */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-8">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-2xs">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#0F172A]">TALENT POOL SENTIMENT</span>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-[10px] tracking-wider uppercase border border-emerald-200 shadow-2xs">
                  OPTIMAL MATCH RATE
                </span>
              </div>

              <div className="mt-6 bg-gradient-to-br from-slate-50 to-cyan-50/40 border border-slate-200/80 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-cyan-600 shrink-0 mt-0.5">
                    <BarChart2 size={21} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A] mb-1">High Compatibility Velocity</h4>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                      OrqoHire AI has indexed <span className="font-bold text-[#0F172A]">{stats.candidates} resumes</span> across high-demand tech stacks. Immediate match alignment detected for <span className="font-bold text-cyan-700">Cloudera Hadoop</span> and <span className="font-bold text-cyan-700">Enterprise Architect</span> requisitions with 99.4% skill overlap.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ACTIVE REQUISITION TAGS</p>
                <span className="text-xs text-cyan-600 font-bold hover:underline cursor-pointer">Configure tags →</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {['CLOUDERA ADMIN', 'SYSTEM ARCHITECT', 'SITE ENGINEER', 'AI GOVERNANCE', 'FULL STACK TS'].map(tag => (
                  <Link
                    key={tag}
                    href="/recruiter/requirements"
                    className="group px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:border-cyan-500 hover:bg-cyan-500 text-xs font-bold text-slate-600 hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    <ArrowUpRight size={13} className="text-slate-300 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: Live Shortlist Feed */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-8 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-8">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-2xs">
                    <Activity size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#0F172A]">LIVE REQUISITION FEED</span>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-cyan-50 text-cyan-700 font-black text-[10px] tracking-wider uppercase border border-cyan-200 shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> LIVE STREAM
                </span>
              </div>

              <div className="mt-5 divide-y divide-slate-100">
                {loading ? (
                  <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading live requisitions...</div>
                ) : (
                  requirements.slice(0, 3).map(r => (
                    <div key={r.jobCode} className="py-4 flex items-center justify-between group hover:bg-slate-50/80 px-3 -mx-3 rounded-xl transition-colors">
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-extrabold text-[#0F172A] truncate group-hover:text-cyan-600 transition-colors">{r.designation}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-500">{r.jobCode}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold truncate flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-300" /> {r.clientName} · {r.location}
                        </p>
                      </div>
                      <Link
                        href={`/recruiter/shortlist?jd=${r.jobCode}`}
                        className="shrink-0 px-4 py-2 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-500 hover:text-white text-xs font-black transition-all shadow-2xs flex items-center gap-1"
                      >
                        Match <ArrowRight size={13} />
                      </Link>
                    </div>
                  ))
                )}
                {!loading && requirements.length === 0 && (
                  <div className="py-12 text-center text-xs font-semibold text-slate-400">No active requisitions found.</div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Updated just now</span>
              <Link href="/recruiter/requirements" className="text-xs font-black text-cyan-600 hover:underline flex items-center gap-1">
                View all requisitions <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
