import express from 'express'
import auth from '../middleware/authMiddleware.js'
import { getStudentAnalyticsBySubject, getSubjectAnalytics } from '../controllers/analyticsControllers.js'

const router = express.Router()

router.get('/subject', auth, getSubjectAnalytics)
router.get('/subject/:subjectId', auth, getStudentAnalyticsBySubject)


export default router
