import Topic from '../models/topic.js'
import mongoose from 'mongoose'

export const createTopic = async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can add topics' })
    }

    const topic = await Topic.create({
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subjectId,
      articleLinks: req.body.articleLinks,
      youtubeLinks: req.body.youtubeLinks,
      notesFile: req.file?.path,
      createdBy: req.userId
    })

    res.json(topic)
  } catch (error) {
    console.log('CREATE TOPIC ERROR 👉', error.message)
    res.status(500).json({ message: error.message })
  }
}


export const getTopicsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: 'Invalid subjectId' })
    }

    const topics = await Topic.find({ subject: subjectId })
    return res.json(topics)
  } catch (error) {
    console.log('GET TOPICS BY SUBJECT ERROR 👉', error.message)
    return res.status(500).json({ message: error.message })
  }
}
