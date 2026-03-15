// Backend/models/message.js
import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GroupChat', 
    required: true 
  },
  
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  content: { 
    type: String, 
    maxlength: 2000 
  },
  
  // File attachment fields
  fileUrl: { 
    type: String 
  },
  
  fileName: { 
    type: String 
  },
  
  fileType: { 
    type: String 
  },
  
  // Read receipts
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Users who deleted this message (for "delete for me")
  deletedFor: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Message status
  isEdited: { 
    type: Boolean, 
    default: false 
  },
  
  editedAt: { 
    type: Date 
  }
  
}, { timestamps: true })

// Index for faster queries
messageSchema.index({ groupId: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

export default mongoose.model('Message', messageSchema)