import express from 'express'
import auth from '../middleware/authMiddleware.js'
import { generateCertificate } from '../controllers/certificateController.js'

const router = express.Router()

router.get('/:subjectId', auth, generateCertificate)

export default router
