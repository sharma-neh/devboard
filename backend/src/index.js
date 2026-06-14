import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DevBoard API running 🚀' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})