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
    try{ return JSON.parse(localStorage.getItem('spendwise-final')||'[]') }catch{ return [] }
  })
  const [budget, setBudget] = useState(()=> Number(localStorage.getItem('spendwise-budget')||'20000'))
  const [dark, setDark] = useState(()=> localStorage.getItem('sw-dark')==='1')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Food')
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10))
  const [q, setQ] = useState('')
  const [filterCat, setFilterCat] = useState<Cat|'All'>('All')

  useEffect(()=>{ localStorage.setItem('spendwise-final', JSON.stringify(expenses)) },[expenses])
  useEffect(()=>{ localStorage.setItem('spendwise-budget', String(budget)) },[budget])
  useEffect(()=>{ localStorage.setItem('sw-dark', dark?'1':'0') },[dark])

  const filteredAll = useMemo(()=> expenses.filter(e=> e.dateISO.startsWith(new Date().toISOString().slice(0,7))), [expenses])
  const total = filteredAll.reduce((a,b)=> a+b.amount,0)
  const pct = Math.min(100, Math.round((total/budget)*100))

  const byCat = useMemo(()=>{
    const m = new Map<Cat, number>()
    for(const e of filteredAll) m.set(e.cat, (m.get(e.cat)||0)+e.amount)
    return Array.from(m.entries()).sort((a,b)=> b[1]-a[1])
  },[filteredAll])

  // pie gradient
  const pieGradient = useMemo(()=>{
    let acc=0; return byCat.map(([c,sum])=>{
      const p = (sum/total)*100
      const start=acc; acc+=p
      return `${catMeta[c].color} ${start}% ${acc}%`
    }).join(', ')
  },[byCat,total])

  const list = useMemo(()=> filteredAll.filter(e=>{
    const okQ = e.title.toLowerCase().includes(q.toLowerCase())
    const okC = filterCat==='All' || e.cat===filterCat
    return okQ && okC
  }),[filteredAll,q,filterCat])

  const add = ()=>{
    if(!title.trim()||!amount) return
    setExpenses([{id:Date.now().toString(), title:title.trim(), amount:Number(amount), cat, dateISO:date},...expenses])
    setTitle(''); setAmount('')
  }
  const exportPDF = ()=>{
    const txt = list.map(e=> `${e.dateISO} | ${e.cat} | ${e.title} | ₹${e.amount}`).join('\n')
    const blob = new Blob([`SpendWise Report\nTotal: ₹${total}\n\n${txt}`], {type:'text/plain'})
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`SpendWise-${Date.now()}.txt`; a.click()
  }

  const bg = dark?'#111113':'#FFF5F7'
  const cardBg = dark?'#1E1E22':'#fff'
  const text = dark?'#fff':'#111'
  const sub = dark?'#999':'#888'

  return(
    <div style={{minHeight:'100vh', background:bg, color:text, fontFamily:'system-ui', paddingBottom:90}}>
      <div style={{maxWidth:440, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div><h1 style={{margin:0, fontSize:32, fontWeight:900}}>SpendWise</h1><p style={{margin:0, color:sub, fontSize:13}}>Track smart, spend smarter ✨</p></div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={()=> setDark(!dark)} style={{width:40, height:40, borderRadius:12, border:0, background:cardBg, cursor:'pointer'}}>{dark?'☀️':'🌙'}</button>
            <div style={{width:48, height:48, borderRadius:16, background:'linear-gradient(135deg,#7B5CFF,#4A7BF7)', display:'grid', placeItems:'center', color:'#fff', fontWeight:900}}>S</div>
          </div>
        </div>

        <div style={{background:'linear-gradient(135deg,#7B5CFF 0%, #6B6CFF 50%, #9B59FF 100%)', borderRadius:28, padding:22, marginTop:16, color:'#fff'}}>
          <p style={{margin:0, fontSize:11, letterSpacing:2, opacity:0.8}}>TOTAL THIS MONTH</p>
          <h1 style={{margin:'6px 0', fontSize:44, fontWeight:900}}>₹{total.toLocaleString('en-IN')}</h1>
          <div style={{height:10, background:'rgba(255,255,255,0.3)', borderRadius:10, overflow:'hidden', marginTop:10}}>
            <div style={{height:'100%', width:`${pct}%`, background:'#fff', borderRadius:10}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11}}><span>₹{budget-total>=0? `${budget-total} bacha` : `${Math.abs(budget-total)} over`}</span><span>{pct}%</span></div>
        </div>

        <div style={{background:cardBg, borderRadius:20, padding:12, marginTop:12, display:'flex', gap:8}}>
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search..." style={{flex:1, padding:10, borderRadius:12, border:0, background: dark?'#2A2A2E':'#F6F6FF', color:text}}/>
          <select value={filterCat} onChange={e=> setFilterCat(e.target.value as any)} style={{padding:10, borderRadius:12, border:0, background: dark?'#2A2A2E':'#F6F6FF', color:text}}>
            <option value="All">All</option><option>Food</option><option>Gym</option><option>Travel</option><option>Shopping</option><option>Other</option>
          </select>
          <button onClick={exportPDF} style={{padding:'0 12px', borderRadius:12, border:0, background:'linear-gradient(135deg,#7B5CFF,#4A7BF7)', color:'#fff', fontWeight:700}}>PDF</button>
        </div>

        {total>0 && (
          <div style={{background:cardBg, borderRadius:22, padding:16, marginTop:12, display:'flex', gap:16, alignItems:'center'}}>
            <div style={{width:110, height:110, borderRadius:'50%', background:`conic-gradient(${pieGradient})`}}/>
            <div style={{flex:1, display:'grid', gap:8}}>
              {byCat.map(([c,sum])=>{
                const p=Math.round((sum/total)*100)
                return <div key={c} style={{display:'flex', justifyContent:'space-between', fontSize:13}}><span><span style={{display:'inline-block', width:8, height:8, borderRadius:10, background:catMeta[c].color, marginRight:6}}></span>{c} ₹{sum}</span><b>{p}%</b></div>
              })}
            </div>
          </div>
        )}

        <div style={{background:cardBg, borderRadius:22, padding:14, marginTop:12, display:'grid', gap:10}}>
          <div style={{display:'flex', gap:8}}>
            <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1, padding:14, borderRadius:14, border:0, background: dark?'#2A2A2E':'#F6F6FF', color:text}}/>
            <input value={amount} onChange={e=> setAmount(e.target.value)} type="number" placeholder="₹" style={{width:80, padding:14, borderRadius:14, border:0, background: dark?'#2A2A2E':'#F6F6FF', color:text}}/>
          </div>
          <div style={{display:'flex', gap:8}}>
            <input type="date" value={date} onChange={e=> setDate(e.target.value)} style={{flex:1, padding:14, borderRadius:14, border:0, background: dark?'#2A2A2E':'#F6F6FF', color:text}}/>
            <select value={cat} onChange={e=> setCat(e.target.value as Cat)} style={{flex:1, padding:14, borderRadius:14, border:0, background: dark?'#2A2A2E':'#F6F6FF', color:text}}><option>Food</option><option>Gym</option><option>Travel</option><option>Shopping</option><option>Other</option></select>
            <button onClick={add} style={{padding:'0 22px', borderRadius:14, border:0, background:'linear-gradient(135deg,#7B5CFF,#4A7BF7)', color:'#fff', fontWeight:800}}>Add +</button>
          </div>
        </div>

        <div style={{marginTop:12, display:'grid', gap:8}}>
          {list.map(e=> (
            <div key={e.id} style={{background:cardBg, padding:'12px 14px', borderRadius:14, display:'flex', justifyContent:'space-between'}}>
              <span>{catMeta[e.cat].emoji} {e.title}</span><span><b>₹{e.amount}</b> <span onClick={()=> setExpenses(expenses.filter(x=> x.id!==e.id))} style={{color:'#ff6b6b', cursor:'pointer', marginLeft:8}}>✕</span></span>
            </div>
          ))}
        </div>

        <div style={{background:cardBg, borderRadius:16, padding:12, marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:13}}>Budget: ₹{budget}</span>
          <input type="range" min="5000" max="50000" step="1000" value={budget} onChange={e=> setBudget(Number(e.target.value))}/>
        </div>
      </div>
    </div>
  )
              }
