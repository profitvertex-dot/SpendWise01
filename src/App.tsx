import { useState, useEffect, useMemo, useRef } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string; title: string; amount: number; dateISO: string; cat: Cat }
type Page = 'home'|'stats'|'history'|'settings'

const catMeta: Record<Cat, {emoji: string, color: string}> = {
  Food: {emoji: '🍔', color: '#FF8A29'},
  Gym: {emoji: '💪', color: '#A855F7'},
  Travel: {emoji: '✈️', color: '#06E1F0'},
  Shopping: {emoji: '🛍️', color: '#FF6CB0'},
  Other: {emoji: '💸', color: '#FF5A5A'},
}

function SwipeRow({e, onDelete, cardBg, inputBg, textColor}: any){
  const [dx, setDx] = useState(0)
  const startX = useRef(0)
  const onTouchStart = (ev:any)=> startX.current = ev.touches[0].clientX
  const onTouchMove = (ev:any)=> {
    const diff = ev.touches[0].clientX - startX.current
    if(diff < 0) setDx(Math.max(diff, -90))
  }
  const onTouchEnd = ()=> {
    if(dx < -60){ onDelete() }
    setDx(0)
  }
  return (
    <div style={{position:'relative', overflow:'hidden', borderRadius:14}}>
      <div style={{position:'absolute', right:0, top:0, bottom:0, width:90, background:'#FF3B30', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800}}>Delete</div>
      <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{transform:`translateX(${dx}px)`, transition: dx===0?'transform 0.2s':'none', background:cardBg, padding:14, display:'flex', justifyContent:'space-between', position:'relative', zIndex:1}}>
        <div><b style={{color:textColor}}>{catMeta[e.cat].emoji} {e.title}</b><div style={{fontSize:11,opacity:0.5}}>{e.dateISO} • {e.cat}</div></div>
        <b style={{color:textColor}}>₹{e.amount}</b>
      </div>
    </div>
  )
}

