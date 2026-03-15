import Progress from '../models/progress.js'

export const toggleProgress = async (req, res) => {
  const { topicId } = req.body

  let progress = await Progress.findOne({
    user: req.userId,
    topic: topicId
  })

  if (!progress) {
    progress = await Progress.create({
      user: req.userId,
      topic: topicId,
      completed: true
    })
  } else {
    progress.completed = !progress.completed
    await progress.save()
  }

  res.json(progress)
}

export const getProgress = async (req, res) => {
  const progress = await Progress.find({
    user: req.userId
  })

  res.json(progress)
}
