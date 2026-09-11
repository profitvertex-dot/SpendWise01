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

function SwipeRow({e, onDelete, cardBg, textColor}: any){
  const [dx, setDx] = useState(0)
  const startX = useRef(0)
  return (
    <div style={{position:'relative', overflow:'hidden', borderRadius:14}}>
      <div style={{position:'absolute', right:0, top:0, bottom:0, width:90, background:'#FF3B30', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800}}>Delete</div>
      <div
        onTouchStart={(ev:any)=> startX.current = ev.touches[0].clientX}
        onTouchMove={(ev:any)=>{ const diff = ev.touches[0].clientX - startX.current; if(diff<0) setDx(Math.max(diff,-90)) }}
        onTouchEnd={()=>{ if(dx<-60) onDelete(); setDx(0) }}
        style={{transform:`translateX(${dx}px)`, transition: dx===0?'transform 0.2s':'none', background:cardBg, padding:14, display:'flex', justifyContent:'space-between', position:'relative', zIndex:1}}
      >
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
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState(''); const [cat, setCat] = useState<Cat>('Shopping'); const [q, setQ] = useState('')
  const [calDate, setCalDate] = useState(new Date()); const [selected, setSelected] = useState<string|null>(null)
  const [listening, setListening] = useState(false)

  useEffect(()=> localStorage.setItem('spendwise-final', JSON.stringify(expenses)),[expenses])
  useEffect(()=> localStorage.setItem('sw-dark', dark?'1':'0'),[dark])
  useEffect(()=> localStorage.setItem('sw-budget', String(budget)),[budget])

  const total = expenses.reduce((a,b)=> a+b.amount,0)
  const byCat = useMemo(()=>{ const m=new Map<Cat,number>(); expenses.forEach(e=> m.set(e.cat,(m.get(e.cat)||0)+e.amount)); return Array.from(m.entries()).sort((a,b)=> b[1]-a[1]) },[expenses])
  const filtered = expenses.filter(e=> e.title.toLowerCase().includes(q.toLowerCase()))
  const dayTotals = useMemo(()=>{ const m=new Map<string,number>(); expenses.forEach(e=> m.set(e.dateISO,(m.get(e.dateISO)||0)+e.amount)); return m },[expenses])

  const add = ()=>{ if(!title.trim()||!amount) return; const id=Date.now().toString(); setExpenses([{id, title:title.trim(), amount:Number(amount), cat, dateISO:new Date().toISOString().slice(0,10)},...expenses]); setTitle(''); setAmount('') }
  const startVoice = ()=>{ const S:any=(window as any).webkitSpeechRecognition||(window as any).SpeechRecognition; if(!S){alert("Chrome me khol");return} const r=new S(); r.lang='en-IN'; r.onstart=()=>setListening(true); r.onend=()=>setListening(false); r.onresult=(e:any)=>{ const t=e.results[0][0].transcript.toLowerCase(); const n=t.match(/\d+/)?.[0]; const name=t.replace(/\d+/g,'').replace(/rupees|rs/g,'').trim(); if(name) setTitle(name.charAt(0).toUpperCase()+name.slice(1)); if(n) setAmount(n)}; r.start() }

  const cardBg = dark?'#151518':'#fff'; const inputBg = dark?'#1E1E20':'#F3F3FF'; const textColor = dark?'#fff':'#111'
  const NavItem = ({k, icon, label}:{k:Page, icon:string, label:string})=>(
    <button onClick={()=> setPage(k)} style={{flex:1, padding:'10px 0', border:0, background:'transparent', color: page===k? '#7A5CFA' : (dark?'#666':'#999'), fontWeight: page===k?800:500, fontSize:11}}><div style={{fontSize:20}}>{icon}</div>{label}</button>
  )

  const year = calDate.getFullYear(); const month = calDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month+1, 0).getDate()
  const days = Array.from({length:firstDay},()=>null).concat(Array.from({length:daysInMonth},(_,i)=>i+1))

  return(
    <div style={{minHeight:'100vh', background: dark?'#000':'#FFF1F3', color:textColor, fontFamily:'Inter, system-ui', paddingBottom:80, boxSizing:'border-box'}}>
      <div style={{maxWidth:400, margin:'0 auto', padding:16, boxSizing:'border-box'}}>

        {page==='home' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h1 style={{margin:0, fontSize:28, fontWeight:900}}>SpendWise</h1><button onClick={()=> setDark(!dark)} style={{width:40,height:40,borderRadius:12,border:0,background:cardBg}}>{dark?'☀️':'🌙'}</button></div>
            <div style={{background:'linear-gradient(135deg,#7A5CFA,#4D7CFF)', borderRadius:28, padding:22, marginTop:16, color:'#fff'}}>
              <p style={{margin:0,fontSize:11,letterSpacing:2,opacity:0.8}}>TOTAL SPENT / ₹{budget.toLocaleString()}</p>
              <h1 style={{margin:'6px 0',fontSize:38,fontWeight:900}}>₹{total.toLocaleString('en-IN')}</h1>
              <div style={{height:6,background:'rgba(255,255,255,0.25)',borderRadius:10,overflow:'hidden',marginTop:10}}><div style={{width:`${Math.min((total/budget)*100,100)}%`,height:'100%',background:'#fff'}}/></div>
            </div>
            <div style={{marginTop:14,display:'grid',gap:10}}>{expenses.slice(0,10).map(e=> <SwipeRow key={e.id} e={e} cardBg={cardBg} textColor={textColor} onDelete={()=> setExpenses(p=> p.filter(x=> x.id!==e.id))} />)}</div>
            <div style={{background:cardBg,borderRadius:20,padding:12,marginTop:14,display:'grid',gap:8,position:'sticky',bottom:90, boxSizing:'border-box'}}>
              <button onClick={startVoice} style={{padding:12,borderRadius:12,border:'2px dashed #7A5CFA',background:inputBg,color:'#7A5CFA',fontWeight:800}}>{listening?'🎧 Sun raha hu...':'🎤 Bol ke Add'}</button>
              <div style={{display:'flex',gap:8}}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Kya kharida?" style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor, boxSizing:'border-box'}}/><input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="₹" style={{width:70,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor, boxSizing:'border-box'}}/></div>
              <div style={{display:'flex',gap:8}}><select value={cat} onChange={e=>setCat(e.target.value as Cat)} style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}><option>Shopping</option><option>Food</option><option>Travel</option><option>Gym</option><option>Other</option></select><button onClick={add} style={{padding:'0 20px',borderRadius:12,border:0,background:'#7A5CFA',color:'#fff',fontWeight:800}}>Add +</button></div>
            </div>
          </>
        )}

        {page==='history' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h2 style={{margin:0}}>Calendar 📅</h2><div style={{display:'flex',gap:8, alignItems:'center'}}><button onClick={()=> setCalDate(new Date(year, month-1,1))} style={{padding:'6px 10px',borderRadius:8,border:0,background:inputBg,color:textColor}}>‹</button><span style={{fontWeight:800,fontSize:13}}>{calDate.toLocaleString('en-IN',{month:'short', year:'numeric'})}</span><button onClick={()=> setCalDate(new Date(year, month+1,1))} style={{padding:'6px 10px',borderRadius:8,border:0,background:inputBg,color:textColor}}>›</button></div></div>
            <div style={{background:cardBg, borderRadius:20, padding:12, marginTop:14}}><div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, textAlign:'center', fontSize:11, opacity:0.5, marginBottom:8}}><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div><div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>{days.map((d,i)=>{ if(d===null) return <div key={'e'+i}/>; const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; const amt=dayTotals.get(iso); const isSel=selected===iso; return <button key={iso} onClick={()=> setSelected(iso)} style={{aspectRatio:'1', borderRadius:12, border:isSel?'2px solid #7A5CFA':'0', background: amt? (isSel?'#7A5CFA':inputBg):'transparent', color:isSel?'#fff':textColor, fontWeight: amt?800:400, fontSize:12, position:'relative'}}>{d}{amt? <span style={{position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', fontSize:7, fontWeight:800, color:isSel?'#fff':'#7A5CFA'}}>₹{amt>999? `${Math.round(amt/1000)}k`:amt}</span> : null}</button> })}</div></div>
            {selected? <><h3 style={{margin:'12px 0 8px', fontSize:14}}>{selected} — ₹{(dayTotals.get(selected)||0).toLocaleString()}</h3><div style={{display:'grid', gap:8}}>{expenses.filter(e=> e.dateISO===selected).map(e=> <SwipeRow key={e.id} e={e} cardBg={cardBg} textColor={textColor} onDelete={()=> setExpenses(p=> p.filter(x=> x.id!==e.id))}/> )}{expenses.filter(e=> e.dateISO===selected).length===0 && <p style={{opacity:0.5, fontSize:13}}>Is din kuch nahi 🎉</p>}</div><button onClick={()=> setSelected(null)} style={{marginTop:10, padding:8, border:0, background:'transparent', color:'#7A5CFA', fontWeight:700}}>← Back to all</button></> : <><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{width:'100%', marginTop:12, padding:14, borderRadius:12, border:0, background:inputBg, color:textColor, boxSizing:'border-box', display:'block'}}/><div style={{marginTop:12, display:'grid', gap:8}}>{filtered.map(e=> <SwipeRow key={e.id} e={e} cardBg={cardBg} textColor={textColor} onDelete={()=> setExpenses(p=> p.filter(x=> x.id!==e.id))}/>)}</div></>}
          </>
        )}

        {page==='stats' && (() => {
          const maxCat = Math.max(...byCat.map(([,v])=>v),1)
          const last7 = Array.from({length:7},(_,i)=>{
            const d = new Date(); d.setDate(d.getDate() - (6-i))
            const iso = d.toISOString().slice(0,10)
            return { label: d.toLocaleDateString('en-IN',{weekday:'short'}), iso, amt: dayTotals.get(iso)||0 }
          })
          const max7 = Math.max(...last7.map(x=>x.amt),1)
          return (
            <>
              <h2 style={{margin:0}}>Analytics 📊</h2>
              <div style={{background:cardBg, borderRadius:20, padding:16, marginTop:14}}>
                <p style={{margin:'0 0 12px', fontSize:11, opacity:0.5, letterSpacing:1}}>SPEND BY CATEGORY</p>
                <div style={{display:'flex', alignItems:'center', gap:16}}>
                  <div style={{width:110, height:110, borderRadius:'50%', background:`conic-gradient(${byCat.map(([c,v],i)=>{ const prev = byCat.slice(0,i).reduce((a,[,val])=>a+val,0); return `${catMeta[c].color} ${(prev/total)*100}% ${(prev+v)/total*100}%` }).join(', ') || '#eee 0% 100%'})`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div style={{width:64, height:64, borderRadius:'50%', background:cardBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11}}>₹{total}</div>
                  </div>
                  <div style={{flex:1, display:'grid', gap:8}}>{byCat.map(([c,s])=> <div key={c} style={{display:'flex', justifyContent:'space-between', fontSize:12}}><span style={{display:'flex', alignItems:'center', gap:6}}><span style={{width:10,height:10,borderRadius:3,background:catMeta[c].color, display:'inline-block'}}/>{c}</span><b>₹{s}</b></div>)}{byCat.length===0 && <p style={{opacity:0.5, fontSize:12}}>No data</p>}</div>
                </div>
              </div>
              <div style={{background:cardBg, borderRadius:20, padding:16, marginTop:12}}>
                <p style={{margin:'0 0 12px', fontSize:11, opacity:0.5, letterSpacing:1}}>LAST 7 DAYS</p>
                <div style={{display:'flex', alignItems:'end', gap:8, height:120}}>{last7.map(d=> <div key={d.iso} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}><div style={{width:'100%', height:`${(d.amt/max7)*90+4}px`, background: d.amt? '#7A5CFA':'#EEE', borderRadius:8}}/><span style={{fontSize:10, opacity:0.6}}>{d.label}</span><span style={{fontSize:9, fontWeight:800}}>{d.amt? `₹${d.amt}`:''}</span></div>)}</div>
              </div>
              <div style={{background:cardBg,borderRadius:20,padding:16,marginTop:12}}><p style={{margin:'0 0 12px', fontSize:11, opacity:0.5}}>CATEGORY BARS</p>{byCat.map(([c,s])=> <div key={c} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between', fontSize:13}}><span>{catMeta[c].emoji} {c}</span><b>₹{s}</b></div><div style={{height:8,background:inputBg,borderRadius:10,marginTop:4}}><div style={{width:`${(s/maxCat)*100}%`,height:'100%',background:catMeta[c].color,borderRadius:10}}/></div></div>)}</div>
            </>
          )
        })()}

        {page==='settings' && (
          <>
            <h2 style={{margin:0}}>Settings ⚙️</h2>
            <div style={{background:cardBg,borderRadius:20,padding:16,marginTop:14,display:'grid',gap:12, boxSizing:'border-box'}}>
              <div style={{display:'flex',gap:8, alignItems:'center'}}><input type="number" value={budget} onChange={e=> setBudget(Number(e.target.value))} style={{flex:1,padding:12,borderRadius:12,border:0,background:inputBg,color:textColor, boxSizing:'border-box'}}/><span>Budget</span></div>
              <button onClick={()=> setDark(!dark)} style={{padding:12,borderRadius:12,border:0,background:inputBg,color:textColor}}>Dark: {dark?'On':'Off'}</button>
              <button onClick={()=> {if(confirm('Delete all?')) setExpenses([])}} style={{padding:12,borderRadius:12,border:'1px solid #FF3B30',background:'transparent',color:'#FF3B30',fontWeight:700}}>🗑️ Clear All Data</button>
              <div style={{opacity:0.4,fontSize:11,textAlign:'center',marginTop:8}}>SpendWise v2.1 • Charts Added</div>
            </div>
          </>
        )}
      </div>
      <div style={{position:'fixed',bottom:0,left:0,right:0, background:cardBg, borderTop: dark?'1px solid #1E1E20':'1px solid #eee', display:'flex', maxWidth:400, margin:'0 auto'}}>
        <NavItem k="home" icon="🏠" label="Home"/><NavItem k="stats" icon="📊" label="Stats"/><NavItem k="history" icon="📅" label="Calendar"/><NavItem k="settings" icon="⚙️" label="Settings"/>
      </div>
    </div>
  )
              }
