// Import mongoose to create database structure
import mongoose from 'mongoose'

// Define how a User document will look in MongoDB
const userSchema = new mongoose.Schema({

  // Stores the user's full name
  name: String,

  // Stores user's email, must be unique (no duplicates)
  email: { type: String, unique: true },

  // Stores user's encrypted (hashed) password
  password: String,

  // Defines the role of the user in the system
  role: {
    type: String,

    // Only these roles are allowed
    enum: ['student', 'teacher', 'admin'],

    // Default role if not provided
    default: 'student'
  },
    // NEW: Student Info for Auto-Enrollment
  passingYear: { type: Number },
  department: { type: String },
  section: { type: String },
  school:{type:String},

})

// Create and export User model based on schema
export default mongoose.model('User', userSchema)


//======== DETAIL ===
// What this file does (very simple)

// Tells MongoDB how a user should look

// Controls what data can be saved

// Prevents duplicate emails

// Manages user roles