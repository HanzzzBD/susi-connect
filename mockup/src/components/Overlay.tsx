/**
 * Lapisan overlay di dalam bingkai perangkat. Dialog/sheet dirender lewat portal ke sini
 * supaya tetap berada di dalam frame 390×844 (bukan menutupi seluruh jendela browser).
 */
import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export const OverlayRootContext = createContext<HTMLElement | null>(null)

export function Portal({ children }: { children: ReactNode }) {
  const root = useContext(OverlayRootContext)
  if (!root) return null
  return createPortal(children, root)
}
