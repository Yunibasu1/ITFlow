import { useState, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name
  const [focused, setFocused] = useState(false)

  const containerClass = [
    'group flex items-center gap-2.5 rounded-xl border px-3.5 transition-all duration-300',
    focused
      ? 'input-gradient-border input-focused border-transparent'
      : error
        ? 'border-red-500/60'
        : 'border-white/10 hover:border-white/20',
  ].join(' ')

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className={`block text-sm font-medium transition-colors duration-300 ${
          focused ? 'text-cyan-400' : 'text-slate-300'
        }`}
      >
        {label}
      </label>
      <div className={containerClass}>
        {icon && (
          <span
            className={`shrink-0 transition-colors duration-300 ${
              focused ? 'text-cyan-400' : 'text-slate-500'
            }`}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600 transition-[caret-color] duration-300 ${className}`}
          style={focused ? { caretColor: '#22d3ee' } : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
