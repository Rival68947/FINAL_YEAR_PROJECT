import express from 'express'                    // Import Express to create routes
import upload from '../middleware/upload.js'     // Import upload middleware for file handling
import Note from '../models/note.js'              // Import Note model to save notes in database
import authMiddleware from '../middleware/authMiddleware.js'
import fs from 'fs'                               // Import filesystem for file deletion
import path from 'path'                           // Import path for file path manipulation

const router = express.Router()                   // Create a new router for note-related routes

// POST: Upload notes (Teacher only)
router.post('/upload',
    authMiddleware,
    upload.single('file'),
    async (req, res) => {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({
                message: 'Only teachers can upload notes'
            })
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'No file uploaded'
                })
            }

            const note = new Note({
                title: req.body.title,
                subject: req.body.subject,
                school: req.body.school,
                batch: req.body.batch,
                semester: parseInt(req.body.semester),
                fileUrl: req.file.path,
                uploadedBy: req.userId,
            })
            await note.save()

            res.json({
                message: 'Note uploaded successfully',
                note: note
            })


        } catch (error) {
            
            console.error('Upload error:', error)
            res.status(500).json({
                message: 'Upload failed',
                error: error.message
            })
        }
    }
)

// GET: Notes uploaded by teacher (My Notes)
router.get('/my-notes', authMiddleware, async (req, res) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({
            message: 'Only teachers can view this'
        })
    }

    try {
        const notes = await Note.find({ uploadedBy: req.userId })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })

        res.json(notes)
    } catch (error) {
        console.error('Fetch notes error:', error)
        res.status(500).json({
            message: 'Failed to fetch notes',
            error: error.message
        })
    }
})

// GET: All notes (for students to view)
router.get('/all-notes', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })

        res.json(notes)
    } catch (error) {
        console.error('Fetch all notes error:', error)
        res.status(500).json({
            message: 'Failed to fetch notes',
            error: error.message
        })
    }
})

// GET: All notes (alternative endpoint without populate for better performance)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean()

        res.json(notes)
    } catch (error) {
        console.error('Fetch notes error:', error)
        res.status(500).json({
            message: 'Failed to fetch notes',
            error: error.message
        })
    }
})

// GET: Single note by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('uploadedBy', 'name email')

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            })
        }

        res.json(note)
    } catch (error) {
        console.error('Fetch note error:', error)
        res.status(500).json({
            message: 'Failed to fetch note',
            error: error.message
        })
    }
})

// DELETE: Remove a note (Teacher only - only their own notes)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({
            message: 'Only teachers can delete notes'
        })
    }

    try {
        const note = await Note.findById(req.params.id)

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            })
        }

        // Check if the note belongs to the logged-in teacher
        if (note.uploadedBy.toString() !== req.userId) {
            return res.status(403).json({
                message: 'You can only delete your own notes'
            })
        }

        // Delete the file from the server
        if (note.fileUrl && fs.existsSync(note.fileUrl)) {
            try {
                fs.unlinkSync(note.fileUrl)
            } catch (fileError) {
                console.error('Error deleting file:', fileError)
                // Continue deletion even if file deletion fails
            }
        }

        // Delete the note from database
        await Note.findByIdAndDelete(req.params.id)

        res.json({
            message: 'Note deleted successfully'
        })

    } catch (error) {
        console.error('Delete note error:', error)
        res.status(500).json({
            message: 'Failed to delete note',
            error: error.message
        })
    }
})

// PUT: Update note details (Teacher only - only their own notes)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({
            message: 'Only teachers can update notes'
        })
    }

    try {
        const note = await Note.findById(req.params.id)

        if (!note) {
            return res.status(404).json({
                message: 'Note not found'
            })
        }

        // Check if the note belongs to the logged-in teacher
        if (note.uploadedBy.toString() !== req.userId) {
            return res.status(403).json({
                message: 'You can only update your own notes'
            })
        }

        // Update title, subject, school, and batch if provided
        if (req.body.title) note.title = req.body.title
        if (req.body.subject) note.subject = req.body.subject
        if (req.body.school) note.school = req.body.school
        if (req.body.batch) note.batch = req.body.batch

        await note.save()

        res.json({
            message: 'Note updated successfully',
            note: note
        })

    } catch (error) {
        console.error('Update note error:', error)
        res.status(500).json({
            message: 'Failed to update note',
            error: error.message
        })
    }
})

export default router

//===================================================WHAT============
// What this file does:
// 1. POST /upload - Upload a new note (teacher only)
// 2. GET /my-notes - Get notes uploaded by current teacher
// 3. GET /all-notes - Get all notes (for students)
// 4. GET / - Get all notes (alternative endpoint)
// 5. GET /:id - Get a single note by ID
// 6. DELETE /:id - Delete a note (teacher only, own notes)
// 7. PUT /:id - Update note details (teacher only, own notes)
