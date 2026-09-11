const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
})

const inrFormatterDecimal = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
})

export function formatINR(amount: number, withDecimals = false): string {
  return withDecimals ? inrFormatterDecimal.format(amount) : inrFormatter.format(amount)
}

export function formatCompactINR(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (abs >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (abs >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return formatINR(amount)
}

export function todayISO(): string {
  const d = new Date()
  return toISODate(d)
}

export function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthKeyFromDate(dateStr: string): string {
  return dateStr.slice(0, 7)
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatRelativeDate(dateStr: string): string {
  const today = todayISO()
  const yesterday = toISODate(new Date(Date.now() - 86400000))
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return formatShortDate(dateStr)
}

export function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return monthKey(d)
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return 'Good Night'
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 21) return 'Good Evening'
  return 'Good Night'
}
