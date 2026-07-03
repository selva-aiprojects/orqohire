'use client'
import React from 'react'

interface HeaderProps {
  userName?: string
  roleLabel?: string
  title?: string
  subtitle?: string
}

export function Header({ title = 'Dashboard', subtitle = 'ORQOHIRE CORPORATE HUB' }: HeaderProps) {
  return (
    <header className="h-24 border-b border-slate-200/80 bg-white sticky top-0 z-20 px-10 flex items-center justify-between shadow-2xs shrink-0">
      {/* Left: Huge bold title + uppercase subtitle matching StoreAI standard */}
      <div className="min-w-0 py-1">
        <h1 className="text-3xl font-black text-[#0B132B] tracking-tight truncate leading-none">{title}</h1>
        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-2 block truncate">
          {subtitle}
        </p>
      </div>

    </header>
  )
}
