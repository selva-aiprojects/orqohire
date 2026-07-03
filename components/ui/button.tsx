import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]',
  secondary: 'bg-white text-navy border border-border hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-[0.98]',
  outline:   'bg-transparent text-navy border-2 border-slate-200 hover:border-cyan-500 hover:text-cyan-600 active:scale-[0.98]',
  ghost:     'bg-transparent text-muted hover:bg-slate-100 hover:text-navy active:scale-[0.98]',
  danger:    'bg-gradient-to-r from-error to-[#DC2626] text-white hover:shadow-lg hover:shadow-error/25 active:scale-[0.98]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-btn',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-btn',
  lg: 'px-6 py-3.5 text-base font-semibold rounded-btn',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed shadow-none' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
