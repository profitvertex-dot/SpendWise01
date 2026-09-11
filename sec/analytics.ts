import type { BudgetSettings, Category, Expense } from '../types'
import { CATEGORIES } from '../types'
import { monthKeyFromDate, shiftMonth } from './format'

export function expensesForMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((e) => monthKeyFromDate(e.date) === month)
}

export function totalOf(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export interface CategoryBreakdownRow {
  category: Category
  amount: number
  percent: number
  count: number
}

export function categoryBreakdown(expenses: Expense[]): CategoryBreakdownRow[] {
  const total = totalOf(expenses)
  const rows = CATEGORIES.map((category) => {
    const catExpenses = expenses.filter((e) => e.category === category)
    const amount = totalOf(catExpenses)
    return {
      category,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      count: catExpenses.length
    }
  })
  return rows.filter((r) => r.amount > 0).sort((a, b) => b.amount - a.amount)
}

export interface WeeklyPoint {
  label: string
  amount: number
}

/** Buckets a month's expenses into ISO-ish week chunks (Week 1..Week 5). */
export function weeklySeries(expenses: Expense[]): WeeklyPoint[] {
  const buckets = new Map<number, number>()
  for (const e of expenses) {
    const day = Number(e.date.slice(8, 10))
    const week = Math.min(4, Math.floor((day - 1) / 7)) // clamp to 5 buckets (0..4)
    buckets.set(week, (buckets.get(week) ?? 0) + e.amount)
  }
  const points: WeeklyPoint[] = []
  for (let w = 0; w <= 4; w++) {
    if (buckets.has(w) || w <= (buckets.size ? Math.max(...buckets.keys()) : 0)) {
      points.push({ label: `Week ${w + 1}`, amount: Math.round(buckets.get(w) ?? 0) })
    }
  }
  return points.length ? points : [{ label: 'Week 1', amount: 0 }]
}

export function moneyScore(spent: number, budget: number): number {
  if (budget <= 0) return spent === 0 ? 100 : 50
  const ratio = spent / budget
  if (ratio <= 0.5) return 100
  if (ratio <= 1) return Math.round(100 - (ratio - 0.5) * 80) // 100 -> 60 as ratio goes 0.5 -> 1
  const overRatio = Math.min(ratio - 1, 1)
  return Math.max(0, Math.round(60 - overRatio * 60)) // 60 -> 0 as spending doubles the budget
}

export interface Insight {
  id: string
  text: string
  tone: 'positive' | 'warning' | 'neutral'
}

export function buildSmartInsights(
  currentMonthExpenses: Expense[],
  previousMonthExpenses: Expense[],
  budget: BudgetSettings
): Insight[] {
  const insights: Insight[] = []
  const currentByCat = categoryBreakdown(currentMonthExpenses)
  const previousByCat = categoryBreakdown(previousMonthExpenses)

  for (const row of currentByCat.slice(0, 3)) {
    const prevRow = previousByCat.find((p) => p.category === row.category)
    const prevAmount = prevRow?.amount ?? 0
    const change = percentChange(row.amount, prevAmount)
    if (change !== null && Math.abs(change) >= 15) {
      insights.push({
        id: `cat-${row.category}`,
        text:
          change > 0
            ? `You spent ${change}% more on ${row.category} this month.`
            : `Nice — you spent ${Math.abs(change)}% less on ${row.category} this month.`,
        tone: change > 0 ? 'warning' : 'positive'
      })
    }
  }

  const totalSpent = totalOf(currentMonthExpenses)
  if (budget.monthlyTotal > 0) {
    const usedPercent = Math.round((totalSpent / budget.monthlyTotal) * 100)
    if (usedPercent >= 100) {
      insights.push({
        id: 'budget-over',
        text: `You've crossed your monthly budget by ${formatOverPercent(usedPercent)}.`,
        tone: 'warning'
      })
    } else if (usedPercent >= 80) {
      insights.push({
        id: 'budget-warning',
        text: `You've used ${usedPercent}% of your monthly budget already.`,
        tone: 'warning'
      })
    }
  }

  for (const row of currentByCat) {
    const catBudget = budget.categoryBudgets[row.category] ?? 0
    if (catBudget > 0 && row.amount > catBudget) {
      insights.push({
        id: `overbudget-${row.category}`,
        text: `${row.category} spending has gone over its category budget.`,
        tone: 'warning'
      })
    }
  }

  const paymentCounts = new Map<string, number>()
  for (const e of currentMonthExpenses) {
    paymentCounts.set(e.paymentMethod, (paymentCounts.get(e.paymentMethod) ?? 0) + 1)
  }
  if (currentMonthExpenses.length >= 5) {
    const top = [...paymentCounts.entries()].sort((a, b) => b[1] - a[1])[0]
    if (top) {
      const percent = Math.round((top[1] / currentMonthExpenses.length) * 100)
      if (percent >= 60) {
        insights.push({
          id: 'payment-habit',
          text: `${percent}% of your transactions this month were via ${top[0]}.`,
          tone: 'neutral'
        })
      }
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: 'steady',
      text: 'Your spending looks steady compared to last month. Keep it up!',
      tone: 'positive'
    })
  }

  return insights.slice(0, 4)
}

function formatOverPercent(usedPercent: number): string {
  const over = usedPercent - 100
  return `${over}%`
}

export function previousMonthKey(month: string): string {
  return shiftMonth(month, -1)
}
