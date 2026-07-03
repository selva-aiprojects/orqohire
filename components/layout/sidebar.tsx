'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, Briefcase, Zap, Kanban, BarChart3, ShieldCheck,
  LogOut, Menu, X, LayoutDashboard, Sparkles, ChevronLeft, ChevronRight,
  Building2, ChevronDown
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const recruitmentItems: NavItem[] = [
  { label: 'Dashboard',         href: '/recruiter/dashboard',    icon: <LayoutDashboard size={19} /> },
  { label: 'Candidate Pool',    href: '/recruiter/candidates',   icon: <Users size={19} />, badge: 'AI' },
  { label: 'Requisitions',      href: '/recruiter/requirements', icon: <Briefcase size={19} /> },
]

const pipelineItems: NavItem[] = [
  { label: 'AI Shortlist',      href: '/recruiter/shortlist',    icon: <Zap size={19} /> },
  { label: 'Pipeline Kanban',   href: '/recruiter/pipeline',     icon: <Kanban size={19} /> },
  { label: 'Talent Analytics',  href: '/recruiter/analytics',    icon: <BarChart3 size={19} /> },
]

const systemItems: NavItem[] = [
  { label: 'Admin Console',     href: '/admin/dashboard',        icon: <ShieldCheck size={19} /> },
]

interface SidebarProps {
  userName?: string
  collapsed?: boolean
  onCollapseChange?: (v: boolean) => void
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/recruiter/dashboard')
    return (
      <Link
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 group relative ${
          active
            ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-white font-extrabold border-l-4 border-cyan-400 shadow-sm'
            : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-semibold'
        } ${isCollapsed ? 'justify-center px-0 border-l-0' : ''}`}
      >
        <div className={`flex items-center gap-3.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
          <span className={`shrink-0 transition-colors ${active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'}`}>
            {item.icon}
          </span>
          {!isCollapsed && <span className="truncate tracking-tight">{item.label}</span>}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-2.5 shrink-0">
            {item.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono shadow-2xs">
                {item.badge}
              </span>
            )}
            {active && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#38BDF8]" />
            )}
          </div>
        )}
      </Link>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B132B] text-white select-none border-r border-white/10">
      {/* Brand Header */}
      <div className={`flex items-center h-20 border-b border-white/10 shrink-0 px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link href="/recruiter/dashboard" className="flex items-center gap-3 group min-w-0">
          {!isCollapsed ? (
            <img
              src="/logo.png"
              alt="OrqoHire Logo"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-lg shadow-md">
              O
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Tenant / Workspace Switcher Pill */}
      {!isCollapsed && (
        <div className="px-5 pt-5 shrink-0">
          <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-3 shadow-xs hover:bg-white/[0.07] transition-colors cursor-pointer">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-2xs">
                <Building2 size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate leading-none">OrqoHire Corporate Hub</p>
                <p className="text-[10px] text-slate-400 font-semibold truncate mt-1">Recruitment Workspace</p>
              </div>
            </div>
            <ChevronDown size={15} className="text-slate-400 shrink-0" />
          </div>
        </div>
      )}

      {/* Expand trigger when collapsed */}
      {isCollapsed && (
        <div className="px-3 pt-5 shrink-0">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 px-4 py-6 space-y-7 overflow-y-auto custom-scrollbar">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">RECRUITMENT & CATALOG</span>
              <span className="text-[10px] text-slate-500 font-bold">⌄</span>
            </div>
          )}
          <nav className="space-y-1.5">
            {recruitmentItems.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">PIPELINE & LOGISTICS</span>
              <span className="text-[10px] text-slate-500 font-bold">⌄</span>
            </div>
          )}
          <nav className="space-y-1.5">
            {pipelineItems.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">ORGANIZATION</span>
            </div>
          )}
          <nav className="space-y-1.5">
            {systemItems.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>
        </div>
      </div>

      {/* User Footer Strip */}
      <div className="border-t border-white/10 p-4 shrink-0 bg-[#070D1F]">
        <div className={`flex items-center bg-white/[0.05] border border-white/10 rounded-xl p-3 shadow-xs ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white text-xs font-black">
                {userName?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-white text-xs font-black truncate leading-tight">{userName || 'System'}</p>
                <p className="text-slate-400 text-[9px] font-extrabold uppercase tracking-widest truncate mt-1">SUPER ADMIN</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => fetch('/api/auth', { method: 'DELETE' }).then(() => window.location.href = '/login')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer shrink-0"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden w-10 h-10 rounded-xl bg-[#0B132B] border border-white/10 flex items-center justify-center text-white shadow-lg cursor-pointer"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-[#0B132B] flex flex-col z-50 shadow-2xl lg:hidden transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex sticky top-0 left-0 h-screen shrink-0 transition-all duration-300 z-30 shadow-2xl ${
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      }`}>
        {sidebarContent}
      </aside>
    </>
  )
}
