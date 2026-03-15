import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { askAI, loadNotesToAI } from '../controllers/aiController.js'

const router = express.Router()


router.post('/load', authMiddleware, loadNotesToAI)
router.post('/ask', authMiddleware, askAI)



export default router

// What this line does (simple words)
    // This line creates a POST API route that:
    // Checks if the user is logged in
    // Then loads notes into the AI system
    // Only authorized users can access it.