import Note from '../models/note.js'
import Progress from '../models/progress.js'
import Subject from '../models/subject.js'


export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId
    const role = req.userRole

    let totalNotes = 0
    let streak = 0
    let achievements = 0

    /* TOTAL NOTES */
    if (role === 'teacher') {
      totalNotes = await Note.countDocuments({ uploadedBy: userId })
    } else {
      totalNotes = await Note.countDocuments()
    }

    /* DAILY STREAK (student only) */
    if (role === 'student') {
      const progress = await Progress.find({ user: userId }).sort({ updatedAt: -1 })

      const days = new Set()
      progress.forEach(p => {
        days.add(new Date(p.updatedAt).toDateString())
      })
      streak = days.size
    }

    /* ACHIEVEMENTS = COMPLETED SUBJECTS */
    if (role === 'student') {
      const subjects = await Subject.find()
      let completedSubjects = 0

      for (let subject of subjects) {
        const topics = await Topic.find({ subject: subject._id })

        if (topics.length === 0) continue

        const completed = await Progress.countDocuments({
          user: userId,
          topic: { $in: topics.map(t => t._id) },
          completed: true
        })

        if (completed === topics.length) {
          completedSubjects++
        }
      }

      achievements = completedSubjects
    }

    res.json({
      totalNotes,
      streak,
      achievements
    })
  } catch (error) {
    console.log('DASHBOARD ERROR 👉', error.message)
    res.status(500).json({ message: error.message })
  }
}
