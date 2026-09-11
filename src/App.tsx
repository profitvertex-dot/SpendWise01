import { useState, useEffect } from 'react'

type Expense = { id: string, title: string, amount: number, date: string }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('sw') || '[]'))
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState('')

  useEffect(() => { localStorage.setItem('sw', JSON.stringify(expenses)) }, [expenses])

  const total = expenses.reduce((s,e) => s+e.amount, 0)

  const add = () => {
    if(!title ||!amount) return
    setExpenses([...expenses, {id: Date.now().toString(), title, amount: Number(amount), date: new Date().toLocaleDateString()}])
    setTitle(''); setAmount('')
  }

  return (
    <div style={{maxWidth: 400, margin: '40px auto', fontFamily: 'system-ui', padding: 20}}>
      <h1 style={{fontWeight: 800}}>SpendWise 💸</h1>
      <div style={{background: '#111', color: '#fff', padding: 20, borderRadius: 16, marginTop: 20}}>
        <p style={{opacity: 0.7}}>Total Spent</p>
        <h2 style={{fontSize: 32, margin: 0}}>₹{total}</h2>
      </div>

      <div style={{display: 'flex', gap: 10, marginTop: 20}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title ex: Chai" style={{flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ddd'}}/>
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="₹" style={{width: 80, padding: 12, borderRadius: 10, border: '1px solid #ddd'}}/>
        <button onClick={add} style={{padding: '12px 18px', borderRadius: 10, background: '#111', color: '#fff', border: 0}}>Add</button>
      </div>

      <div style={{marginTop: 20, display: 'grid', gap: 10}}>
        {expenses.map(e => (
          <div key={e.id} style={{display: 'flex', justifyContent: 'space-between', padding: 14, border: '1px solid #eee', borderRadius: 12}}>
            <span>{e.title} <small style={{color: '#888'}}> {e.date}</small></span>
            <b>₹{e.amount}</b>
          </div>
        ))}
      </div>
    </div>
  )
}
