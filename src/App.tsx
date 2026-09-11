import { useState, useEffect } from 'react'

type Expense = { id: string; title: string; amount: number; cat: string }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('spendwise-c')
    return saved? JSON.parse(saved) : [
      { id: '1', title: 'Food', amount: 340, cat: 'Food' },
      { id: '2', title: 'Transport', amount: 120, cat: 'Transport' },
      { id: '3', title: 'Shopping', amount: 520, cat: 'Shopping' },
    ]
  })
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState('Food')

  useEffect(() => {
    localStorage.setItem('spendwise-c', JSON.stringify(expenses))
  }, [expenses])

  const total = expenses.reduce((a, b) => a + b.amount, 0)
  const add = () => {
    if (!title ||!amount) return
    setExpenses([{ id: Date.now().toString(), title, amount: Number(amount), cat },...expenses])
    setTitle(''); setAmount('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #7B5CFF, #4A7BF7)', padding: 16, fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <h2 style={{ color: '#fff', fontWeight: 800 }}>ExpenseTrack</h2>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 24, padding: 24, textAlign: 'center', color: '#fff', marginTop: 16 }}>
          <p style={{ margin: 0 }}>September 2024</p>
          <h1 style={{ margin: '8px 0', fontSize: 42 }}>${total.toFixed(2)}</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>Total Expenses</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 14, marginTop: 16, display: 'flex', gap: 8 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Kya kharida?" style={{ flex: 1, padding: 12, borderRadius: 12, border: 0 }} />
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="$" style={{ width: 80, padding: 12, borderRadius: 12, border: 0 }} />
          <button onClick={add} style={{ padding: '12px 16px', borderRadius: 12, border: 0, background: '#fff', color: '#6C4DFF', fontWeight: 700 }}>Add</button>
        </div>
        <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
          {expenses.map(e => (
            <div key={e.id} style={{ background: 'rgba(255,255,255,0.15)', padding: 14, borderRadius: 16, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
              <span>{e.title} - {e.cat}</span><span>${e.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
