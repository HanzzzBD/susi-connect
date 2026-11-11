/**
 * Tab bar — resep DESIGN §7.3 "Tab bar" (CustomTabBar app SmartRoute):
 * bg-surface rounded-t-3xl border-t border-x border-line shadow-lg; ikon 22, aktif brand-blue,
 * pasif muted, label text-xs mt-1 (label selalu tampil — UI-SPEC M0).
 */
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/cn'
import type { TabDef } from '../app/navigation'

export function BottomNav({ tabs }: { tabs: TabDef[] }) {
  return (
    <nav aria-label="Navigasi utama" className="flex w-full items-center justify-around rounded-t-3xl border-x border-t border-line bg-surface px-3 pb-3 pt-2 shadow-lg">
      {tabs.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn('flex min-h-11 min-w-14 flex-col items-center justify-center px-1 active:opacity-80', isActive ? 'text-brand-blue' : 'text-muted')
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} aria-hidden />
              <span className={cn('mt-1 text-xs', isActive && 'font-bold')}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
