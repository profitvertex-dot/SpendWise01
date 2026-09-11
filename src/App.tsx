import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string; title: string; amount: number; dateISO: string; cat: Cat }

const catMeta: Record<Cat, {emoji: string, color: string}> = {
  Food: {emoji: '🍔', color: '#FF8A29'},
  Gym: {emoji: '💪', color: '#A855F7'},
  Travel: {emoji: '✈️', color: '#06E1F0'},
  Shopping: {emoji: '🛍️', color: '#FF6CB0'},
  Other: {emoji: '💸', color: '#FF5A5A'},
}

export default function App(){
  const [expenses, setExpenses] = useState<Expense[]>(()=>{
    try{
      const saved = localStorage.getItem('spendwise-final')
      if(saved) return JSON.parse(saved)
      return [
        {id:"1",title:"Linch Dinner",amount:5000,cat:"Food" as Cat,dateISO:"2026-09-11"},
        {id:"2",title:"Clothes",amount:1500,cat:"Shopping" as Cat,dateISO:"2026-09-11"},
        {id:"3",title:"Goa Trip",amount:8000,cat:"Travel" as Cat,dateISO:"2026-09-11"}
      ]
    }catch{ return [] }
  })
  const [budget, setBudget] = useState(()=> Number(localStorage.getItem('sw-budget')||'5000'))
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Shopping')
  const [q, setQ] = useState('')

  useEffect(()=>{ localStorage.setItem('spendwise-final', JSON.stringify(expenses)) },[expenses])
  useEffect(()=>{ localStorage.setItem('sw-budget', String(budget)) },[budget])

  const total = expenses.reduce((a,b)=> a+b.amount,0)
  const isOver = total > budget
  const overAmt = total - budget

  const byCat = useMemo(()=>{
    const m = new Map<Cat, number>()
    for(const e of expenses) m.set(e.cat, (m.get(e.cat)||0)+e.amount)
    return Array.from(m.entries()).sort((a,b)=> b[1]-a[1])
  },[expenses])

  const pieGradient = useMemo(()=>{
    if(total===0) return '#eee 0% 100%'
    let acc=0; return byCat.map(([c,sum])=>{
      const p = (sum/total)*100; const s=acc; acc+=p
      return `${catMeta[c].color} ${s}% ${acc}%`
    }).join(', ')
  },[byCat,total])

  const filtered = expenses.filter(e=> e.title.toLowerCase().includes(q.toLowerCase()))

  const add = ()=>{
    if(!title.trim()||!amount) return
    setExpenses([{id:Date.now().toString(), title:title.trim(), amount:Number(amount), cat, dateISO: new Date().toISOString().slice(0,10)},...expenses])
    setTitle(''); setAmount('')
  }

  const exportPDF = ()=>{
    const txt = expenses.map(e=> `${e.dateISO} | ${e.cat} | ${e.title} | ₹${e.amount}`).join('\n')
    const blob = new Blob([`SpendWise Report\nTotal: ₹${total}\nBudget: ₹${budget}\n\n${txt}`], {type:'text/plain'})
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`SpendWise-${Date.now()}.txt`; a.click()
  }

  return(
    <div style={{minHeight:'100vh', background:'#FFF1F3', fontFamily:'Inter, system-ui', paddingBottom:30}}>
      <div style={{maxWidth:400, margin:'0 auto', padding:16, boxSizing:'border-box'}}>

        {/* HEADER */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0'}}>
          <div><h1 style={{margin:0, fontSize:32, fontWeight:900, letterSpacing:-1}}>SpendWise</h1><p style={{margin:'2px 0 0 0', color:'#9A9A9A', fontSize:13}}>Track smart, spend smarter ✨</p></div>
          <div style={{width:46, height:46, borderRadius:14, background:'linear-gradient(135deg,#7A5CFA,#4D7CFF)', display:'grid', placeItems:'center', color:'#fff', fontWeight:800, fontSize:18}}>S</div>
        </div>

        {/* TOTAL CARD - RED WHEN OVER */}
        <div style={{background: isOver? 'linear-gradient(135deg,#FF5A5A,#FF1A1A)' : 'linear-gradient(135deg,#7A5CFA 0%, #6E6CFF 50%, #9B5CFF 100%)', borderRadius:24, padding:20, marginTop:14, color:'#fff', transition:'0.3s'}}>
          <p style={{margin:0, fontSize:11, letterSpacing:2, opacity:0.9}}>TOTAL THIS MONTH</p>
          <h1 style={{margin:'8px 0 14px 0', fontSize:42, fontWeight:900}}>₹{total.toLocaleString('en-IN')}</h1>
          <div style={{height:12, background:'rgba(255,255,255,0.4)', borderRadius:20, overflow:'hidden'}}>
            <div style={{height:'100%', width:'100%', background:'#fff', borderRadius:20}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12, fontWeight:700}}>
            <span>{isOver? `₹${overAmt} over ⚠️` : `₹${budget-total} bacha`}</span><span>100%</span>
          </div>
        </div>

        {/* SEARCH - FIXED PDF BAHAR */}
        <div style={{background:'#fff', borderRadius:16, padding:10, marginTop:14, display:'flex', gap:8, alignItems:'center', width:'100%', boxSizing:'border-box', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search..." style={{flex:'1 1 0', minWidth:0, padding:'10px 14px', borderRadius:10, border:0, background:'#F5F5FF', outline:'none'}}/>
          <div style={{padding:'10px 12px', borderRadius:10, background:'#F5F5FF', fontSize:14, flexShrink:0, display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap'}}>All <span style={{fontSize:10}}>▼</span></div>
          <button onClick={exportPDF} style={{padding:'10px 14px', borderRadius:12, border:0, background:'#6B6CFF', color:'#fff', fontWeight:700, flexShrink:0, cursor:'pointer'}}>PDF</button>
        </div>

        {/* PIE CHART */}
        <div style={{background:'#fff', borderRadius:20, padding:16, marginTop:14, display:'flex', gap:14, alignItems:'center', width:'100%', boxSizing:'border-box', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
          <div style={{width:112, height:112, borderRadius:'50%', background:`conic-gradient(${pieGradient})`, flexShrink:0}}/>
          <div style={{flex:1, minWidth:0, display:'grid', gap:10}}>
            {byCat.map(([c,sum])=>{
              const p=Math.round((sum/total)*100)
              return <div key={c} style={{display:'flex', justifyContent:'space-between', fontSize:14, gap:8}}><span style={{display:'flex', alignItems:'center', gap:8, minWidth:0, overflow:'hidden'}}><span style={{width:8, height:8, borderRadius:10, background:catMeta[c].color, flexShrink:0}}></span><span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c} ₹{sum}</span></span><b style={{flexShrink:0}}>{p}%</b></div>
            })}
          </div>
        </div>

        {/* ADD INPUTS - FIXED NICHE WALE */}
        <div style={{background:'#fff', borderRadius:20, padding:12, marginTop:14, display:'grid', gap:10, width:'100%', boxSizing:'border-box', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex', gap:8, width:'100%', boxSizing:'border-box'}}>
            <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1, minWidth:0, padding:14, borderRadius:12, border:0, background:'#F5F5FF', outline:'none'}}/>
            <input value={amount} onChange={e=> setAmount(e.target.value)} type="number" placeholder="₹" style={{width:70, flexShrink:0, padding:14, borderRadius:12, border:0, background:'#F5F5FF', textAlign:'center'}}/>
          </div>
          <div style={{display:'flex', gap:8, width:'100%', boxSizing:'border-box'}}>
            <div style={{flex:1, minWidth:0, padding:14, borderRadius:12, background:'#F5F5FF', fontSize:14, display:'flex', justifyContent:'space-between', whiteSpace:'nowrap'}}>09/11/2026 <span>▼</span></div>
            <select value={cat} onChange={e=> setCat(e.target.value as Cat)} style={{flex:1, minWidth:0, padding:14, borderRadius:12, border:0, background:'#F5F5FF'}}><option>Shopping</option><option>Food</option><option>Travel</option><option>Gym</option><option>Other</option></select>
            <button onClick={add} style={{padding:'0 18px', borderRadius:12, border:0, background:'linear-gradient(135deg,#7A5CFA,#4D7CFF)', color:'#fff', fontWeight:800, flexShrink:0, whiteSpace:'nowrap', cursor:'pointer'}}>Add +</button>
          </div>
        </div>

        {/* LIST */}
        <div style={{marginTop:14, display:'grid', gap:10}}>
          {filtered.map(e=> (
            <div key={e.id} style={{background:'#fff', padding:'14px 16px', borderRadius:14, display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', boxSizing:'border-box', boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
              <span style={{display:'flex', gap:8, alignItems:'center', fontWeight:500, minWidth:0, overflow:'hidden'}}><span style={{flexShrink:0}}>{catMeta[e.cat].emoji}</span><span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{e.title}</span></span>
              <span style={{display:'flex', gap:10, alignItems:'center', flexShrink:0}}><b>₹{e.amount}</b><span onClick={()=> setExpenses(expenses.filter(x=> x.id!==e.id))} style={{color:'#FF8A8A', cursor:'pointer', padding:'0 4px'}}>✕</span></span>
            </div>
          ))}
        </div>

        {/* BUDGET SLIDER */}
        <div style={{background:'#fff', borderRadius:16, padding:12, marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', boxSizing:'border-box'}}>
          <span style={{fontSize:13, fontWeight:700, whiteSpace:'nowrap'}}>Budget: ₹{budget}</span>
          <input type="range" min="1000" max="20000" step="1000" value={budget} onChange={e=> setBudget(Number(e.target.value))} style={{flex:1, marginLeft:12, accentColor: isOver? '#FF3B30' : '#7A5CFA'}}/>
        </div>

      </div>
    </div>
  )
            }
