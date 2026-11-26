
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.join(process.cwd(), 'uploads', 'vendors_doc')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`

    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ]

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png']

  const extension = path.extname(file.originalname).toLowerCase()

  if (
    allowedTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extension)
  ) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF, JPG, JPEG and PNG files are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },
})

export const uploadVendorDocuments = upload.fields([
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'cancelledCheque', maxCount: 1 },
])
