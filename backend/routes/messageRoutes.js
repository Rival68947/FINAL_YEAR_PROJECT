// Backend/routes/messageRoutes.js
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Message from '../models/message.js'
import GroupChat from '../models/groupChat.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/messages'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|png|jpg|jpeg/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only documents and images are allowed'))
    }
  }
})

// SEND MESSAGE (with optional file)
router.post('/send', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { groupId, content } = req.body

    // Validate group membership
    const group = await GroupChat.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    const isMember = group.members.some(m => m.toString() === req.userId)
    const isCreator = group.createdBy.toString() === req.userId
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Not a member of this group' })
    }

    // Create message object
    const messageData = {
      groupId,
      sender: req.userId,
      content: content || '',
    }

    // Add file info if uploaded
    if (req.file) {
      messageData.fileUrl = `/uploads/messages/${req.file.filename}`
      messageData.fileName = req.file.originalname
      messageData.fileType = req.file.mimetype
    }

    const message = new Message(messageData)
    await message.save()
    
    const populated = await Message.findById(message._id)
      .populate('sender', 'name role')

    // Emit to socket
    global.io?.to(groupId).emit('new-message', populated)

    res.status(201).json(populated)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET MESSAGES
router.get('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params

    // Verify user has access to this group
    const group = await GroupChat.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    const isMember = group.members.some(m => m.toString() === req.userId)
    const isCreator = group.createdBy.toString() === req.userId
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const messages = await Message.find({ 
      groupId,
      deletedFor: { $ne: req.userId } // Exclude messages deleted by this user
    })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 })
      .limit(500)
    
    res.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// DELETE MESSAGE
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params
    const { deleteForEveryone } = req.body

    const message = await Message.findById(messageId)
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // Check if user is the sender
    const isSender = message.sender.toString() === req.userId

    if (deleteForEveryone) {
      // Only sender can delete for everyone
      if (!isSender) {
        return res.status(403).json({ message: 'Only sender can delete for everyone' })
      }

      // Delete file if exists
      if (message.fileUrl) {
        const filePath = path.join(process.cwd(), message.fileUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }

      // Delete message from database
      await Message.findByIdAndDelete(messageId)

      // Emit to all users in the group
      global.io?.to(message.groupId.toString()).emit('message-deleted', { 
        messageId,
        deletedForEveryone: true 
      })

      res.json({ message: 'Message deleted for everyone' })
    } else {
      // Delete for me only - add user to deletedFor array
      if (!message.deletedFor) {
        message.deletedFor = []
      }
      
      if (!message.deletedFor.includes(req.userId)) {
        message.deletedFor.push(req.userId)
        await message.save()
      }

      res.json({ message: 'Message deleted for you' })
    }
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// CLEAR CHAT (Teacher only)
router.delete('/clear/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params

    // Verify user is a teacher
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can clear chat' })
    }

    // Verify group exists and user is the creator
    const group = await GroupChat.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can clear chat' })
    }

    // Get all messages with files
    const messages = await Message.find({ groupId })
    
    // Delete all files
    for (const message of messages) {
      if (message.fileUrl) {
        const filePath = path.join(process.cwd(), message.fileUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    }

    // Delete all messages
    await Message.deleteMany({ groupId })

    // Emit to all users in the group
    global.io?.to(groupId).emit('chat-cleared')

    res.json({ message: 'Chat cleared successfully' })
  } catch (error) {
    console.error('Error clearing chat:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// MARK AS READ
router.post('/:groupId/read', authMiddleware, async (req, res) => {
  try {
    await Message.updateMany(
      { 
        groupId: req.params.groupId,
        readBy: { $ne: req.userId }
      },
      { $addToSet: { readBy: req.userId } }
    )
    
    res.json({ message: 'Marked as read' })
  } catch (error) {
    console.error('Error marking as read:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router