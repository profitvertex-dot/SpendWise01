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
      const s = localStorage.getItem('spendwise-v3')
      return s? JSON.parse(s) : [
        {id:"1",title:"Linch Dinner",amount:5000,cat:"Food",dateISO:"2026-09-11"},
        {id:"2",title:"Clothes",amount:1500,cat:"Shopping",dateISO:"2026-09-11"},
        {id:"3",title:"Goa Trip",amount:8000,cat:"Travel",dateISO:"2026-09-11"}
      ]
    }catch{ return [] }
  })
  const [budget, setBudget] = useState(()=> Number(localStorage.getItem('sw-budget')||'11000'))
  const [dark, setDark] = useState(()=> localStorage.getItem('sw-dark')==='1')
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Shopping'); const [q, setQ] = useState('')
  const [listening, setListening] = useState(false)

  useEffect(()=>{ localStorage.setItem('spendwise-v3', JSON.stringify(expenses)) },[expenses])
  useEffect(()=>{ localStorage.setItem('sw-budget', String(budget)) },[budget])
  useEffect(()=>{ localStorage.setItem('sw-dark', dark?'1':'0') },[dark])

  const total = expenses.reduce((a,b)=> a+b.amount,0)
  const isOver = total > budget

  const byCat = useMemo(()=>{
    const m = new Map<Cat, number>(); expenses.forEach(e=> m.set(e.cat,(m.get(e.cat)||0)+e.amount))
    return Array.from(m.entries()).sort((a,b)=> b[1]-a[1])
  },[expenses])

  const pieGradient = useMemo(()=>{
    if(total===0) return '#eee 0% 100%'; let acc=0
    return byCat.map(([c,sum])=>{ const p=(sum/total)*100; const s=acc; acc+=p; return `${catMeta[c].color} ${s}% ${acc}%` }).join(', ')
  },[byCat,total])

  const filtered = expenses.filter(e=> e.title.toLowerCase().includes(q.toLowerCase()))

  const add = ()=>{
    if(!title.trim()||!amount) return
    setExpenses([{id:Date.now().toString(), title:title.trim(), amount:Number(amount), cat, dateISO: new Date().toISOString().slice(0,10)},...expenses])
    setTitle(''); setAmount('')
  }

  const startVoice = () => {
    const Speech: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if(!Speech){ alert("Chrome me khol bhai, is browser me voice nahi hai"); return }
    const rec = new Speech()
    rec.lang = 'en-IN'
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript.toLowerCase()
      const num = text.match(/\d+/)?.[0]
      const name = text.replace(/\d+/g,'').replace(/rupees|rupaye|rs|rupay/g,'').trim()
      if(name) setTitle(name.charAt(0).toUpperCase()+name.slice(1))
      if(num) setAmount(num)
    }
    rec.start()
  }

  const exportPDF = ()=>{
    const w = window.open('','','width=600,height=800'); if(!w) return
    w.document.write(`<html><body style="font-family:sans-serif;padding:20px"><h1>SpendWise Report</h1><h2>Total: ₹${total} | Budget: ₹${budget}</h2>${expenses.map(e=> `<div style="border:1px solid #ddd;padding:10px;border-radius:8px;margin:5px 0">${e.title} - ₹${e.amount} - ${e.cat}</div>`).join('')}</body></html>`)
    w.document.close(); w.print()
  }

  const bg = dark? '#111113' : '#FFF1F3'; const cardBg = dark? '#1E1E22' : '#fff'; const text = dark? '#fff' : '#111'; const subBg = dark? '#2A2A2E' : '#F5F5FF'; const subText = dark? '#aaa' : '#888'

  return(
    <div style={{minHeight:'100vh', background:bg, color:text, fontFamily:'Inter, system-ui', paddingBottom:30}}>
      <div style={{maxWidth:400, margin:'0 auto', padding:16, boxSizing:'border-box'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div><h1 style={{margin:0, fontSize:32, fontWeight:900}}>SpendWise</h1><p style={{margin:0, color:subText, fontSize:13}}>Track smart, spend smarter ✨</p></div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={()=> setDark(!dark)} style={{width:42, height:42, borderRadius:12, border:0, background:cardBg, cursor:'pointer'}}>{dark?'☀️':'🌙'}</button>
            <div style={{width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#7A5CFA,#4D7CFF)', display:'grid', placeItems:'center', color:'#fff', fontWeight:800}}>S</div>
          </div>
        </div>

        <div style={{background: isOver? 'linear-gradient(135deg,#FF5A5A,#FF1A1A)' : 'linear-gradient(135deg,#7A5CFA,#6E6CFF)', borderRadius:24, padding:20, marginTop:14, color:'#fff'}}>
          <p style={{margin:0, fontSize:11, letterSpacing:2}}>TOTAL THIS MONTH</p>
          <h1 style={{margin:'8px 0', fontSize:40, fontWeight:900}}>₹{total.toLocaleString('en-IN')}</h1>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700}}><span>{isOver?`₹${total-budget} over ⚠️`:`₹${budget-total} bacha`}</span><span>{Math.round((total/budget)*100)}%</span></div>
        </div>

        <div style={{background:cardBg, borderRadius:16, padding:10, marginTop:14, display:'flex', gap:8}}>
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search..." style={{flex:1, padding:'10px 14px', borderRadius:10, border:0, background:subBg, color:text, outline:'none'}}/>
          <button onClick={exportPDF} style={{padding:'10px 16px', borderRadius:12, border:0, background:'#6B6CFF', color:'#fff', fontWeight:700}}>PDF</button>
        </div>

        <div style={{background:cardBg, borderRadius:20, padding:16, marginTop:14, display:'flex', gap:14, alignItems:'center'}}>
          <div style={{width:110, height:110, borderRadius:'50%', background:`conic-gradient(${pieGradient})`, flexShrink:0}}/>
          <div style={{flex:1, display:'grid', gap:8}}>{byCat.map(([c,sum])=> <div key={c} style={{display:'flex', justifyContent:'space-between', fontSize:14}}><span>● {c} ₹{sum}</span><b>{Math.round((sum/total)*100)}%</b></div>)}</div>
        </div>

        <div style={{background:cardBg, borderRadius:20, padding:12, marginTop:14, display:'grid', gap:10}}>
          {/* VOICE BUTTON */}
          <button onClick={startVoice} style={{width:'100%', padding:14, borderRadius:12, border: listening? '2px solid #FF3B30' : '2px dashed #7A5CFA', background: listening? '#FFE1E1' : '#F0EFFF', color:'#7A5CFA', fontWeight:800, cursor:'pointer', boxSizing:'border-box'}}>
            {listening? '🎧 Sun raha hu... bolo "Momos 100"' : '🎤 Bol ke Add kar'}
          </button>

          <div style={{display:'flex', gap:8}}>
            <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1, minWidth:0, padding:14, borderRadius:12, border:0, background:subBg, color:text, outline:'none'}}/>
            <input value={amount} onChange={e=> setAmount(e.target.value)} type="number" placeholder="₹" style={{width:70, flexShrink:0, padding:14, borderRadius:12, border:0, background:subBg, color:text, textAlign:'center'}}/>
          </div>
          <div style={{display:'flex', gap:8}}>
            <select value={cat} onChange={e=> setCat(e.target.value as Cat)} style={{flex:1, padding:14, borderRadius:12, border:0, background:subBg, color:text}}><option>Shopping</option><option>Food</option><option>Travel</option><option>Gym</option><option>Other</option></select>
            <button onClick={add} style={{padding:'0 20px', borderRadius:12, border:0, background:'linear-gradient(135deg,#7A5CFA,#4D7CFF)', color:'#fff', fontWeight:800, cursor:'pointer'}}>Add +</button>
          </div>
        </div>

        <div style={{marginTop:14, display:'grid', gap:10}}>
          {filtered.map(e=> (
            <div key={e.id} style={{background:cardBg, padding:'14px 16px', borderRadius:14, display:'flex', justifyContent:'space-between'}}>
              <span>{catMeta[e.cat].emoji} {e.title}</span>
              <span style={{display:'flex', gap:10}}><b>₹{e.amount}</b><span onClick={()=> setExpenses(expenses.filter(x=> x.id!==e.id))} style={{color:'#FF8A8A', cursor:'pointer'}}>✕</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
