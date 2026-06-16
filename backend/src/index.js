import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Temporary in-memory data (we'll replace with PostgreSQL on Day 4)
let standups = [
  { id: 1, user: 'Neha', update: 'Set up the project', blockers: 'none', date: '2026-06-14' },
  { id: 2, user: 'Neha', update: 'Built the API', blockers: 'CORS issue', date: '2026-06-15' },
]

// GET all standups
app.get('/api/standups', (req, res) => {
  res.json({ success: true, data: standups })
})

// GET single standup by id
app.get('/api/standups/:id', (req, res) => {
  const standup = standups.find(s => s.id === parseInt(req.params.id))

  if (!standup) {
    return res.status(404).json({ success: false, message: 'Standup not found' })
  }

  res.json({ success: true, data: standup })
})

// POST create new standup
app.post('/api/standups', (req, res) => {
  const { user, update, blockers } = req.body

  if (!user || !update) {
    return res.status(400).json({ success: false, message: 'User and update are required' })
  }

  const newStandup = {
    id: standups.length + 1,
    user,
    update,
    blockers: blockers || 'none',
    date: new Date().toISOString().split('T')[0]
  }

  standups.push(newStandup)
  res.status(201).json({ success: true, data: newStandup })
})

// PUT update standup
app.put('/api/standups/:id', (req, res) => {
  const index = standups.findIndex(s => s.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Standup not found' })
  }

  standups[index] = { ...standups[index], ...req.body }
  res.json({ success: true, data: standups[index] })
})

// DELETE standup
app.delete('/api/standups/:id', (req, res) => {
  const index = standups.findIndex(s => s.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Standup not found' })
  }

  standups.splice(index, 1)
  res.json({ success: true, message: 'Standup deleted' })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DevBoard API running 🚀' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})