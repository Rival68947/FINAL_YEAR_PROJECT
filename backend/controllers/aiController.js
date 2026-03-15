import axios from 'axios'
import Note from '../models/note.js'
import path from 'path'

export const askAI = async (req, res) => {
  try {
    const { question } = req.body

    // 🔁 Ensure notes are loaded
    try {
      await axios.post(
        'https://campus-learn-lms-1.onrender.com/ask',
        { question },
        { timeout: 2000 }
      )
    } catch {
      // Load notes if AI says not loaded
      const notes = await Note.find()

      for (const note of notes) {
        const absolutePath = path.resolve(note.fileUrl)

        await axios.post('https://campus-learn-lms-1.onrender.com/load', {
          file_path: absolutePath
        })
      }
    }

    // Ask again after loading
    const response = await axios.post('https://campus-learn-lms-1.onrender.com/ask', {
      question
    })

    res.json({ answer: response.data.answer })

  } catch (error) {
    console.log("AI ASK ERROR 👉", error.response?.data || error.message)
    res.status(500).json({ error: 'AI service failed' })
  }
}





// Load all notes into AI
export const loadNotesToAI = async (req, res) => {
  try {
    const notes = await Note.find()

    for (const note of notes) {
      // Convert relative path to absolute path
      const absolutePath = path.resolve(note.fileUrl)

      await axios.post('https://campus-learn-lms-1.onrender.com/load', {
        file_path: absolutePath
      })
    }

    res.json({ message: 'Notes loaded into AI successfully' })
} catch (error) {
  console.log("AI LOAD ERROR 👉", error.response?.data || error.message)
  res.status(500).json({ message: 'Failed to load notes into AI' })
}

}


