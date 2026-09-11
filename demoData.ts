import type { Category, Expense, PaymentMethod } from '../types'
import { CATEGORIES, PAYMENT_METHODS } from '../types'
import { toISODate } from './format'

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomAmount(category: Category): number {
  const ranges: Record<Category, [number, number]> = {
    Food: [80, 650],
    Travel: [50, 1800],
    Shopping: [300, 4500],
    'Bills & Utilities': [400, 3200],
    Health: [150, 2500],
    Entertainment: [150, 1200],
    Education: [500, 6000],
    Other: [50, 900]
  }
  const [min, max] = ranges[category]
  return Math.round((min + Math.random() * (max - min)) / 10) * 10
}

const NOTES: Partial<Record<Category, string[]>> = {
  Food: ['Swiggy order', 'Groceries', 'Lunch with team', 'Café coffee', 'Dinner out'],
  Travel: ['Uber ride', 'Metro card recharge', 'Fuel', 'Flight booking', 'Auto fare'],
  Shopping: ['Amazon order', 'New shoes', 'Myntra haul', 'Electronics'],
  'Bills & Utilities': ['Electricity bill', 'Mobile recharge', 'Wi-Fi bill', 'Rent'],
  Health: ['Pharmacy', 'Doctor visit', 'Gym membership'],
  Entertainment: ['Movie tickets', 'Netflix', 'Concert'],
  Education: ['Online course', 'Books', 'Tuition fee']
}

/**
 * Generates realistic-looking demo transactions across the current
 * and previous month so every screen (Home, Analytics, Budget) has
 * something meaningful to show.
 */
export function generateDemoExpenses(): Expense[] {
  const expenses: Expense[] = []
  const now = new Date()

  for (let monthOffset = 1; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
    const maxDay = monthOffset === 0 ? now.getDate() : daysInMonth
    const count = 18 + Math.floor(Math.random() * 10)

    for (let i = 0; i < count; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay)
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
      const category = randomOf(CATEGORIES)
      const notesForCategory = NOTES[category]
      const paymentMethod: PaymentMethod = randomOf(PAYMENT_METHODS)

      expenses.push({
        id: `demo-${monthOffset}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        amount: randomAmount(category),
        category,
        date: toISODate(date),
        paymentMethod,
        note: notesForCategory ? randomOf(notesForCategory) : undefined,
        createdAt: date.toISOString()
      })
    }
  }

  return expenses.sort((a, b) => (a.date < b.date ? 1 : -1))
}
