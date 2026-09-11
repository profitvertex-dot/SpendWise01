export type Category =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Health'
  | 'Entertainment'
  | 'Education'
  | 'Other'

export const CATEGORIES: Category[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Education',
  'Other'
]

export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Other'

export const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Other']

export interface Expense {
  id: string
  amount: number
  category: Category
  date: string // ISO date string (YYYY-MM-DD)
  paymentMethod: PaymentMethod
  note?: string
  createdAt: string // ISO timestamp
}

export interface CategoryBudgets {
  [key: string]: number // Category -> monthly budget amount
}

export interface BudgetSettings {
  monthlyTotal: number
  categoryBudgets: CategoryBudgets
}

export interface Profile {
  name: string
  email: string
  isPro: boolean
  proPlan?: 'monthly' | 'yearly' | 'lifetime'
}

export type PlanId = 'monthly' | 'yearly' | 'lifetime'
