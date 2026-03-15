import Subject from '../models/subject.js'

export const createSubject = async (req, res) => {
  try {
    // Check authentication
    if (!req.userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    // Check role
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create subjects' })
    }

    const subject = await Subject.create({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.userId        // ✅ FIX HERE
    })

    res.json(subject)
  } catch (error) {
    console.log('CREATE SUBJECT ERROR 👉', error.message)
    res.status(500).json({ message: error.message })
  }
}


export const getSubjects = async (req, res) => {
  const subjects = await Subject.find().populate('createdBy', 'name')
  res.json(subjects)
}