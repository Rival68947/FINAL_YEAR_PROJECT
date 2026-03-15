import User from '../models/user.js'
import Subject from '../models/subject.js'
import Topic from '../models/topic.js'
import Progress from '../models/progress.js'

export const getSubjectAnalytics = async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers allowed' })
    }

    const subjects = await Subject.find({ createdBy: req.userId })
    const students = await User.find({ role: 'student' })

    const result = []

    for (let subject of subjects) {
      const topics = await Topic.find({ subject: subject._id })

      const completed = await Progress.countDocuments({
        topic: { $in: topics.map(t => t._id) },
        completed: true
      })

      const totalPossible = topics.length * students.length

      const percent =
        totalPossible === 0 ? 0 : Math.round((completed / totalPossible) * 100)

      result.push({
        subjectId: subject._id,
        subjectName: subject.title,
        percent
      })
    }

    res.json(result)
  } catch (error) {
  console.error(error)
  res.status(500).json({ message: error.message })
}
}

export const getStudentAnalyticsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params

    const students = await User.find({ role: 'student' })
    const topics = await Topic.find({ subject: subjectId })

    const result = []

    for (let student of students) {
      const completed = await Progress.countDocuments({
        user: student._id,
        topic: { $in: topics.map(t => t._id) },
        completed: true
      })

      const percent =
        topics.length === 0 ? 0 : Math.round((completed / topics.length) * 100)

      result.push({
        studentId: student._id,
        name: student.name,
        percent
      })
    }

    res.json(result)
  }  catch (error) {
  console.error(error)
  res.status(500).json({ message: error.message })
}
}
