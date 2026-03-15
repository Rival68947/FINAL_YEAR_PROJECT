import axios from 'axios'

export const getYoutubeVideos = async (req, res) => {
  try {
    const { topic } = req.body

    const response = await axios.post(
      'https://campus-learn-lms-1.onrender.com/youtube',
      { topic }
    )

    res.json(response.data)
  } catch (error) {
    res.status(500).json({ message: 'YouTube mode failed' })
  }
}
