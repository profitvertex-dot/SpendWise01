import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Gym' | 'Travel' | 'Shopping' | 'Other'
type Expense = { id: string, title: string, amount: number, dateISO: string, cat: Cat }

const catColor: Record<Cat, string> = { Food: '#FF6B6B', Gym: '#4ECDC4', Travel: '#45B7D1', Shopping: '#FFA600', Other: '#A78BFA' }
const catEmoji: Record<Cat, string> = { Food: '🍔', Gym: '💪', Travel: '✈️', Shopping: '🛍️', Other: '💸' }

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try { return JSON.parse(localStorage.getItem('sw-final') || '[]') } catch { return [] }
  })
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState<Cat>('Food')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [viewMonth, setViewMonth] = useState(() => new Date().toISOString().slice(0,7))
  const [logoError, setLogoError] = useState(false)

  useEffect(() => { localStorage.setItem('sw-final', JSON.stringify(expenses)) }, [expenses])

  const filtered = useMemo(() => expenses.filter(e=>e.dateISO.startsWith(viewMonth)), [expenses, viewMonth])
  const totalMonth = filtered.reduce((s,e)=>s+e.amount,0)

  const add = () => {
    if(!title.trim()||!amount) return;
    setExpenses([{id: Date.now().toString(), title: title.trim(), amount: Number(amount), cat, dateISO: date},...expenses]);
    setTitle(''); setAmount('')
  }
  const del = (id:string) => setExpenses(expenses.filter(e=>e.id!==id))

  const [y,m] = viewMonth.split('-').map(Number);
  const daysInMonth = new Date(y,m,0).getDate();
  const firstDay = new Date(y,m-1,1).getDay()
  const daysArr = Array(firstDay).fill(null).concat([...Array(daysInMonth)].map((_,i)=>i+1))
  const getDayTotal = (day:number) => {
    const d=`${viewMonth}-${String(day).padStart(2,'0')}`;
    return expenses.filter(e=>e.dateISO===d).reduce((s,e)=>s+e.amount,0)
  }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(180deg, #f8f9ff 0%, #fff0f6 100%)', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
      <div style={{maxWidth: 440, margin: '0 auto', padding: 16, paddingBottom: 100}}>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
          <div>
            <h1 style={{margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: -0.5}}>SpendWise</h1>
            <p style={{margin:
