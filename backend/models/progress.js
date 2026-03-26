import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export default mongoose.model('Progress', progressSchema)
