import { useState, useEffect, useMemo } from 'react'

type Cat = 'Food' | 'Transport' | 'Shopping' | 'Subscriptions' | 'Gym' | 'Other'
type Expense = { id: string; title: string; amount: number; dateISO: string; cat: Cat }

const catMeta: Record<Cat, {emoji: string, bg: string}> = {
  Food: {emoji: '🍜', bg: '#FFB07A'},
  Transport: {emoji: '🚗', bg: '#7AC8FF'},
  Shopping: {emoji: '🛍️', bg: '#C9A6FF'},
  Subscriptions: {emoji: '📅', bg: '#A6B4FF'},
  Gym: {emoji: '💪', bg: '#7DFFB0'},
  Other: {emoji: '💸', bg: '#FF8FA8'},
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try { const s = localStorage.getItem('sw-c'); return s? JSON.parse(s) : [
      {id:'1', title:'Food', amount:340, dateISO:'2024-09-10', cat:'Food'},
      {id:'2', title:'Transport', amount:120, dateISO:'2024-09-11', cat:'Transport'},
      {id:'3', title:'Shopping', amount:520, dateISO:'2024-09-12', cat:'Shopping'},
      {id:'4', title:'Subscriptions', amount:304.32, dateISO:'2024-09-13', cat:'Subscriptions'},
    ]} catch { return [] }
  })
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<Cat>('Food')
  const [viewMonth] = useState('2024-09')

  useEffect(() => { localStorage.setItem('sw-c', JSON.stringify(expenses)) }, [expenses])

  const filtered = useMemo(() => expenses, [expenses])
  const total = filtered.reduce((s,e)=> s+e.amount, 0)

  const add = () => {
    if(!title.trim()||!amount) return
    setExpenses([{id:Date.now().toString(), title:title.trim(), amount:Number(amount), cat, dateISO:new Date().toISOString().slice(0,10)},...expenses])
    setTitle(''); setAmount('')
  }
  const del = (id:string) => setExpenses(expenses.filter(e=> e.id!==id))

  const getPercent = (c: Cat) => {
    if(total===0) return 0
    const sum = filtered.filter(e=> e.cat===c).reduce((s,e)=> s+e.amount, 0)
    return Math.round((sum/total)*100)
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(160deg, #7B5CFF 0%, #5B3DF6 35%, #4A7BF
