import multer from 'multer'
import path from 'path'
// Define how and where files will be stored
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/')
    },
    // Create a unique file name to avoid conflicts
    filename(req, file, cb) {
        cb(
            null,
            `${Date.now()}-${file.originalname}`
        )
    }

})

// Configure multer with storage and file type check
const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname)  //allow only pdf
        if (ext !== '.pdf') {
            cb(new Error('Only PDFs allowed'))
        }
        cb(null, true)
    }
})

export default upload