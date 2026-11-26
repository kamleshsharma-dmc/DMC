
import express from 'express'

import {
  createInvitation,
  getInvitation,
  requestOTP,
  verifyOTP,
  submitRegistration,
  getAllInvitations,
  viewVendorDocument,
} from '../controllers/invitation.controller.js'

// Multer middleware
import {
  uploadVendorDocuments,
} from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Admin creates invitation
router.post('/', createInvitation)

// Get all invitations
router.get('/', getAllInvitations)

// Vendor opens invitation link
router.get('/:token', getInvitation)

// Vendor requests OTP
router.post('/:token/request-otp', requestOTP)

// Vendor verifies OTP
router.post('/:token/verify-otp', verifyOTP)

// Vendor submits registration with documents
router.post(
  '/:token/submit',
  uploadVendorDocuments,
  submitRegistration
)

router.get(
  '/:id/documents/:documentType',
 
  viewVendorDocument
)

export default router
