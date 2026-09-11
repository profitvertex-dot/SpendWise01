import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string; title: string; amount: number; dateISO: string; cat: Cat }

const catMeta: Record<Cat, {emoji: string, color: string, bg: string}> = {
  Food: {emoji: '🍔', color: '#FF9E42', bg: '#FFF0E0'},
  Gym: {emoji: '💪', color: '#A855F7', bg: '#F5E8FF'},
  Travel: {emoji: '✈️', color: '#22D3EE', bg: '#E0FBFF'},
  Shopping: {emoji: '🛍️', color: '#F472B6', bg: '#FFE4F0'},
  Other: {emoji: '💸', color: '#FB7185', bg: '#FFE0E5'},
}

export default function App(){
  const [expenses, setExpenses] = useState<Expense[]>(()=>{
    try{ const s=localStorage.getItem('spendwise-final'); return s? JSON.parse(s): [] }catch{ return [] }
  })
  const [budget, setBudget] = useState(()=>{
    try{ const b=localStorage.getItem('spendwise-budget'); return b? Number(b) : 20000 }catch{ return 20000 }
  })
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Food')
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10))
  const [viewMonth, setViewMonth] = useState(()=> new Date().toISOString().slice(0,7))

  useEffect(()=>{ localStorage.setItem('spendwise-final', JSON.stringify(expenses)) },[expenses])
  useEffect(()=>{ localStorage.setItem('spendwise-budget', String(budget)) },[budget])

  const filtered = useMemo(()=> expenses.filter(e=> e.dateISO.startsWith(viewMonth)), [expenses, viewMonth])
  const total = filtered.reduce((a,b)=> a+b.amount, 0)
  const pct = Math.min(100, Math.round((total/budget)*100))
  const remaining = budget - total

  const byCat = useMemo(()=>{
    const m = new Map<Cat, number>()
    for(const e of filtered){ m.set(e.cat, (m.get(e.cat)||0)+e.amount) }
    return Array.from(m.entries()).sort((a,b)=> b[1]-a[1])
  },[filtered])

  const add = ()=>{
    if(!title.trim()||!amount) return
    const ne: Expense = {id: Date.now().toString(), title: title.trim(), amount: Number(amount), cat, dateISO: date}
    setExpenses([ne,...expenses]); setTitle(''); setAmount('')
  }
  const del = (id:string)=> setExpenses(expenses.filter(e=> e.id!==id))

  return(
    <div style={{minHeight:'100vh', background:'#FFF5F7', fontFamily:'system-ui', paddingBottom:90}}>
      <div style={{maxWidth:440, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div><h1 style={{margin:0, fontSize:32, fontWeight:900, letterSpacing:-1}}>SpendWise</h1><p style={{margin:0, color:'#8B8B8B', fontSize:14}}>Track smart, spend smarter ✨</p></div>
          <div style={{width:48, height:48, borderRadius:16, background:'linear-gradient(135deg,#7B5CFF,#4A7BF7)', display:'grid', placeItems:'center', color:'#fff', fontWeight:900, fontSize:22}}>S</div>
        </div>

        {/* TOTAL CARD */}
        <div style={{background:'linear-gradient(135deg,#7B5CFF 0%, #6B6CFF 50%, #9B59FF 100%)', borderRadius:28, padding:22, marginTop:16, color:'#fff', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', right:-30, top:-30, width:120, height:120, background:'rgba(255,255,255,0.15)', borderRadius:'50%'}}/>
          <p style={{margin:0, fontSize:12, letterSpacing:2, opacity:0.85}}>TOTAL THIS MONTH</p>
          <h1 style={{margin:'6px 0', fontSize:46, fontWeight:900}}>₹{total.toLocaleString('en-IN')}</h1>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
            {byCat.slice(0,4).map(([c,sum])=> <span key={c} style={{background:'rgba(255,255,255,0.22)', padding:'6px 10px', borderRadius:20, fontSize:12}}>{catMeta[c].emoji} ₹{sum}</span>)}
          </div>
        </div>

        {/* BUDGET BAR - NEW */}
        <div style={{background:'#fff', borderRadius:22, padding:16, marginTop:14, boxShadow:'0 4px 20px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{margin:0, fontSize:15}}>💰 Monthly Budget</h3>
            <input type="number" value={budget} onChange={e=> setBudget(Number(e.target.value)||0)} style={{width:90, border:0, background:'#F6F6FF', padding:'6px 10px', borderRadius:10, fontWeight:700, textAlign:'right'}}/>
          </div>
          <div style={{height:12, background:'#F0F0F0', borderRadius:10, marginTop:12, overflow:'hidden'}}>
            <div style={{height:'100%', width:`${pct}%`, borderRadius:10, background: pct>=100? '#FF4D4F' : pct>=80? '#FF9E42' : 'linear-gradient(90deg,#7B5CFF,#4A7BF7)', transition:'all 0.4s'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12}}>
            <span style={{color: remaining<0? '#FF4D4F' : '#666', fontWeight:700}}>{remaining<0? `₹${Math.abs(remaining)} over! ⚠️` : `₹${remaining} bacha hai`}</span>
            <span style={{fontWeight:800}}>{pct}% used</span>
          </div>
        </div>

        {/* BREAKDOWN */}
        {total>0 && (
          <div style={{background:'#fff', borderRadius:22, padding:16, marginTop:14, boxShadow:'0 4px 20px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <h3 style={{margin:0, fontSize:16}}>Breakdown</h3><span style={{fontSize:12, color:'#888'}}>{new Date(viewMonth).toLocaleString('en-US',{month:'long', year:'numeric'})}</span>
            </div>
            <div style={{display:'grid', gap:10}}>
              {byCat.map(([c,sum])=>{
                const p = Math.round((sum/total)*100)
                return (
                  <div key={c} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:catMeta[c].bg, padding:'12px 14px', borderRadius:14}}>
                    <div style={{display:'flex', gap:10, alignItems:'center'}}><span style={{fontSize:18}}>{catMeta[c].emoji}</span><div><div style={{fontWeight:700, fontSize:13}}>{c}</div><div style={{fontSize:12, color:'#666'}}>₹{sum}</div></div></div>
                    <div style={{background:'#fff', color:catMeta[c].color, padding:'6px 12px', borderRadius:20, fontWeight:800, fontSize:12}}>{p}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* INPUT */}
        <div style={{background:'#fff', borderRadius:22, padding:14, marginTop:14, display:'grid', gap:10}}>
          <div style={{display:'flex', gap:8}}>
            <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1, padding:14, borderRadius:14, border:0, background:'#F6F6FF'}}/>
            <input value={amount} onChange={e=> setAmount(e.target.value)} type="number" placeholder="₹" style={{width:80, padding:14, borderRadius:14, border:0, background:'#F6F6FF'}}/>
          </div>
          <div style={{display:'flex', gap:8}}>
            <input type="date" value={date} onChange={e=> setDate(e.target.value)} style={{flex:1, padding:14, borderRadius:14, border:0, background:'#F6F6FF'}}/>
            <select value={cat} onChange={e=> setCat(e.target.value as Cat)} style={{flex:1, padding:14, borderRadius:14, border:0, background:'#F6F6FF'}}><option>Food</option><option>Gym</option><option>Travel</option><option>Shopping</option><option>Other</option></select>
            <button onClick={add} style={{padding:'0 22px', borderRadius:14, border:0, background:'linear-gradient(135deg,#7B5CFF,#4A7BF7)', color:'#fff', fontWeight:800}}>Add +</button>
          </div>
        </div>
      </div>
    </div>
  )
}
