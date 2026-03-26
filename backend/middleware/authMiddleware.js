import jwt from 'jsonwebtoken'                 // Import JWT to verify login token

const authMiddleware = (req, res, next) => {   // Middleware to protect private routes

  const authHeader = req.headers.authorization // Get Authorization header from request

  // If no token or token format is wrong
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'No token provided' }) // Stop request
  }

  const token = authHeader.split(' ')[1]       // Extract token from "Bearer <token>"

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = decoded.userId                    // Attach user ID to request
    req.userRole = decoded.role                // Attach user role to request

    next()                                     // Allow request to continue

  }catch (error) {
    console.log('AUTH ERROR 👉', error.message)
    res.status(401).json({ message: 'Invalid token' })
  }
}

export default authMiddleware                  // Export middleware to use in routes
