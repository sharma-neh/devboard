import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/standups', async (req, res) => {
  try {
    const standups = await prisma.standup.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: standups })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch standups' })
  }
})

// GET single standup
app.get('/api/standups/:id', async (req, res) => {
  try {
    const standup = await prisma.standup.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!standup) {
      return res.status(404).json({ success: false, message: 'Standup not found' })
    }

    res.json({ success: true, data: standup })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch standup' })
  }
})

// POST create new standup
app.post('/api/standups', async (req, res) => {
  try {
    const { user, update, blockers } = req.body

    if (!user || !update) {
      return res.status(400).json({ success: false, message: 'User and update are required' })
    }

    const standup = await prisma.standup.create({
      data: {
        user,
        update,
        blockers: blockers || 'none',
        date: new Date().toISOString().split('T')[0]
      }
    })

    res.status(201).json({ success: true, data: standup })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create standup' })
  }
})

// PUT update standup
app.put('/api/standups/:id', async (req, res) => {
  try {
    const standup = await prisma.standup.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    })

    res.json({ success: true, data: standup })
  } catch (err) {
    res.status(404).json({ success: false, message: 'Standup not found' })
  }
})

// DELETE standup
app.delete('/api/standups/:id', async (req, res) => {
  try {
    await prisma.standup.delete({
      where: { id: parseInt(req.params.id) }
    })

    res.json({ success: true, message: 'Standup deleted' })
  } catch (err) {
    res.status(404).json({ success: false, message: 'Standup not found' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DevBoard API running 🚀' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})