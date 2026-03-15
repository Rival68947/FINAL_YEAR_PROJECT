// Import mongoose to connect Node.js with MongoDB
import mongoose from 'mongoose'

// Function to connect backend to MongoDB database
const connectDB = async () => {

  try {
    // Try to connect to MongoDB using the URL from .env file
    await mongoose.connect(process.env.MONGO_URI)

    // Print message if connection is successful
    console.log('MongoDB connected')

  } catch (error) {

    // Print error if connection fails
    console.log(error)
  }
}

// Export the function so it can be used in index.js
export default connectDB

//=================================  WHY ================

// What this file does (very simple)

// Reads MongoDB address from .env

// Connects backend to database

// Confirms connection with a message

// Shows error if something goes wrong