// Backend/routes/authRoutes.js
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import GroupChat from '../models/groupChat.js'

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, passingYear, department, section, school } = req.body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' })
    }

    // Validate student-specific fields
    if (role === 'student') {
      if (!passingYear || !department || !section || !school) {
        return res.status(400).json({ 
          message: 'Students must provide passing year, department, section, and school' 
        })
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      ...(role === 'student' && { 
        passingYear: parseInt(passingYear), 
        department, 
        section,
        school 
      })
    })

    await user.save()

    // If student, auto-add to matching groups
    if (role === 'student') {
      const matchingGroups = await GroupChat.find({
        passingYear: parseInt(passingYear),
        department,
        section,
        school,
        isActive: true
      })

      if (matchingGroups.length > 0) {
        // Add student to all matching groups
        await GroupChat.updateMany(
          {
            passingYear: parseInt(passingYear),
            department,
            section,
            school,
            isActive: true
          },
          { $addToSet: { members: user._id } }
        )

        console.log(`Auto-added student ${user._id} to ${matchingGroups.length} groups`)
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(role === 'student' && {
          passingYear: user.passingYear,
          department: user.department,
          section: user.section,
          school: user.school
        })
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'student' && {
          passingYear: user.passingYear,
          department: user.department,
          section: user.section,
          school: user.school
        })
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET CURRENT USER
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
})

export default router