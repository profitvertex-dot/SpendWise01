import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string, title: string, amount: number, dateISO: string, cat: Cat }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('sw-cal') || '[]'))
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState(''); const [cat, setCat] = useState<Cat>('Food')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [viewMonth, setViewMonth] = useState(() => new Date().toISOString().slice(0,7)) // YYYY-MM

  useEffect(() => { localStorage.setItem('sw-cal', JSON.stringify(expenses)) }, [expenses])

  const filtered = useMemo(() => expenses.filter(e=>e.dateISO.startsWith(viewMonth)), [expenses, viewMonth])
  const totalMonth = filtered.reduce((s,e)=>s+e.amount,0)
  const totalAll = expenses.reduce((s,e)=>s+e.amount,0)

  const add = () => {
    if(!title ||!amount) return
    setExpenses([{id: Date.now().toString(), title, amount: Number(amount), cat, dateISO: date},...expenses])
    setTitle(''); setAmount('')
  }
  const del = (id:string) => setExpenses(expenses.filter(e=>e.id!==id))

  // Calendar Logic
  const [y,m] = viewMonth.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstDay = new Date(y, m-1, 1).getDay()
  const daysArr = Array(firstDay).fill(null).concat([...Array(daysInMonth)].map((_,i)=>i+1))

  const getDayTotal = (day: number) => {
    const d = `${viewMonth}-${String(day).padStart(2,'0')}`
    return expenses.filter(e=>e.dateISO===d).reduce((s,e)=>s+e.amount,0)
  }

  return (
    <div style={{maxWidth: 440, margin: '0 auto', fontFamily: 'system-ui', padding: 16, paddingBottom: 90}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{fontWeight: 900, letterSpacing: -1, margin: 0}}>SpendWise 💸</h1>
        <input type="month" value={viewMonth} onChange={e=>setViewMonth(e.target.value)} style={{padding: 8, borderRadius: 10, border: '1.5px solid #eee', fontWeight: 700}}/>
      </div>

      <div style={{background: '#111', color: '#fff', padding: 20, borderRadius: 20, marginTop: 16}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div><p style={{opacity: 0.6, margin: 0, fontSize: 12}}>THIS MONTH ({viewMonth})</p><h2 style={{fontSize: 32, margin: '4px 0 0'}}>₹{totalMonth.toLocaleString('en-IN')}</h2></div>
          <div style={{textAlign: 'right'}}><p style={{opacity: 0.6, margin: 0, fontSize: 12}}>ALL TIME</p><h3 style={{margin: '4px 0 0'}}>₹{totalAll.toLocaleString('en-IN')}</h3></div>
        </div>
      </div>

      {/* CALENDAR */}
      <div style={{background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 18, padding: 14, marginTop: 14}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, textAlign: 'center', fontSize: 11, color: '#999', marginBottom: 8}}>
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6}}>
          {daysArr.map((d,i)=> d===null? <div key={i}></div> : (
            <div key={i} style={{aspectRatio: '1', borderRadius: 10, background: getDayTotal(d)>0? '#111' : '#f7f7f7', color: getDayTotal(d)>0? '#fff' : '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600}}>
              <span>{d}</span>
              {getDayTotal(d)>0 && <span style={{fontSize: 8, marginTop: 2}}>₹{getDayTotal(d)}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ADD */}
      <div style={{display: 'flex', gap: 8, marginTop: 14}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex: 1, padding: 14, borderRadius: 12, border: '1.5px solid #eee'}}/>
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="₹" style={{width: 70, padding: 14, borderRadius: 12, border: '1.5px solid #eee'}}/>
      </div>
      <div style={{display: 'flex', gap: 8, marginTop: 8}}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #eee'}}/>
        <select value={cat} onChange={e=>setCat(e.target.value as Cat)} style={{padding: 12, borderRadius: 12, border: '1.5px solid #eee'}}><option>Food</option><option>Gym</option><option>Travel</option><option>Shopping</option><option>Other</option></select>
        <button onClick={add} style={{padding: '12px 18px', borderRadius: 12, background: '#111', color: '#fff', border: 0, fontWeight: 700}}>Add</button>
      </div>

      {/* LIST - Month Filtered */}
      <h3 style={{margin: '20px 0 10px', fontSize: 14, opacity: 0.6}}>{viewMonth} ke {filtered.length} Records</h3>
      <div style={{display: 'grid', gap: 8}}>
        {filtered.map(e => (
          <div key={e.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid #f0f0f0', borderRadius: 12}}>
            <div><div style={{fontWeight: 600}}>{e.title} <small style={{background: '#f3f3f3', padding: '2px 6px', borderRadius: 8, fontSize: 10}}>{e.cat}</small></div><div style={{fontSize: 11, color: '#999'}}>{e.dateISO}</div></div>
            <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><b>₹{e.amount}</b><button onClick={()=>del(e.id)} style={{border: 0, background: '#ffe8e8', color: '#ff2e2e', width: 26, height: 26, borderRadius: 7}}>✕</button></div>
          </div>
        ))}
        {filtered.length===0 && <p style={{textAlign: 'center', color: '#aaa', marginTop: 20}}>Is month me kuch nahi hai. Date change karke add kar!</p>}
      </div>
    </div>
  )
                                                                                                                                                   }
