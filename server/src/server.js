import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

dotenv.config()

const app = express();

const PORT = process.env.PORT || 5005;

connectDB()

app.get("/api/health", (req, res) => {
  res.json({ message: "Campus Open-Source Hub API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});