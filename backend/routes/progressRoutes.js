import express from 'express'
import auth from '../middleware/authMiddleware.js'
import { toggleProgress, getProgress } from '../controllers/progressController.js'

const router = express.Router()

router.post('/toggle', auth, toggleProgress)
router.get('/', auth, getProgress)

export default router
