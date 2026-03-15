import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

export default mongoose.model('Subject', subjectSchema)
