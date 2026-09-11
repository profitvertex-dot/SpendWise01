import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string, title: string, amount: number, dateISO: string, cat: Cat }

const catColor: Record<Cat, string> = { Food: '#FF6B6B', Gym: '#4ECDC4', Travel: '#45B7D1', Shopping: '#FFA600', Other: '#A78BFA' }
const catEmoji: Record<Cat, string> = { Food: '🍔', Gym: '💪', Travel: '✈️', Shopping: '🛍️', Other: '💸' }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('sw-final') || '[]'))
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState(''); const [cat, setCat] = useState<Cat>('Food')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [viewMonth, setViewMonth] = useState(() => new Date().toISOString().slice(0,7))

  useEffect(() => { localStorage.setItem('sw-final', JSON.stringify(expenses)) }, [expenses])
  const filtered = useMemo(() => expenses.filter(e=>e.dateISO.startsWith(viewMonth)), [expenses, viewMonth])
  const totalMonth = filtered.reduce((s,e)=>s+e.amount,0)

  const add = () => { if(!title||!amount) return; setExpenses([{id: Date.now().toString(), title, amount: Number(amount), cat, dateISO: date},...expenses]); setTitle(''); setAmount('') }
  const del = (id:string) => setExpenses(expenses.filter(e=>e.id!==id))
  const [y,m] = viewMonth.split('-').map(Number); const daysInMonth = new Date(y,m,0).getDate(); const firstDay = new Date(y,m-1,1).getDay()
  const daysArr = Array(firstDay).fill(null).concat([...Array(daysInMonth)].map((_,i)=>i+1))
  const getDayTotal = (day:number) => { const d=`${viewMonth}-${String(day).padStart(2,'0')}`; return expenses.filter(e=>e.dateISO===d).reduce((s,e)=>s+e.amount,0) }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(180deg, #f8f9ff 0%, #fff0f6 100%)', fontFamily: 'system-ui'}}>
      <div style={{maxWidth: 440, margin: '0 auto', padding: 16, paddingBottom: 100}}>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
          <div><h1 style={{margin: 0, fontSize: 26, fontWeight: 900}}>SpendWise</h1><p style={{margin: 0, opacity: 0.5, fontSize: 12}}>Track smart, spend smarter ✨</p></div>
          <div style={{width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 24}}>S</div>
        </div>

        <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 28, padding: 24, color: '#fff', marginTop: 20, boxShadow: '0 20px 40px -10px rgba(118,75,162,0.5)', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(255,255,255,0.15)', borderRadius: '50%'}}></div>
          <p style={{margin: 0, opacity: 0.8, fontSize: 12, letterSpacing: 1}}>TOTAL THIS MONTH</p>
          <h1 style={{margin: '8px 0', fontSize: 42, fontWeight: 900, letterSpacing: -1}}>₹{totalMonth.toLocaleString('en-IN')}</h1>
          <div style={{display: 'flex', gap: 8, marginTop: 14}}>
            {(['Food','Gym','Travel','Shopping'] as Cat[]).map(c=>(
              <div key={c} style={{background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600}}>{catEmoji[c]} ₹{filtered.filter(e=>e.cat===c).reduce((s,e)=>s+e.amount,0)}</div>
            ))}
          </div>
        </div>

        <div style={{background: '#fff', borderRadius: 22, padding: 16, marginTop: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <b style={{fontSize: 14}}>📅 Calendar</b>
            <input type="month" value={viewMonth} onChange={e=>setViewMonth(e.target.value)} style={{border: 0, background: '#f5f5ff', padding: '6px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12}}/>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, textAlign: 'center', fontSize: 10, color: '#aaa', marginBottom: 6}}><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6}}>
            {daysArr.map((d,i)=> d===null? <div key={i}></div> : (
              <div key={i} style={{aspectRatio: '1', borderRadius: 12, background: getDayTotal(d)>0? `linear-gradient(135deg, #667eea, #764ba2)` : '#f8f8ff', color: getDayTotal(d)>0? '#fff' : '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, boxShadow: getDayTotal(d)>0? '0 6px 12px rgba(102,126,234,0.3)' : 'none'}}>
                {d}{getDayTotal(d)>0 && <span style={{fontSize: 7}}>₹{getDayTotal(d)>99? Math.round(getDayTotal(d)/1000)+'k' : getDayTotal(d)}</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{background: '#fff', borderRadius: 22, padding: 16, marginTop: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
          <div style={{display: 'flex', gap: 8}}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kya kharida? ex: Biryani" style={{flex: 1, padding: 14, borderRadius: 14, border: 0, background: '#f6f6ff', outline: 'none', fontWeight: 600}}/>
            <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="₹" style={{width: 80, padding: 14, borderRadius: 14, border: 0, background: '#f6f6ff', outline: 'none', fontWeight: 700}}/>
          </div>
          <div style={{display: 'flex', gap: 8, marginTop: 10}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{flex: 1, padding: 12, borderRadius: 14, border: 0, background: '#f6f6ff'}}/>
            <select value={cat} onChange={e=>setCat(e.target.value as Cat)} style={{padding: 12, borderRadius: 14, border: 0, background: '#f6f6ff', fontWeight: 600}}>{Object.keys(catColor).map(k=><option key={k}>{k}</option>)}</select>
            <button onClick={add} style={{padding: '12px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 0, fontWeight: 800, boxShadow: '0 8px 16px rgba(102,126,234,0.3)'}}>Add +</button>
          </div>
        </div>

        <div style={{marginTop: 18, display: 'grid', gap: 10}}>
          {filtered.map(e=>(
            <div key={e.id} style={{background: '#fff', padding: 14, borderRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)'}}>
              <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                <div style={{width: 44, height: 44, borderRadius: 12, background: catColor[e.cat]+'20', display: 'grid', placeItems: 'center', fontSize: 20}}>{catEmoji[e.cat]}</div>
                <div><div style={{fontWeight: 700}}>{e.title}</div><div style={{fontSize: 11, color: '#999'}}>{e.dateISO} • {e.cat}</div></div>
              </div>
              <div style={{display: 'flex', gap: 10, alignItems: 'center'}}><b style={{fontSize: 15}}>₹{e.amount}</b><button onClick={()=>del(e.id)} style={{border: 0, background: '#fff0f0', color: '#ff4d4d', width: 30, height: 30, borderRadius: 10}}>✕</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
