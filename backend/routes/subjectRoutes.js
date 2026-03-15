import express from 'express'
import { createSubject, getSubjects } from '../controllers/subjectControllers.js'
import auth from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', auth, createSubject)
router.get('/', auth, getSubjects)

export default router
