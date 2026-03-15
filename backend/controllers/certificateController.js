import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import Subject from '../models/subject.js'
import Topic from '../models/topic.js'
import Progress from '../models/progress.js'
import User from '../models/user.js'
import { fileURLToPath } from 'url'

export const generateCertificate = async (req, res) => {
    try {
        const { subjectId } = req.params
        const userId = req.userId

        const user = await User.findById(userId)
        const subject = await Subject.findById(subjectId)
        const topics = await Topic.find({ subject: subjectId })
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)


        const completed = await Progress.countDocuments({
            user: userId,
            topic: { $in: topics.map(t => t._id) },
            completed: true
        })

        if (completed !== topics.length) {
            return res.status(403).json({
                message: 'Complete all topics to get certificate'
            })
        }

        // Generate unique certificate ID
        const certificateId = crypto.randomBytes(8).toString('hex')

        await Progress.updateMany(
            { user: userId, topic: { $in: topics.map(t => t._id) } },
            { certificateIssued: true, certificateId }
        )

        // Create PDF
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 50
        })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${subject.title}-certificate.pdf`
        )

        doc.pipe(res)

        /* ================= BORDER ================= */
        /* ================= BORDER ================= */
        doc
            .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
            .lineWidth(4)
            .stroke('#1e40af')

        /* ================= LOGO (TOP CENTER) ================= */
        const logoPath = path.join(__dirname, '../assets/logo.png')

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, doc.page.width / 2 - 50, 40, {
                width: 100
            })
        }

        /* ================= TITLE ================= */
        doc.moveDown(7)

        doc
            .fontSize(38)
            .fillColor('#1e3a8a')
            .text('Certificate of Completion', {
                align: 'center'
            })

        doc.moveDown(1)

        /* ================= BODY ================= */
        doc
            .fontSize(18)
            .fillColor('#000')
            .text('This is to certify that', {
                align: 'center'
            })

        doc.moveDown(1)

        doc
            .fontSize(30)
            .fillColor('#111827')
            .text(user.name, {
                align: 'center',
                underline: true
            })

        doc.moveDown(1)

        doc
            .fontSize(18)
            .text('has successfully completed the course', {
                align: 'center'
            })

        doc.moveDown(1)

        doc
            .fontSize(26)
            .fillColor('#1e40af')
            .text(subject.title, {
                align: 'center'
            })

        doc.moveDown(3)

        /* ================= FOOTER ================= */
        doc
            .fontSize(14)
            .fillColor('#374151')
            .text(`Certificate ID: ${certificateId}`, 80, doc.page.height - 120)

        doc
            .fontSize(14)
            .text(
                `Issued on: ${new Date().toLocaleDateString()}`,
                doc.page.width - 300,
                doc.page.height - 120
            )

        doc
            .fontSize(14)
            .text('Authorized Signature', doc.page.width - 300, doc.page.height - 80)

        doc
            .moveTo(doc.page.width - 300, doc.page.height - 90)
            .lineTo(doc.page.width - 120, doc.page.height - 90)
            .stroke()

        doc.end()
    } catch (error) {
        console.error('CERTIFICATE ERROR 👉', error.message)
        res.status(500).json({ message: error.message })
    }
}
