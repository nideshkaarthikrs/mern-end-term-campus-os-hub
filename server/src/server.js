import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import { allIssueRouter } from './routes/issue.routes.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import mongoose from 'mongoose'

dotenv.config()

const app = express();
app.disable('x-powered-by')

const PORT = process.env.PORT || 5005;

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  throw new Error("JWT_SECRET and MONGO_URI are required")
}

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173'),
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

// Routes

app.use('/api/auth', authRouter)
app.use('/api/projects', projectRouter)
app.use('/api/issues', allIssueRouter)

app.get("/api/health", (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database unavailable" })
  }
  return res.json({ message: "Campus Open-Source Hub API is running" });
});

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer()
