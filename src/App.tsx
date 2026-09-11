import { useState, useEffect } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string, title: string, amount: number, date: string, cat: Cat }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('sw-pro') || '[]'))
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState(''); const [cat, setCat] = useState<Cat>('Food')

  useEffect(() => { localStorage.setItem('sw-pro', JSON.stringify(expenses)) }, [expenses])

  const total = expenses.reduce((s,e) => s+e.amount, 0)
  const add = () => {
    if(!title ||!amount) return
    setExpenses([{id: Date.now().toString(), title, amount: Number(amount), cat, date: new Date().toLocaleDateString()},...expenses])
    setTitle(''); setAmount('')
  }
  const del = (id: string) => setExpenses(expenses.filter(e=>e.id!==id))

  const byCat = (c: Cat) => expenses.filter(e=>e.cat===c).reduce((s,e)=>s+e.amount,0)

  return (
    <div style={{maxWidth: 420, margin: '0 auto', fontFamily: 'system-ui', padding: 20, paddingBottom: 80}}>
      <h1 style={{fontWeight: 900, letterSpacing: -1}}>SpendWise 💸</h1>

      <div style={{background: '#111', color: '#fff', padding: 22, borderRadius: 20, marginTop: 16}}>
        <p style={{opacity: 0.6, margin: 0}}>Total Spent</p>
        <h2 style={{fontSize: 38, margin: '6px 0 0'}}>₹{total.toLocaleString('en-IN')}</h2>
        <div style={{display:'flex', gap: 8, marginTop: 14, flexWrap: 'wrap'}}>
          {(['Food','Gym','Travel','Shopping'] as Cat[]).map(c=>(
            <span key={c} style={{background: '#222', padding: '4px 10px', borderRadius: 20, fontSize: 12}}>{c}: ₹{byCat(c)}</span>
          ))}
        </div>
      </div>

      {/* Simple Bar Graph */}
      <div style={{display: 'flex', alignItems: 'end', gap: 8, height: 80, marginTop: 18, padding: '0 4px'}}>
        {expenses.slice(0,7).reverse().map(e=>(
          <div key={e.id} style={{flex: 1, background: '#111', height: `${Math.min(100, (e.amount / (Math.max(...expenses.map(x=>x.amount),1)))*100)}%`, borderRadius: 8, minHeight: 8}}></div>
        ))}
      </div>

      <div style={{display: 'flex', gap: 8, marginTop: 18}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex: 1, padding: 14, borderRadius: 12, border: '1.5px solid #eee', outline: 'none'}}/>
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="₹" style={{width: 75, padding: 14, borderRadius: 12, border: '1.5px solid #eee'}}/>
      </div>
      <div style={{display: 'flex', gap: 8, marginTop: 10}}>
        <select value={cat} onChange={e=>setCat(e.target.value as Cat)} style={{flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #eee'}}>
          <option>Food</option><option>Gym</option><option>Travel</option><option>Shopping</option><option>Other</option>
        </select>
        <button onClick={add} style={{flex: 1, padding: 12, borderRadius: 12, background: '#111', color: '#fff', border: 0, fontWeight: 700}}> + Add Expense</button>
      </div>

      <div style={{marginTop: 22, display: 'grid', gap: 10}}>
        {expenses.map(e => (
          <div key={e.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1px solid #f0f0f0', borderRadius: 14, background: '#fff'}}>
            <div>
              <div style={{fontWeight: 600}}>{e.title} <span style={{fontSize: 10, background: '#f3f3f3', padding: '2px 8px', borderRadius: 10, marginLeft: 6}}>{e.cat}</span></div>
              <div style={{fontSize: 12, color: '#999', marginTop: 2}}>{e.date}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <b>₹{e.amount}</b>
              <button onClick={()=>del(e.id)} style={{border: 0, background: '#ffe8e8', color: '#ff2e2e', width: 28, height: 28, borderRadius: 8}}>✕</button>
            </div>
          </div>
        ))}
        {expenses.length===0 && <p style={{textAlign: 'center', color: '#aaa', marginTop: 40}}>Koi expense nahi, add kar ke dekh 😎</p>}
      </div>
    </div>
  )
          }
