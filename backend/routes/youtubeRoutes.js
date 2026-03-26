import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getYoutubeVideos } from '../controllers/youtubecontroller.js'

const router = express.Router()

router.post('/search', authMiddleware, getYoutubeVideos)

export default router
