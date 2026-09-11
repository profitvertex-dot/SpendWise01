import { useState, useEffect, useMemo, useRef } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string; title: string; amount: number; dateISO: string; cat: Cat }

const catMeta: Record<Cat, {emoji: string, color: string}> = {
  Food: {emoji: '🍔', color: '#FF8A29'},
  Gym: {emoji: '💪', color: '#A855F7'},
  Travel: {emoji: '✈️', color: '#06E1F0'},
  Shopping: {emoji: '🛍️', color: '#FF6CB0'},
  Other: {emoji: '💸', color: '#FF5A5A'},
}

function SwipeCard({ e, onDelete, dark }: any){
  const [x, setX] = useState(0)
  const startX = useRef(0)
  const handleStart = (clientX: number) => { startX.current = clientX }
  const handleMove = (clientX: number) => {
    const diff = clientX - startX.current
    if(diff < 0) setX(Math.max(diff, -100))
  }
  const handleEnd = () => {
    if(x < -70){
      if(navigator.vibrate) navigator.vibrate(50)
      onDelete(e.id)
    }
    setX(0)
  }
  return(
    <div style={{position:'relative', overflow:'hidden', borderRadius:16}}>
      <div style={{position:'absolute', right:0, top:0, bottom:0, width:100, background:'#FF3B30', display:'grid', placeItems:'center', color:'#fff', fontWeight:800}}>DELETE</div>
      <div
        onTouchStart={ev=> handleStart(ev.touches[0].clientX)}
        onTouchMove={ev=> handleMove(ev.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={ev=> handleStart(ev.clientX)}
        onMouseMove={ev=> { if(ev.buttons===1) handleMove(ev.clientX) }}
        onMouseUp={handleEnd}
        style={{
          transform:`translateX(${x}px)`, transition: x===0? 'transform 0.3s' : 'none',
          background: dark? 'rgba(30,30,34,0.8)' : 'rgba(255,255,255,0.85)',
          backdropFilter:'blur(20px)', border: `1px solid ${dark? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          padding:'16px', borderRadius:16, display:'flex', justifyContent:'space-between', alignItems:'center',
          boxShadow: dark? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)'
        }}>
        <div><span style={{fontSize:18}}>{catMeta[e.cat].emoji}</span> <b style={{marginLeft:8}}>{e.title}</b><div style={{fontSize:11, opacity:0.6, marginTop:2}}>{e.cat} • {e.dateISO}</div></div>
        <b style={{fontSize:16}}>₹{e.amount}</b>
      </div>
    </div>
  )
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
  const [dark, setDark] = useState(()=> localStorage.getItem('sw-dark')==='1')
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Shopping')
  const [listening, setListening] = useState(false)

  useEffect(()=>{ localStorage.setItem('spendwise-v3', JSON.stringify(expenses)) },[expenses])
  useEffect(()=>{ localStorage.setItem('sw-dark', dark?'1':'0') },[dark])

  const total = expenses.reduce((a,b)=> a+b.amount,0)
  const budget = 11000
  const isOver = total > budget

  useEffect(()=>{
    if(isOver && navigator.vibrate) navigator.vibrate([100,50,100])
  },[isOver])

  const byCat = useMemo(()=>{
    const m = new Map<Cat, number>(); expenses.forEach(e=> m.set(e.cat,(m.get(e.cat)||0)+e.amount))
    return Array.from(m.entries()).sort((a,b)=> b[1]-a[1])
  },[expenses])

  const pieGradient = useMemo(()=>{
    if(total===0) return '#eee 0% 100%'; let acc=0
    return byCat.map(([c,sum])=>{ const p=(sum/total)*100; const s=acc; acc+=p; return `${catMeta[c].color} ${s}% ${acc}%` }).join(', ')
  },[byCat,total])

  const add = ()=>{
    if(!title.trim()||!amount) return
    if(navigator.vibrate) navigator.vibrate(20)
    setExpenses([{id:Date.now().toString(), title:title.trim(), amount:Number(amount), cat, dateISO: new Date().toISOString().slice(0,10)},...expenses])
    setTitle(''); setAmount('')
  }

  const startVoice = () => {
    const Speech: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if(!Speech){ alert("Chrome me khol bhai"); return }
    const rec = new Speech(); rec.lang = 'en-IN'
    rec.onstart = () => setListening(true); rec.onend = () => setListening(false)
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript.toLowerCase()
      const num = text.match(/\d+/)?.[0]
      const name = text.replace(/\d+/g,'').replace(/rupees|rupaye|rs/g,'').trim()
      if(name) setTitle(name.charAt(0).toUpperCase()+name.slice(1))
      if(num) setAmount(num)
    }; rec.start()
  }

  const bg = dark? '#0A0A0F' : '#FFF1F3'
  const glass = dark? 'rgba(20,20,25,0.7)' : 'rgba(255,255,255,0.7)'

  return(
    <div style={{minHeight:'100vh', background: bg, transition:'background 0.3s', paddingBottom:30, fontFamily:'Inter, system-ui'}}>
      {/* Animated BG blobs */}
      <div style={{position:'fixed', top:-100, left:-100, width:300, height:300, background:'#7A5CFA', filter:'blur(100px)', opacity: dark?0.2:0.15, borderRadius:'50%'}}/>
      <div style={{position:'fixed', bottom:-100, right:-100, width:300, height:300, background:'#FF6CB0', filter:'blur(100px)', opacity: dark?0.2:0.15, borderRadius:'50%'}}/>

      <div style={{maxWidth:400, margin:'0 auto', padding:16, position:'relative', zIndex:1}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10}}>
          <div><h1 style={{margin:0, fontSize:32, fontWeight:900, letterSpacing:-1}}>SpendWise</h1><p style={{margin:0, opacity:0.6, fontSize:12}}>Swipe left to delete • Glass UI ✨</p></div>
          <button onClick={()=> setDark(!dark)} style={{width:44, height:44, borderRadius:14, border:0, background:glass, backdropFilter:'blur(10px)', cursor:'pointer', fontSize:18}}>{dark?'☀️':'🌙'}</button>
        </div>

        <div style={{
          background: isOver? 'linear-gradient(135deg,#FF5A5A,#FF1A1A)' : 'linear-gradient(135deg,#7A5CFA 0%, #4D7CFF 100%)',
          borderRadius:28, padding:24, marginTop:18, color:'#fff', boxShadow:'0 20px 40px rgba(122,92,250,0.3)',
          transform: isOver? 'scale(1.02)' : 'scale(1)', transition:'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <p style={{margin:0, fontSize:11, letterSpacing:2, opacity:0.8}}>TOTAL SPENT</p>
          <h1 style={{margin:'6px 0', fontSize:44, fontWeight:900, letterSpacing:-2}}>₹{total.toLocaleString('en-IN')}</h1>
          <div style={{height:6, background:'rgba(255,255,255,0.2)', borderRadius:10, overflow:'hidden', marginTop:12}}>
            <div style={{width:`${Math.min((total/budget)*100,100)}%`, height:'100%', background:'#fff', borderRadius:10, transition:'width 0.6s ease'}}/>
          </div>
        </div>

        <div style={{background:glass, backdropFilter:'blur(20px)', borderRadius:20, padding:12, marginTop:16, display:'grid', gap:10, border:'1px solid rgba(255,255,255,0.1)'}}>
          <button onClick={startVoice} style={{width:'100%', padding:14, borderRadius:14, border: listening? '2px solid #FF3B30' : '2px dashed #7A5CFA', background: listening? '#FFE1E1' : 'rgba(122,92,250,0.1)', color:'#7A5CFA', fontWeight:800, cursor:'pointer', animation: listening? 'pulse 1s infinite' : 'none'}}>
            {listening? '🎧 Sun raha hu...' : '🎤 Bol ke Add kar'}
          </button>
          <div style={{display:'flex', gap:8}}>
            <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1, minWidth:0, padding:14, borderRadius:12, border:0, background: dark?'#2A2A2E':'#F5F5FF', color: dark?'#fff':'#000', outline:'none'}}/>
            <input value={amount} onChange={e=> setAmount(e.target.value)} type="number" placeholder="₹" style={{width:70, padding:14, borderRadius:12, border:0, background: dark?'#2A2A2E':'#F5F5FF', color: dark?'#fff':'#000', textAlign:'center'}}/>
          </div>
          <div style={{display:'flex', gap:8}}>
            <select value={cat} onChange={e=> setCat(e.target.value as Cat)} style={{flex:1, padding:14, borderRadius:12, border:0, background: dark?'#2A2A2E':'#F5F5FF', color: dark?'#fff':'#000'}}><option>Shopping</option><option>Food</option><option>Travel</option><option>Gym</option><option>Other</option></select>
            <button onClick={add} style={{padding:'0 24px', borderRadius:12, border:0, background:'#7A5CFA', color:'#fff', fontWeight:800, cursor:'pointer', boxShadow:'0 8px 20px rgba(122,92,250,0.4)'}}>Add +</button>
          </div>
        </div>

        <div style={{background:glass, backdropFilter:'blur(20px)', borderRadius:20, padding:16, marginTop:16, display:'flex', gap:16, alignItems:'center', border:'1px solid rgba(255,255,255,0.1)'}}>
          <div style={{width:90, height:90, borderRadius:'50%', background:`conic-gradient(${pieGradient})`, boxShadow:'0 4px 15px rgba(0,0,0,0.1)'}}/>
          <div style={{flex:1}}>{byCat.map(([c,sum])=> <div key={c} style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6}}><span>● {c}</span><b>₹{sum}</b></div>)}</div>
        </div>

        <div style={{marginTop:16, display:'grid', gap:10}}>
          <p style={{fontSize:11, opacity:0.5, letterSpacing:1, margin:0}}>← SWIPE LEFT TO DELETE</p>
          {expenses.map(e=> <SwipeCard key={e.id} e={e} dark={dark} onDelete={(id:string)=> setExpenses(prev=> prev.filter(x=> x.id!==id))} />)}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%{transform:scale(1)} 50%{transform:scale(1.02)} 100%{transform:scale(1)} }`}</style>
    </div>
  )
}
