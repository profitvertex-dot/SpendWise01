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

export default function App(){
  const [page, setPage] = useState<Page>('home')
  const [expenses, setExpenses] = useState<Expense[]>(()=> { try{ const s=localStorage.getItem('spendwise-final'); return s?JSON.parse(s):[] }catch{return[]} })
  const [dark, setDark] = useState(()=> localStorage.getItem('sw-dark')==='1')
  const [budget, setBudget] = useState(()=> Number(localStorage.getItem('sw-budget')||'11000'))
  const [haptics, setHaptics] = useState(()=> localStorage.getItem('sw-haptics')!=='0')
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState(''); const [cat, setCat] = useState<Cat>('Shopping'); const [q, setQ] = useState('')
  const [lastId, setLastId] = useState<string|null>(null); const [listening, setListening] = useState(false)

  useEffect(()=> localStorage.setItem('spendwise-final', JSON.stringify(expenses)),[expenses])
  useEffect(()=> localStorage.setItem('sw-dark', dark?'1':'0'),[dark])
  useEffect(()=> localStorage.setItem('sw-budget', String(budget)),[budget])
  useEffect(()=> localStorage.setItem('sw-haptics', haptics?'1':'0'),[haptics])

  const total = expenses.reduce((a,b)=> a+b.amount,0)
  const isOver = total > budget
  const vib = (p:number[])=>{ if(haptics && navigator.vibrate) navigator.vibrate(p) }

  const byCat = useMemo(()=>{ const m=new Map<Cat,number>(); expenses.forEach(e=> m.set(e.cat,(m.get(e.cat)||0)+e.amount)); return Array.from(m.entries()).sort((a,b)=> b[1]-a[1]) },[expenses])
  const biggest = useMemo(()=> [...expenses].sort((a,b)=> b.amount-a.amount)[0], [expenses])
  const filtered = expenses.filter(e=> e.title.toLowerCase().includes(q.toLowerCase()) || e.cat.toLowerCase().includes(q.toLowerCase()))

  const add = ()=>{ if(!title.trim()||!amount) return; vib([20]); const id=Date.now().toString(); setExpenses([{id, title:title.trim(), amount:Number(amount), cat, dateISO:new Date().toISOString().slice(0,10)},...expenses]); setLastId(id); setTimeout(()=>setLastId(null),600); setTitle(''); setAmount('') }
  const startVoice = ()=>{ const S:any=(window as any).webkitSpeechRecognition||(window as any).SpeechRecognition; if(!S){alert("Chrome me khol");return} const r=new S(); r.lang='en-IN'; r.onstart=()=>setListening(true); r.onend=()=>setListening(false); r.onresult=(e:any)=>{ const t=e.results[0][0].transcript.toLowerCase(); const n=t.match(/\d+/)?.[0]; const name=t.replace(/\d+/g,'').replace(/rupees|rs/g,'').trim(); if(name) setTitle(name.charAt(0).toUpperCase()+name.slice(1)); if(n) setAmount(n)}; r.start() }

  const cardBg = dark?'#151518':'#fff'; const inputBg = dark?'#1E1E20':'#F3F3FF'; const textColor = dark?'#fff':'#111'
  const NavItem = ({k, icon, label}:{k:Page, icon:string, label:string})=>(
    <button onClick={()=>{setPage(k); vib([10])}} style={{flex:1, padding:'10px 0', border:0, background:'transparent', color: page===k? '#7A5CFA' : (dark?'#666':'#999'), fontWeight: page===k?800:500, fontSize:11}}><div style={{fontSize:20}}>{icon}</div>{label}</button>
  )

  return(
    <div style={{minHeight:'100vh', background: dark?'#000':'#FFF1F3', color:textColor, fontFamily:'Inter, system-ui', paddingBottom:80}}>
      <div style={{maxWidth:400, margin:'0 auto', padding:16}}>
        {page==='home' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h1 style={{margin:0, fontSize:28, fontWeight:900}}>SpendWise</h1><button onClick={()=> setDark(!dark)} style={{width:40,height:40,borderRadius:12,border:0,background:cardBg}}>{dark?'☀️':'🌙'}</button></div>
            <div style={{background: isOver?'linear-gradient(135deg,#FF5A5A,#FF1A1A)':'linear-gradient(135deg,#7A5CFA,#4D7CFF)', borderRadius:28, padding:22, marginTop:16, color:'#fff'}}><p style={{margin:0,fontSize:10,letterSpacing:2,opacity:0.8}}>TOTAL / ₹{budget.toLocaleString()}</p><h1 style={{margin:'6px 0',fontSize:38,fontWeight:900}}>₹{total.toLocaleString('en-IN')}</h1><div style={{height:6,background:'rgba(255,255,255,0.25)',borderRadius:10,overflow:'hidden'}}><div style={{width:`${Math.min((total/budget)*100,100)}%`,height:'100%',background:'#fff'}}/></div></div>
            {expenses.length===0? <div style={{background:cardBg,borderRadius:24,padding:40,marginTop:14,textAlign:'center'}}><div style={{fontSize:48}}>🫙</div><h3>No expenses yet</h3><p style={{opacity:0.5,fontSize:13}}>Add your first kharcha ✨</p></div> :
              <div style={{marginTop:14,display:'grid',gap:10}}>{filtered.slice(0,8).map(e=> <div key={e.id} style={{background:cardBg,padding:14,borderRadius:16,display:'flex',justifyContent:'space-between', border: e.id===lastId? '2px solid #7A5CFA':'1px solid transparent'}}><span>{catMeta[e.cat].emoji} {e.title}</span><b>₹{e.amount}</b></div>)}</div>}
            <div style={{background:cardBg,borderRadius:20,padding:12,marginTop:14,display:'grid',gap:8,position:'sticky',bottom:90}}><button onClick={startVoice} style={{padding:12,borderRadius:12,border:'2px dashed #7A5CFA',background:inputBg,color:'#7A5CFA',fontWeight:800}}>{listening?'🎧 Sun raha hu...':'🎤 Bol ke Add'}</button><div style={{display:'flex',gap:8}}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}/><input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="₹" style={{width:70,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}/></div><div style={{display:'flex',gap:8}}><select value={cat} onChange={e=>setCat(e.target.value as Cat)} style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}><option>Shopping</option><option>Food</option><option>Travel</option><option>Gym</option><option>Other</option></select><button onClick={add} style={{padding:'0 20px',borderRadius:12,border:0,background:'#7A5CFA',color:'#fff',fontWeight:800}}>Add +</button></div></div>
          </>
        )}
        {page==='stats' && (
          <><h2 style={{margin:0}}>Analytics 📊</h2><div style={{background:cardBg,borderRadius:20,padding:16,marginTop:14}}>{byCat.length===0? <p style={{opacity:0.5}}>No data yet</p> : byCat.map(([c,s])=> <div key={c} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span>{catMeta[c].emoji} {c}</span><b>₹{s}</b></div><div style={{height:8,background:inputBg,borderRadius:10,marginTop:4}}><div style={{width:`${(s/total)*100}%`,height:'100%',background:catMeta[c].color,borderRadius:10}}/></div></div>)}</div>{biggest && <div style={{background:cardBg,borderRadius:20,padding:16,marginTop:12}}><p style={{margin:0,opacity:0.5,fontSize:12}}>BIGGEST KHARCHA</p><h3 style={{margin:'6px 0'}}>{catMeta[biggest.cat].emoji} {biggest.title} — ₹{biggest.amount}</h3></div>}</>
        )}
        {page==='history' && (
          <><h2 style={{margin:0}}>History 🕓</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title, category..." style={{width:'100%',marginTop:14,padding:14,borderRadius:12,border:0,background:inputBg,color:textColor}}/><div style={{marginTop:12,display:'grid',gap:8}}>{filtered.map(e=> <div key={e.id} style={{background:cardBg,padding:14,borderRadius:14,display:'flex',justifyContent:'space-between'}}><div><b>{e.title}</b><div style={{fontSize:11,opacity:0.5}}>{e.dateISO} • {e.cat}</div></div><div style={{display:'flex',gap:8,alignItems:'center'}}><b>₹{e.amount}</b><button onClick={()=> setExpenses(prev=> prev.filter(x=> x.id!==e.id))} style={{border:0,background:'#FF3B30',color:'#fff',borderRadius:8,padding:'4px 8px'}}>x</button></div></div>)}</div></>
        )}
        {page==='settings' && (
          <><h2 style={{margin:0}}>Settings ⚙️</h2>
            <div style={{background:cardBg,borderRadius:20,padding:16,marginTop:14,display:'grid',gap:14}}>
              <div><p style={{margin:'0 0 6px',fontSize:12,opacity:0.5}}>MONTHLY BUDGET</p><div style={{display:'flex',gap:8}}><input type="number" value={budget} onChange={e=> setBudget(Number(e.target.value))} style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}/><span style={{padding:12}}>₹</span></div></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>🌙 Dark Mode</span><button onClick={()=> setDark(!dark)} style={{padding:'8px 16px',borderRadius:20,border:0,background: dark?'#7A5CFA':'#eee'}}>{dark?'On':'Off'}</button></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>📳 Haptics</span><button onClick={()=> setHaptics(!haptics)} style={{padding:'8px 16px',borderRadius:20,border:0,background: haptics?'#7A5CFA':'#eee',color:haptics?'#fff':'#000'}}>{haptics?'On':'Off'}</button></div>
              <button onClick={()=> { const blob=new Blob([JSON.stringify(expenses,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='spendwise.json'; a.click() }} style={{padding:12,borderRadius:12,border:0,background:inputBg,color:textColor,fontWeight:700}}>📤 Export Data (JSON)</button>
              <button onClick={()=> { if(confirm('Saara data delete?')){ setExpenses([]); localStorage.clear(); alert('Deleted'); } }} style={{padding:12,borderRadius:12,border:'1px solid #FF3B30',background:'transparent',color:'#FF3B30',fontWeight:700}}>🗑️ Clear All Data</button>
              <div style={{opacity:0.4,fontSize:11,textAlign:'center',marginTop:8}}>SpendWise v2.0 • Made with ❤️ • profitvertex-dot</div>
            </div>
          </>
        )}
      </div>
      <div style={{position:'fixed',bottom:0,left:0,right:0, background:cardBg, borderTop: dark?'1px solid #1E1E20':'1px solid #eee', display:'flex', maxWidth:400, margin:'0 auto'}}>
        <NavItem k="home" icon="🏠" label="Home"/><NavItem k="stats" icon="📊" label="Stats"/><NavItem k="history" icon="🕓" label="History"/><NavItem k="settings" icon="⚙️" label="Settings"/>
      </div>
    </div>
  )
}
