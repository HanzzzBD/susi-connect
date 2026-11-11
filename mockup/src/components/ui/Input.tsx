/**
 * Field — resep "Input" DESIGN §7.3 (bg-surface-2 rounded-xl px-3 py-2.5).
 * Validasi: pesan merah di bawah field + aria-describedby (UI-SPEC §0 "Validasi").
 */
import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface FieldProps {
  label: string
  error?: string | null
  hint?: ReactNode
  children: (id: string, describedBy: string | undefined) => ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const errId = `${id}-err`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      {children(id, error ? errId : undefined)}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={errId} className="text-xs font-semibold text-accent-red">
          {error}
        </p>
      )}
    </div>
  )
}

const BOX = 'w-full bg-surface-2 rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none border focus:border-brand-blue'

export function TextInput({ invalid, className, ...rest }: ComponentProps<'input'> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn(BOX, 'min-h-11', invalid ? 'border-accent-red' : 'border-transparent', className)} {...rest} />
}

export function TextArea({ invalid, className, ...rest }: ComponentProps<'textarea'> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={cn(BOX, 'min-h-24 resize-none', invalid ? 'border-accent-red' : 'border-transparent', className)} {...rest} />
}

export function Select({ invalid, className, children, ...rest }: ComponentProps<'select'> & { invalid?: boolean }) {
  return (
    <select aria-invalid={invalid || undefined} className={cn(BOX, 'min-h-11 cursor-pointer', invalid ? 'border-accent-red' : 'border-transparent', className)} {...rest}>
      {children}
    </select>
  )
}
