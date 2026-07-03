'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { ShieldCheck, CheckCircle2, XCircle, Building2, User, Clock, AlertTriangle } from 'lucide-react'

export default function VerifyPage() {
  const params   = useParams()
  const token    = params.token as string
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [deciding, setDeciding] = useState(false)
  const [done, setDone]       = useState<'CONFIRM' | 'REJECT' | null>(null)
  const [verifiedBy, setVerifiedBy] = useState('')

  useEffect(() => {
    fetch(`/api/verify/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data)
        else setError(d.error)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to connect to verification server.')
        setLoading(false)
      })
  }, [token])

  async function decide(decision: 'CONFIRM' | 'REJECT') {
    if (!verifiedBy.trim()) return
    setDeciding(true)
    try {
      const res  = await fetch(`/api/verify/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, verifiedBy }),
      })
      const d = await res.json()
      if (d.success) setDone(decision)
      else setError(d.error)
    } catch {
      setError('Verification submission failed.')
    }
    setDeciding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-coral border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-muted uppercase tracking-widest">Loading Verification Ledger...</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B132B] via-[#16223D] to-[#0B132B] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center space-y-4 shadow-2xl animate-float">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
            done === 'CONFIRM' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}>
            {done === 'CONFIRM' ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
          </div>
          <h2 className="text-2xl font-black font-heading text-navy">
            {done === 'CONFIRM' ? 'Employment Verified!' : 'Employment Record Rejected'}
          </h2>
          <p className="text-sm text-muted">
            {done === 'CONFIRM'
              ? 'Thank you for attesting to this work history. The candidate\'s digital trust passport has been cryptographically updated.'
              : 'Thank you for responding. The dispute note has been logged to the candidate\'s record.'}
          </p>
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Cryptographically signed by OrqoHire Trust Network
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 border border-red-100 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={30} />
          </div>
          <h2 className="text-xl font-bold font-heading text-navy">Invalid or Expired Request</h2>
          <p className="text-xs text-muted leading-relaxed">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-slate-200/80 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="bg-[#0B132B] px-3 py-1.5 rounded-xl shadow-sm flex items-center">
            <img src="/logo.png" alt="OrqoHire Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="border-l border-slate-200 pl-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Official Portal</p>
            <p className="text-xs text-muted">Employer Verification</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-navy font-heading">Attest Candidate Work History</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            A candidate has listed your organization on their digital passport. Please review the employment details below and confirm or reject their record.
          </p>
        </div>

        {/* Details Panel */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
            <ShieldCheck size={14} /> Verification Ledger Entry
          </div>
          <div className="space-y-2 pt-1 text-xs">
            {[
              ['Candidate Reference', data?.candidateId || 'CAN-XXXX'],
              ['Employer Contact Email', data?.employerEmail || 'Verified Email'],
              ['Dispatched On', data?.sentAt ? new Date(data.sentAt).toLocaleDateString() : 'Active Request'],
              ['Token Expiry', data?.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : 'Never'],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between items-center py-1 border-b border-slate-200/50 last:border-none">
                <span className="text-muted">{label as string}</span>
                <span className="font-bold text-navy font-mono">{val as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verifying Officer Input */}
        <div className="space-y-2">
          <Input
            label="Verifying Officer Full Name & Title"
            placeholder="e.g. Priya Sharma, HR Business Partner"
            icon={<User size={16} />}
            value={verifiedBy}
            onChange={e => setVerifiedBy(e.target.value)}
            required
            helperText="Your name will be permanently appended to the verification signature."
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button
            variant="danger"
            onClick={() => decide('REJECT')}
            disabled={deciding || !verifiedBy.trim()}
            className="w-full py-3"
          >
            <XCircle size={16} /> Reject Record
          </Button>
          <Button
            variant="primary"
            onClick={() => decide('CONFIRM')}
            disabled={deciding || !verifiedBy.trim()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/20"
          >
            <CheckCircle2 size={16} /> Confirm Record
          </Button>
        </div>

        <p className="text-[11px] text-center text-slate-400 pt-2">
          Encrypted & verified via OrqoHire Trust Protocol
        </p>
      </div>
    </div>
  )
}