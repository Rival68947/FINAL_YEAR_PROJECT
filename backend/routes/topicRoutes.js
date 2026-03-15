import express from 'express'
import { createTopic, getTopicsBySubject } from '../controllers/topicControllers.js'
import auth from '../middleware/authMiddleware.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post(
  '/',
  auth,
  upload.single('notes'),
  createTopic
)

router.get('/:subjectId', auth, getTopicsBySubject)

export default router
