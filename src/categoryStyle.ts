import {
  UtensilsCrossed,
  Plane,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  CircleEllipsis,
  type LucideIcon
} from 'lucide-react'
import type { Category } from '../types'

interface CategoryStyle {
  icon: LucideIcon
  bg: string // tailwind bg class for the icon chip
  fg: string // tailwind text class for the icon
  chartColor: string // hex used in Recharts
}

export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  Food: { icon: UtensilsCrossed, bg: 'bg-amber-400/15', fg: 'text-amber-500', chartColor: '#EFA524' },
  Travel: { icon: Plane, bg: 'bg-sky-400/15', fg: 'text-sky-400', chartColor: '#38BDF8' },
  Shopping: { icon: ShoppingBag, bg: 'bg-fuchsia-400/15', fg: 'text-fuchsia-400', chartColor: '#E879F9' },
  'Bills & Utilities': { icon: Receipt, bg: 'bg-rose-400/15', fg: 'text-rose-400', chartColor: '#FB7185' },
  Health: { icon: HeartPulse, bg: 'bg-red-400/15', fg: 'text-red-400', chartColor: '#F87171' },
  Entertainment: { icon: Clapperboard, bg: 'bg-violet-400/15', fg: 'text-violet-400', chartColor: '#A78BFA' },
  Education: { icon: GraduationCap, bg: 'bg-blue-400/15', fg: 'text-blue-400', chartColor: '#60A5FA' },
  Other: { icon: CircleEllipsis, bg: 'bg-grow-400/15', fg: 'text-grow-400', chartColor: '#3ED985' }
}
