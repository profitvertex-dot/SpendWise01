import { useState } from 'react'

export default function App() {
  const [amount, setAmount] = useState(0)
  return (
    <div style={{ background:'#111', color:'white', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif' }}>
      <h1 style={{ fontSize:'28px', fontWeight:'bold' }}>SpendWise 💰</h1>
      <p>Your app is LIVE!</p>
      <div style={{ background:'#222', padding:'15px', borderRadius:'10px', marginTop:'20px' }}>
        <h2>Total: ₹{amount}</h2>
        <button onClick={()=>setAmount(amount+100)} style={{ background:'#4ade80', padding:'10px 20px', border:'none', borderRadius:'8px', marginTop:'10px' }}>Add ₹100</button>
      </div>
    </div>
  )
}
