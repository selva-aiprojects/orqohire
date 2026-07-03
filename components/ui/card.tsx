import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  padding?: boolean
  hover?: boolean
  glass?: boolean
}

export function Card({
  title,
  subtitle,
  action,
  padding = true,
  hover = false,
  glass = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const hasHeader = title || action
  return (
    <div
      className={`rounded-2xl border border-border shadow-sm transition-all duration-300 ${
        glass ? 'glass-panel' : 'bg-white'
      } ${
        hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className={`flex items-center justify-between border-b border-slate-100 ${padding ? 'px-6 py-4' : 'px-4 py-3'}`}>
          <div>
            {title && <h3 className="text-base font-bold text-navy font-heading tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-muted mt-0.5 font-normal">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={padding ? (hasHeader ? 'p-6 pt-5' : 'p-6') : ''}>
        {children}
      </div>
    </div>
  )
}
