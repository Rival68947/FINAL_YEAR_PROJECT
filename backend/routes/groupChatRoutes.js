// Backend/routes/groupChatRoutes.js
import express from 'express'
import GroupChat from '../models/groupChat.js'
import User from '../models/user.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// CREATE GROUP (Teacher only) - Creates group even if no students match
router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create groups' })
    }

    const { name, description, passingYear, department, section, school } = req.body

    // Validate required fields
    if (!name || !passingYear || !department || !section || !school) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Find matching students (but don't fail if none found)
    const students = await User.find({
      role: 'student',
      passingYear: parseInt(passingYear),
      department,
      section,
      school,
    }).select('_id')

    console.log(`Found ${students.length} matching students for group criteria:`, {
      passingYear,
      department,
      section,
      school
    })

    // Create group regardless of student count
    const group = new GroupChat({
      name,
      description,
      passingYear: parseInt(passingYear),
      department,
      section,
      school,
      createdBy: req.userId,
      members: students.map(s => s._id)
    })

    await group.save()
    
    res.status(201).json({ 
      message: students.length > 0 
        ? 'Group created successfully' 
        : 'Group created. No students match criteria yet.',
      group,
      memberCount: students.length 
    })
  } catch (error) {
    console.error('Error creating group:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET TEACHER'S GROUPS with member count
router.get('/my-groups', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access this route' })
    }

    const groups = await GroupChat.find({ createdBy: req.userId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
    
    res.json(groups)
  } catch (error) {
    console.error('Error fetching teacher groups:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET STUDENT'S GROUPS (Auto-enrolled based on matching criteria)
router.get('/student-groups', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access this route' })
    }

    // Find groups where student is a member
    const groups = await GroupChat.find({ 
      members: req.userId,
      isActive: true 
    })
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 })
    
    console.log(`Student ${req.userId} has access to ${groups.length} groups`)
    res.json(groups)
  } catch (error) {
    console.error('Error fetching student groups:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET SINGLE GROUP INFO (for both teachers and students)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if user has access (is creator or member)
    const isCreator = group.createdBy._id.toString() === req.userId
    const isMember = group.members.some(m => m._id.toString() === req.userId)

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(group)
  } catch (error) {
    console.error('Error fetching group:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// UPDATE GROUP - Refresh members based on current student data
router.put('/:id/refresh-members', authMiddleware, async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id)
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Find current matching students
    const students = await User.find({
      role: 'student',
      passingYear: group.passingYear,
      department: group.department,
      section: group.section,
      school: group.school,
    }).select('_id')

    group.members = students.map(s => s._id)
    await group.save()

    res.json({ 
      message: 'Members refreshed',
      memberCount: students.length 
    })
  } catch (error) {
    console.error('Error refreshing members:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// DELETE GROUP
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id)
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    if (group.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    await GroupChat.findByIdAndDelete(req.params.id)
    res.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router