import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

// Index for faster queries
noteSchema.index({ uploadedBy: 1 })
noteSchema.index({ subject: 1 })
noteSchema.index({ school: 1 })
noteSchema.index({ batch: 1 })
noteSchema.index({ semester: 1 })
noteSchema.index({ createdAt: -1 })

export default mongoose.model('Note', noteSchema)
