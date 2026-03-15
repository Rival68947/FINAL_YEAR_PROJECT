// Backend/models/groupChat.js
import mongoose from 'mongoose'

const groupChatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  
  // Matching Criteria
  passingYear: { type: Number, required: true },
  department: { type: String, required: true },
  section: { type: String, required: true },
  school:{type:String,required:true},
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',},
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

groupChatSchema.index({ passingYear: 1, department: 1, section: 1,school: 1 })

export default mongoose.model('GroupChat', groupChatSchema)