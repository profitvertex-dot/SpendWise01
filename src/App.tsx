import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string; title: string; amount: number; dateISO: string; cat: Cat }

const catColor: Record<Cat, string> = { Food: '#FF6B6B', Gym: '#4ECDC4', Travel: '#45B7D1', Shopping: '#FFA600', Other: '#A78BFA' }
const catEmoji: Record<Cat, string> = { Food: '🍔', Gym: '💪', Travel: '✈️', Shopping: '🛍️', Other: '💸' }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const s = localStorage.getItem('sw-final')
      return s? JSON.parse(s) : []
    } catch { return [] }
  })
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Food')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [viewMonth, setViewMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [logoError, setLogoError] = useState(false)

  useEffect(() => { localStorage.setItem('sw-final', JSON.stringify(expenses)) }, [expenses])

  const filtered = useMemo(() => expenses.filter(e => e.dateISO.startsWith(viewMonth)), [expenses, viewMonth])
  const totalMonth = filtered.reduce((s, e) => s + e.amount, 0)

  const add = () => {
    if (!title.trim() ||!amount) return
    const newExp: Expense = { id: Date.now().toString(), title: title.trim(), amount: Number(amount), cat, dateISO: date }
    setExpenses([newExp,...expenses])
    setTitle(''); setAmount('')
  }
  const del = (id: string) => setExpenses(expenses.filter(e => e.id!== id))

  const ym = viewMonth.split('-').map(Number)
  const y = ym[0]; const m = ym[1]
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysArr = Array(firstDay).fill(null).concat([...Array(daysInMonth)].map((_, i) => i + 1))
  const getDayTotal = (day: number) => {
    const d = `${viewMonth}-${String(day).padStart(2, '0')}`
    return expenses.filter(e => e.dateISO === d).reduce((s, e) => s + e.amount, 0)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8f9ff 0%, #fff0f6 100%)', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: 16, paddingBottom: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div><h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>SpendWise</h1><p style={{ margin: 0, opacity: 0.5, fontSize: 12 }}>Track smart, spend smarter ✨</p></div>
          {!logoError? <img src="/logo.png" alt="logo" onError={() => setLogoError(true)} style={{ width: 44, height: 44, borderRadius: 14 }} /> : <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900 }}>S</div>}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 28, padding: 24, color: '#fff', marginTop: 20 }}>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 12 }}>TOTAL THIS MONTH</p>
          <h1 style={{ margin: '8px 0', fontSize: 42, fontWeight: 900 }}>₹{totalMonth.toLocaleString('en-IN')}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {(['Food', 'Gym', 'Travel', 'Shopping'] as Cat[]).map(c => (
              <div key={c} style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 20, fontSize: 11 }}>{catEmoji[c]} ₹{filtered.filter(e => e.cat === c).reduce((s, e) => s + e.amount, 0)}</div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 22, padding: 16, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><b>📅 Calendar</b><input type="month" value={viewMonth} onChange={e => setViewMonth
