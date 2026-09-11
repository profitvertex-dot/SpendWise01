import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string; title: string; amount: number; dateISO: string; cat: Cat }

const catColor: Record<Cat, string> = { Food: '#00F5FF', Gym: '#A855F7', Travel: '#22D3EE', Shopping: '#F472B6', Other: '#FB7185' }
const catEmoji: Record<Cat, string> = { Food: '🍔', Gym: '💪', Travel: '✈️', Shopping: '🛍️', Other: '💸' }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try { const s = localStorage.getItem('sw-final'); return s? JSON.parse(s) : [] } catch { return [] }
  })
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem('sw-theme') === 'dark' } catch { return true }
  })
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Food')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [viewMonth, setViewMonth] = useState(() => new Date().toISOString().slice(0, 7))

  useEffect(() => { localStorage.setItem('sw-final', JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { localStorage.setItem('sw-theme', dark? 'dark' : 'light') }, [dark])

  const filtered = useMemo(() => expenses.filter(e => e.dateISO.startsWith(viewMonth)), [expenses, viewMonth])
  const totalMonth = filtered.reduce((s, e) => s + e.amount, 0)

  const add = () => {
    if (!title.trim() ||!amount) return
    const newExp: Expense = { id: Date.now().toString(), title: title.trim(), amount: Number(amount), cat, dateISO: date }
    setExpenses([newExp,...expenses]); setTitle(''); setAmount('')
  }
  const del = (id: string) => setExpenses(expenses.filter(e => e.id!== id))

  const bg = dark? '#0a0a12' : '#f8f9ff'
  const cardBg = dark? 'rgba(255,255,255,0.06)' : '#ffffff'
  const cardBorder = dark? '1px solid rgba(255,255,255,0.12)' : '1px solid #f0f0ff'
  const text = dark? '#ffffff' : '#111'
  const subText = dark? '#9ca3af' : '#6b7280'

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'system-ui', color: text, transition: '0.3s' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: 16, paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div><h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>SpendWise <span style={{ fontSize: 12, color: '#A855F7' }}>✨ Dark Mode</span></h1><p style={{ margin: 0, color: subText, fontSize: 12 }}>Sep 2026 • Neon Enabled</p></div>
          <button onClick={() => setDark(!dark)} style={{ background: dark? 'rgba(168,85,247,0.2)' : '#f5f5ff', border: cardBorder, borderRadius: 20, padding: '10px 14px', color: text }}>{dark? '☀️' : '🌙'}</button>
        </div>

        {/* Main Card */}
        <div style={{ background: dark? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(168,85,247,0.15))' : 'linear-gradient(135deg, #667eea, #764ba2)', backdropFilter: 'blur(20px)', borderRadius: 28, padding: 24, marginTop: 20, border: cardBorder, boxShadow: dark? '0 0 40px rgba(168,85,247,0.25)' : '0 10px 30px rgba(102,126,234,0.2)' }}>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 11, letterSpacing: 1 }}>TOTAL THIS MONTH</p>
          <h1 style={{ margin: '8px 0', fontSize: 42, fontWeight: 900 }}>₹{totalMonth.toLocaleString('en-IN')}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <span style={{ background: dark? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.2)', border: `1px solid ${catColor.Food}`, padding: '6px 10px', borderRadius: 20, fontSize: 10, color: dark? '#00F5FF' : '#fff' }}>● Food</span>
            <span style={{ background: dark? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.2)', border: `1px solid ${catColor.Gym}`, padding: '6px 10px', borderRadius: 20, fontSize: 10, color: dark? '#A855F7' : '#fff' }}>● Gym</span>
            <span style={{ background: dark? 'rgba(244,114,182,0.15)' : 'rgba(255,255,255,0.2)', border: `1px solid ${catColor.Shopping}`, padding: '6px 10px', borderRadius: 20, fontSize: 10, color: dark? '#F472B6' : '#fff' }}>● Shopping</span>
          </div>
        </div>

        {/* Input */}
        <div style={{ background: cardBg, borderRadius: 22, padding: 16, marginTop: 16, border: cardBorder, backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Kya kharida?" style={{ flex: 1, padding: 14, borderRadius: 14, border: cardBorder, background: dark? 'rgba(255,255,255,0.05)' : '#f6f6ff', color: text, outline: 'none' }} />
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="₹" style={{ width: 80, padding: 14, borderRadius: 14, border: cardBorder, background: dark? 'rgba(255,255,255,0.05)' : '#f6f6ff', color: text, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 14, border: cardBorder, background: dark? 'rgba(255,255,255,0.05)' : '#f6f6ff', color: text }} />
            <select value={cat} onChange={e => setCat(e.target.value as Cat)} style={{ padding: 12, borderRadius: 14, border: cardBorder, background: dark? 'rgba(255,255,255,0.05)' : '#f6f6ff', color: text }}><option>Food</option><option>Gym</option><option>Travel</option><option>Shopping</option><option>Other</option></select>
            <button onClick={add} style={{ padding: '12px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #00F5FF, #A855F7)', color: '#fff', border: 0, fontWeight: 800, boxShadow: '0 0 20px rgba(0,245,255,0.4)' }}>Add +</button>
          </div>
        </div>

        {/* List */}
        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          {filtered.map(e => (
            <div key={e.id} style={{ background: cardBg, padding: 14, borderRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: cardBorder }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${catColor[e.cat]}20`, border: `1px solid ${catColor[e.cat]}40`, display: 'grid', placeItems: 'center' }}>{catEmoji[e.cat]}</div>
                <div><div style={{ fontWeight: 700 }}>{e.title}</div><div style={{ fontSize: 11, color: subText }}>{e.dateISO}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><b style={{ color: catColor[e.cat] }}>₹{e.amount}</b><button onClick={() => del(e.id)} style={{ border: 0, background: dark? 'rgba(255,77,77,0.15)' : '#fff0f0', color: '#ff4d4d', width: 30, height: 30, borderRadius: 10 }}>✕</button></div>
            </div>
          ))}
        </div>

        {/* Toggle Info */}
        <div style={{ marginTop: 20, background: cardBg, border: cardBorder, borderRadius: 16, padding: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: subText }}>Neon Effects: Enabled</span>
          <span style={{ background: dark? '#00F5FF' : '#00F5FF', color: '#000', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>Cyan #00F5FF</span>
          <span style={{ background: '#A855F7', color: '#fff', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>Purple #A855F7</span>
          <span style={{ background: '#F472B6', color: '#fff', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>Pink #F472B6</span>
        </div>
      </div>
    </div>
  )
}
