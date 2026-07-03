interface KPICardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  bg?: string
  color?: string
  trend?: string
  loading?: boolean
}

export function KPICard({ label, value, icon, bg = '#EEF2FF', color = '#4F46E5', trend, loading }: KPICardProps) {
  return (
    <div className="bg-surface rounded-card border border-border shadow-card hover:shadow-cardHover hover:-translate-y-1 transition-all duration-300 p-5 group relative overflow-hidden">
      {/* Subtle background glow */}
      <div 
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl transition-transform group-hover:scale-150"
        style={{ background: color }}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</p>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm"
            style={{ background: bg, color: color }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between relative z-10">
        <p className="text-[32px] font-extrabold text-navy font-heading tracking-tight leading-none">
          {loading ? (
            <span className="inline-block w-16 h-8 rounded animate-shimmer align-middle" />
          ) : value}
        </p>
        {trend && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