export default function App(){
  const [page, setPage] = useState<Page>('home')
  const [expenses, setExpenses] = useState<Expense[]>(()=> { try{ const s=localStorage.getItem('spendwise-final'); return s?JSON.parse(s):[] }catch{return[]} })
  const [dark, setDark] = useState(()=> localStorage.getItem('sw-dark')==='1')
  const [budget, setBudget] = useState(()=> Number(localStorage.getItem('sw-budget')||'11000'))
  const [haptics, setHaptics] = useState(()=> localStorage.getItem('sw-haptics')!=='0')
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState(''); const [cat, setCat] = useState<Cat>('Shopping'); const [q, setQ] = useState('')
  const [listening, setListening] = useState(false)

  useEffect(()=> localStorage.setItem('spendwise-final', JSON.stringify(expenses)),[expenses])
  useEffect(()=> localStorage.setItem('sw-dark', dark?'1':'0'),[dark])
  useEffect(()=> localStorage.setItem('sw-budget', String(budget)),[budget])
  useEffect(()=> localStorage.setItem('sw-haptics', haptics?'1':'0'),[haptics])

  const total = expenses.reduce((a,b)=> a+b.amount,0)
  const vib = (p:number[])=>{ if(haptics && navigator.vibrate) navigator.vibrate(p) }
  const byCat = useMemo(()=>{ const m=new Map<Cat,number>(); expenses.forEach(e=> m.set(e.cat,(m.get(e.cat)||0)+e.amount)); return Array.from(m.entries()).sort((a,b)=> b[1]-a[1]) },[expenses])
  const filtered = expenses.filter(e=> e.title.toLowerCase().includes(q.toLowerCase()) || e.cat.toLowerCase().includes(q.toLowerCase()))

  const add = ()=>{ if(!title.trim()||!amount) return; vib([20]); const id=Date.now().toString(); setExpenses([{id, title:title.trim(), amount:Number(amount), cat, dateISO:new Date().toISOString().slice(0,10)},...expenses]); setTitle(''); setAmount('') }
  const startVoice = ()=>{ const S:any=(window as any).webkitSpeechRecognition||(window as any).SpeechRecognition; if(!S){alert("Chrome me khol");return} const r=new S(); r.lang='en-IN'; r.onstart=()=>setListening(true); r.onend=()=>setListening(false); r.onresult=(e:any)=>{ const t=e.results[0][0].transcript.toLowerCase(); const n=t.match(/\d+/)?.[0]; const name=t.replace(/\d+/g,'').replace(/rupees|rs/g,'').trim(); if(name) setTitle(name.charAt(0).toUpperCase()+name.slice(1)); if(n) setAmount(n)}; r.start() }

  const cardBg = dark?'#151518':'#fff'; const inputBg = dark?'#1E1E20':'#F3F3FF'; const textColor = dark?'#fff':'#111'
  const NavItem = ({k, icon, label}:{k:Page, icon:string, label:string})=>(
    <button onClick={()=>{setPage(k); vib([10])}} style={{flex:1, padding:'10px 0', border:0, background:'transparent', color: page===k? '#7A5CFA' : (dark?'#666':'#999'), fontWeight: page===k?800:500, fontSize:11}}><div style={{fontSize:20}}>{icon}</div>{label}</button>
  )

  return(
    <div style={{minHeight:'100vh', background: dark?'#000':'#FFF1F3', color:textColor, fontFamily:'Inter, system-ui', paddingBottom:80, boxSizing:'border-box'}}>
      <div style={{maxWidth:400, margin:'0 auto', padding:16, boxSizing:'border-box'}}>
        {page==='home' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h1 style={{margin:0, fontSize:28, fontWeight:900}}>SpendWise</h1><button onClick={()=> setDark(!dark)} style={{width:40,height:40,borderRadius:12,border:0,background:cardBg}}>{dark?'☀️':'🌙'}</button></div>
            <div style={{background: total>budget?'linear-gradient(135deg,#FF5A5A,#FF1A1A)':'linear-gradient(135deg,#7A5CFA,#4D7CFF)', borderRadius:28, padding:22, marginTop:16, color:'#fff'}}><p style={{margin:0,fontSize:10,letterSpacing:2,opacity:0.8}}>TOTAL / ₹{budget.toLocaleString()}</p><h1 style={{margin:'6px 0',fontSize:38,fontWeight:900}}>₹{total.toLocaleString('en-IN')}</h1></div>
            <div style={{marginTop:14,display:'grid',gap:10}}>{filtered.slice(0,10).map(e=> <SwipeRow key={e.id} e={e} cardBg={cardBg} inputBg={inputBg} textColor={textColor} onDelete={()=> {vib([30,50,30]); setExpenses(p=> p.filter(x=> x.id!==e.id))}} />)}</div>
            <div style={{background:cardBg,borderRadius:20,padding:12,marginTop:14,display:'grid',gap:8,position:'sticky',bottom:90, boxSizing:'border-box'}}><button onClick={startVoice} style={{padding:12,borderRadius:12,border:'2px dashed #7A5CFA',background:inputBg,color:'#7A5CFA',fontWeight:800}}>{listening?'🎧 Sun raha hu...':'🎤 Bol ke Add'}</button><div style={{display:'flex',gap:8}}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor, boxSizing:'border-box'}}/><input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="₹" style={{width:70,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor, boxSizing:'border-box'}}/></div><div style={{display:'flex',gap:8}}><select value={cat} onChange={e=>setCat(e.target.value as Cat)} style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}><option>Shopping</option><option>Food</option><option>Travel</option><option>Gym</option><option>Other</option></select><button onClick={add} style={{padding:'0 20px',borderRadius:12,border:0,background:'#7A5CFA',color:'#fff',fontWeight:800}}>Add +</button></div></div>
          </>
        )}
        {page==='history' && (
          <><h2 style={{margin:0}}>History 🕓</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{width:'100%',marginTop:14,padding:14,borderRadius:12,border:0,background:inputBg,color:textColor, boxSizing:'border-box', display:'block'}}/><div style={{marginTop:12,display:'grid',gap:8}}>{filtered.map(e=> <SwipeRow key={e.id} e={e} cardBg={cardBg} inputBg={inputBg} textColor={textColor} onDelete={()=> setExpenses(p=> p.filter(x=> x.id!==e.id))} />)}</div></>
        )}
        {page==='stats' && (
          <><h2>Analytics 📊</h2><div style={{background:cardBg,borderRadius:20,padding:16,marginTop:14}}>{byCat.map(([c,s])=> <div key={c} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between'}}><span>{catMeta[c].emoji} {c}</span><b>₹{s}</b></div><div style={{height:8,background:inputBg,borderRadius:10,marginTop:4}}><div style={{width:`${(s/total)*100}%`,height:'100%',background:catMeta[c].color}}/></div></div>)}</div></>
        )}
        {page==='settings' && (
          <><h2>Settings ⚙️</h2><div style={{background:cardBg,borderRadius:20,padding:16,marginTop:14,display:'grid',gap:12, boxSizing:'border-box'}}><input type="number" value={budget} onChange={e=> setBudget(Number(e.target.value))} style={{width:'100%',padding:12,borderRadius:12,border:0,background:inputBg,color:textColor, boxSizing:'border-box'}}/><button onClick={()=> setDark(!dark)} style={{padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}>🌙 Dark: {dark?'On':'Off'}</button><button onClick={()=> { if(confirm('Delete all?')) setExpenses([])}} style={{padding:12,borderRadius:12,border:'1px solid #FF3B30',background:'transparent',color:'#FF3B30'}}>Clear All</button></div></>
        )}
      </div>
      <div style={{position:'fixed',bottom:0,left:0,right:0, background:cardBg, borderTop: dark?'1px solid #1E1E20':'1px solid #eee', display:'flex', maxWidth:400, margin:'0 auto'}}>
        <NavItem k="home" icon="🏠" label="Home"/><NavItem k="stats" icon="📊" label="Stats"/><NavItem k="history" icon="🕓" label="History"/><NavItem k="settings" icon="⚙️" label="Settings"/>
      </div>
    </div>
  )
}
