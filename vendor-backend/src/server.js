
import 'dotenv/config'

import express from 'express'
import cors from 'cors'

import connectDB from './config/database.js'
import invitationRoutes from './routes/invitation.routes.js'
import { verifyEmailConnection } from './utils/mailer.js'
import authRoutes from './routes/auth.routes.js'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vendor Management API Running',
  })
})

app.use('/api/invitations', invitationRoutes)

app.use('/api/auth', authRoutes)

const startServer = async () => {
  try {
    await connectDB()

    // Verify SMTP
    await verifyEmailConnection()

    const PORT = process.env.PORT || 5000

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error)
    process.exit(1)
  }
}

startServer()
