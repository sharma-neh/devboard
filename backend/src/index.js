import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

app.get('/api/standups',authenticateToken, async (req, res) => {
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
app.get('/api/standups/:id',authenticateToken, async (req, res) => {
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
app.post('/api/standups',authenticateToken, async (req, res) => {
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
app.put('/api/standups/:id',authenticateToken, async (req, res) => {
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
app.delete('/api/standups/:id',authenticateToken, async (req, res) => {
  try {
    await prisma.standup.delete({
      where: { id: parseInt(req.params.id) }
    })

    res.json({ success: true, message: 'Standup deleted' })
  } catch (err) {
    res.status(404).json({ success: false, message: 'Standup not found' })
  }
})

// SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    // Hash the password — NEVER store plain text
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
      token
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Signup failed' })
  }
})

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
      token
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DevBoard API running 🚀' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})