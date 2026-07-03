import { HTMLAttributes } from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[#ECFDF5] text-success border border-[#05966930]',
  warning: 'bg-[#FFFBEB] text-warning border border-[#D9770630]',
  error:   'bg-[#FEF2F2] text-error border border-[#DC262630]',
  info:    'bg-[#EEF2FF] text-info border border-[#3B82F630]',
  neutral: 'bg-[#F3F4F6] text-muted-dark border border-[#6B728030]',
}

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-pill ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
