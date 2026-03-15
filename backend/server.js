  // Import Express to create a server
  import express from 'express'

  // Import Mongoose to connect with MongoDB database
  import mongoose from 'mongoose'

  // Import CORS to allow frontend and backend to talk to each other
  import cors from 'cors'

  // Import dotenv to read secret values from .env file
  import dotenv from 'dotenv'
  import connectDB from './config/db.js'
  import authRoutes from './routes/authRoutes.js'
  import noteRoutes from './routes/noteRoutes.js'
  import path from 'path'
  import aiRoutes from './routes/aiRoutes.js'
  import youtubeRoutes from './routes/youtubeRoutes.js'
  import subjectRoutes from './routes/subjectRoutes.js'
  import topicRoutes from './routes/topicRoutes.js'
  import progressRoutes from './routes/progressRoutes.js'
  import analyticsRoutes from './routes/analyticRoutes.js'
  import certificateRoutes from './routes/certificateRoutes.js'
  import dashboardRoutes from './routes/dashboardRoutes.js'
  //socket setup
  import http from 'http'
  import { Server } from 'socket.io'  // Changed from {server} to {Server}
  import messageRoutes from './routes/messageRoutes.js'
  import groupChatRoutes from './routes/groupChatRoutes.js'



  // Load all variables from .env file into the program
  dotenv.config()
  connectDB()  ///connect to db

  // Create an Express application
  const app = express()

  // Allow requests from other websites (frontend)
app.use(cors({
  origin: ['https://campus-learn-lms-zqft.vercel.app'],
  credentials: true
}))


  //socket.io
  const httpServer = http.createServer(app);  // Changed variable name
  const io = new Server(httpServer, {  // Using capital 'S' from imported Server
    cors: { origin: "https://campus-learn-lms-zqft.vercel.app", methods: ["GET", "POST"] }
  });

  global.io = io;

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-group', (groupId) => {
      socket.join(groupId)
    })

    socket.on('typing', ({ groupId, userName }) => {
      socket.to(groupId).emit('user-typing', userName)  // Fixed typo: socket.io → socket.to
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

  // Allow the server to understand JSON data sent by frontend
  app.use(express.json())
  app.use('/api/auth', authRoutes)  //middleware  //"All requests that start with /api/auth should be handled by authRoutes."
  app.use('/api/notes', noteRoutes)  //middleware //upload note handle
  app.use('/uploads', express.static('uploads'))
  app.use('/api/ai', aiRoutes)
  app.use('/api/youtube', youtubeRoutes)
  app.use('/api/subjects', subjectRoutes)
  app.use('/api/topics', topicRoutes)
  app.use('/api/progress', progressRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/api/certificate', certificateRoutes)
  app.use('/api/dashboard', dashboardRoutes)
  app.use('/api/groups', groupChatRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/uploads/messages', express.static('uploads/messages'))





  // Create a test route to check if server is running
  app.get('/', (req, res) => {
    // Send a simple message to browser
    res.send('CampusLearn backend running')  // Fixed typo
  })


  // Set port number from .env file or use 5000 if not available
  const PORT = process.env.PORT || 5000

  // Start the server and listen on the given port
  httpServer.listen(PORT, () => {  // Changed from httpServer.listen
    // Print message when server starts successfully
    console.log(`Server running on port ${PORT}`)
  })
