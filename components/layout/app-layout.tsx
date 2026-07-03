'use client'
import React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface AppLayoutProps {
  children: React.ReactNode
  userName?: string
  title?: string
  subtitle?: string
  roleLabel?: string
}

export function AppLayout({ children, userName, title, subtitle }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar userName={userName} />

      {/* Main content — sits naturally beside sticky sidebar */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header userName={userName} title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-[1500px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
