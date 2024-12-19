import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import scrapRoutes from './routes/scraperRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const HOST = '0.0.0.0'

const app = express()

// Connection
connectDB()

// Middlewares
app.use(express.json())
app.use(cors())

// Routes
app.use('/api', authRoutes)
app.use('/api', scrapRoutes)

app.get('/', (req, res) => {
  res.send(`Server is running at ${PORT}`)
})

app.listen(PORT, HOST, () => {
  console.log(`Server is running at ${PORT}`)
})
