'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Card, Input, Button, Badge } from '@/components/ui'
import { Search, X, Users, MapPin, Clock, ArrowRight } from 'lucide-react'

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [filtering, setFiltering]   = useState(false)
  const [search, setSearch]         = useState('')
  const [minExp, setMinExp]         = useState('')
  const [maxExp, setMaxExp]         = useState('')
  const [error, setError]           = useState('')

  async function load(params = '') {
    params === '' ? setLoading(true) : setFiltering(true)
    setError('')
    try {
      const res  = await fetch(`/api/candidates?${params}`)
      const data = await res.json()
      if (data.success) setCandidates(data.data)
      else setError(data.error)
    } catch {
      setError('Failed to load candidates.')
    }
    setLoading(false)
    setFiltering(false)
  }

  useEffect(() => { load() }, [])

  function applyFilters() {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (minExp) p.set('minExp', minExp)
    if (maxExp) p.set('maxExp', maxExp)
    load(p.toString())
  }

  function clearFilters() {
    setSearch(''); setMinExp(''); setMaxExp('')
    load()
  }

  const hasFilters = search || minExp || maxExp

  return (
    <AppLayout
      roleLabel="Recruiter"
      title="Candidates"
      subtitle={loading ? 'Loading...' : `${candidates.length} profiles in database`}
    >
      {/* Filter bar */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <Input
              label="Search profiles"
              placeholder="Name, email, or designation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              icon={<Search size={15} />}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Min exp (yrs)"
              placeholder="0"
              value={minExp}
              onChange={e => setMinExp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              type="number"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Max exp (yrs)"
              placeholder="30"
              value={maxExp}
              onChange={e => setMaxExp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              type="number"
            />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <Button
              onClick={applyFilters}
              loading={filtering}
              className="flex-1"
            >
              Apply filters
            </Button>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters} className="shrink-0 px-3">
                <X size={15} />
              </Button>
            )}
          </div>
        </div>
        {hasFilters && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-muted">
            <span>Filtered results:</span>
            {search && <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-navy">{search}</span>}
            {(minExp || maxExp) && <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-navy">{minExp || '0'} – {maxExp || '∞'} yrs exp</span>}
          </div>
        )}
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Candidates table */}
      <Card padding={false}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 animate-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-slate-100 animate-shimmer" />
                  <div className="h-3 w-32 rounded bg-slate-100 animate-shimmer" />
                </div>
                <div className="h-4 w-20 rounded bg-slate-100 animate-shimmer" />
                <div className="h-4 w-24 rounded bg-slate-100 animate-shimmer hidden md:block" />
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users size={28} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-navy">No candidates found</p>
            <p className="text-xs text-muted">Try adjusting your search or filters</p>
            {hasFilters && <Button size="sm" variant="secondary" onClick={clearFilters}>Clear filters</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-muted uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-4 py-3.5">Experience</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Skills</th>
                  <th className="px-4 py-3.5 hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3.5 hidden lg:table-cell">Notice</th>
                  <th className="px-4 py-3.5 hidden xl:table-cell">Expected CTC</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {candidates.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {c.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy group-hover:text-cyan-600 transition-colors">{c.fullName}</p>
                          <p className="text-xs text-muted">{c.currentDesignation}{c.currentCompany ? ` · ${c.currentCompany}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-bold text-navy">{c.totalExperience}</span>
                      <span className="text-xs text-muted ml-1">yrs</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {(c.primarySkills || []).slice(0, 3).map((s: string) => (
                          <span key={s} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-indigo-100">
                            {s}
                          </span>
                        ))}
                        {(c.primarySkills || []).length > 3 && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            +{c.primarySkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400 shrink-0" /> {c.locationCurrent || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-muted">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400 shrink-0" /> {c.noticePeriodText || `${c.noticePeriodDays || '—'}d`}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell text-xs font-bold text-navy">
                      {c.expectedCTC ? `₹${c.expectedCTC}L` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/recruiter/candidates/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-navy hover:text-white text-navy text-xs font-bold transition-all"
                      >
                        View <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  )
}
