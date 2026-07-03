import { InputHTMLAttributes, forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-navy mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">{icon}</div>
        )}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-navy placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-coral focus:ring-4 focus:ring-coral/10 ${
            error ? 'border-error bg-red-50/50 focus:border-error focus:ring-error/10' : ''
          } ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-error mt-1.5 flex items-center gap-1">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      {!error && helperText && <p className="text-xs text-muted mt-1">{helperText}</p>}
    </div>
  )
)
Input.displayName = 'Input'
