import { useEffect, useState } from 'react'
import { apiFetch } from './api/client'

function App() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    apiFetch<{ message: string }>('/health')
      .then(data => setStatus(data.message))
      .catch(() => setStatus('❌ API not reachable'))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>DevBoard v2</h1>
      <p>API status: <strong>{status}</strong></p>
    </div>
  )
}

export default App