
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import Invitation from '../models/Invitation.js'

import {
  sendInvitationEmail,
  sendOTPEmail,
} from '../utils/mailer.js'

import {
  prepareSensitiveData,
  getMaskedRegistrationData,
} from '../utils/maskSensitiveData.js'

// Hash helper
const hashValue = (value) => {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex')
}

// Find valid invitation
const findInvitation = async (token) => {
  const tokenHash = hashValue(token)

  const invitation = await Invitation.findOne({ tokenHash })

  if (!invitation) {
    return null
  }

  if (invitation.status === 'Completed') {
    return null
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = 'Expired'
    await invitation.save()
    return null
  }

  return invitation
}

// 1. Create Invitation
export const createInvitation = async (req, res) => {
  try {
    const { companyName, email } = req.body

    if (!companyName?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name and email are required',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email',
      })
    }

    // Generate secure invitation token
    const token = crypto.randomBytes(32).toString('hex')

    const tokenHash = hashValue(token)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await Invitation.create({
      companyName: companyName.trim(),
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    })

    // Create frontend link
    const invitationLink =
      `${process.env.FRONTEND_URL}/invite/${token}`

    try {
      await sendInvitationEmail({
        email: normalizedEmail,
        companyName: companyName.trim(),
        invitationLink,
      })
    } catch (emailError) {
      await Invitation.findByIdAndDelete(invitation._id)
      throw emailError
    }

    return res.status(201).json({
      success: true,
      message: 'Invitation email sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        companyName: invitation.companyName,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      },
    })

  } catch (error) {
    console.error('Create Invitation Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to send invitation email',
    })
  }
}

// 2. Get Invitation Details
export const getInvitation = async (req, res) => {
  try {
    const invitation = await findInvitation(req.params.token)

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation is invalid, expired or already completed',
      })
    }

    return res.json({
      success: true,
      invitation: {
        companyName: invitation.companyName,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      },
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch invitation',
    })
  }
}

// 3. Request OTP
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body

    const invitation = await findInvitation(req.params.token)

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation',
      })
    }

    if (email?.trim().toLowerCase() !== invitation.email) {
      return res.status(400).json({
        success: false,
        message: 'Email does not match invitation',
      })
    }

    // Generate 6 digit OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString()

    invitation.otpHash = hashValue(
      `${process.env.OTP_SECRET}:${otp}`
    )

    invitation.otpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    )

    invitation.otpAttempts = 0

    await invitation.save()

    await sendOTPEmail({
      email: invitation.email,
      otp,
    })

    return res.json({
      success: true,
      message: 'OTP sent successfully',
    })

  } catch (error) {
    console.error('OTP Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to send OTP',
    })
  }
}

// 4. Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    const invitation = await findInvitation(req.params.token)

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation',
      })
    }

    if (email?.trim().toLowerCase() !== invitation.email) {
      return res.status(400).json({
        success: false,
        message: 'Email does not match invitation',
      })
    }

    if (
      !invitation.otpHash ||
      !invitation.otpExpiresAt ||
      invitation.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP',
      })
    }

    if (invitation.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Request a new OTP',
      })
    }

    const submittedHash = hashValue(
      `${process.env.OTP_SECRET}:${String(otp)}`
    )

    if (submittedHash !== invitation.otpHash) {
      invitation.otpAttempts += 1
      await invitation.save()

      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP',
      })
    }

    invitation.status = 'OTP Verified'
    invitation.otpHash = null
    invitation.otpExpiresAt = null
    invitation.otpAttempts = 0

    await invitation.save()

    // Short-lived registration access token
    const registrationToken = jwt.sign(
      {
        invitationId: invitation._id.toString(),
        purpose: 'vendor-registration',
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '20m',
      }
    )

    return res.json({
      success: true,
      message: 'Email verified successfully',
      registrationToken,
    })

  } catch (error) {
    console.error('Verify OTP Error:', error)

    return res.status(500).json({
      success: false,
      message: 'OTP verification failed',
    })
  }
}

// 5. Submit Vendor Registration



export const submitRegistration = async (req, res) => {
  // Remove uploaded files if registration fails
  const cleanupFiles = async () => {
    const files = Object.values(req.files || {}).flat()

    await Promise.all(
      files.map((file) =>
        fsp.unlink(file.path).catch(() => {})
      )
    )
  }

  try {
    // 1. JWT Authorization
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      await cleanupFiles()

      return res.status(401).json({
        success: false,
        message: 'Registration authorization required',
      })
    }

    const registrationToken = authHeader.split(' ')[1]

    const decoded = jwt.verify(
      registrationToken,
      process.env.JWT_SECRET
    )

    if (decoded.purpose !== 'vendor-registration') {
      await cleanupFiles()

      return res.status(401).json({
        success: false,
        message: 'Invalid registration token',
      })
    }

    // 2. Find invitation
    const invitation = await Invitation.findById(
      decoded.invitationId
    )

    if (
      !invitation ||
      invitation.status !== 'OTP Verified' ||
      invitation.expiresAt < new Date()
    ) {
      await cleanupFiles()

      return res.status(400).json({
        success: false,
        message: 'Invitation is invalid or expired',
      })
    }

    // 3. Parse registration data
    let registrationData

    try {
      registrationData = JSON.parse(
        req.body.registrationData
      )
    } catch {
      await cleanupFiles()

      return res.status(400).json({
        success: false,
        message: 'Invalid registration data',
      })
    }

    if (
      !registrationData ||
      typeof registrationData !== 'object' ||
      Array.isArray(registrationData) ||
      Object.keys(registrationData).length === 0
    ) {
      await cleanupFiles()

      return res.status(400).json({
        success: false,
        message: 'Registration details are required',
      })
    }

    // 4. Check required documents
    const requiredDocuments = [
      'gstCertificate',
      'panCard',
      'cancelledCheque',
    ]

    for (const document of requiredDocuments) {
      if (!req.files?.[document]?.[0]) {
        await cleanupFiles()

        return res.status(400).json({
          success: false,
          message: `${document} document is required`,
        })
      }
    }

    // 5. Get uploaded document filenames
    const documents = {
      gstCertificate:
        req.files.gstCertificate[0].filename,

      panCard:
        req.files.panCard[0].filename,

      cancelledCheque:
        req.files.cancelledCheque[0].filename,
    }

    // 6. Save registration and documents
    // invitation.registrationData = registrationData
    invitation.registrationData = prepareSensitiveData(registrationData)
    invitation.documents = documents
    invitation.status = 'Completed'
    invitation.submittedAt = new Date()

    await invitation.save()

    // 7. Success response
    return res.status(200).json({
      success: true,
      message: 'Vendor registration submitted successfully',
      data: {
        documents,
      },
    })

  } catch (error) {
    await cleanupFiles()

    console.error('Registration Error:', error)

    if (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Registration token is invalid or expired',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to submit vendor registration',
    })
  }
}


// 6. Get All Vendor Invitations

export const getAllInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find()
      .sort({ createdAt: -1 })
      .select('-tokenHash -otpHash')

    const now = new Date()

    // Update expired invitations
    for (const invitation of invitations) {
      if (
        invitation.expiresAt < now &&
        invitation.status !== 'Completed' &&
        invitation.status !== 'Expired'
      ) {
        invitation.status = 'Expired'
        await invitation.save()
      }
    }

    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    }

    const formattedInvitations = invitations.map((invitation) => {
      const invitationData = invitation.toObject()

      // Prepare documents
      const documents = {}

      const documentTypes = [
        'gstCertificate',
        'panCard',
        'cancelledCheque',
      ]

      documentTypes.forEach((type) => {
        const filename = invitation.documents?.[type]

        if (filename) {
          const extension = path.extname(filename).toLowerCase()

          documents[type] = {
            filename,
            originalName: filename,
            mimeType: mimeTypes[extension] || '',
            url: `${req.protocol}://${req.get('host')}${req.baseUrl}/${invitation._id}/documents/${type}`,
          }
        }
      })

      // Only masked registration data will go to frontend
      const safeRegistrationData = getMaskedRegistrationData(
        invitationData.registrationData || {}
      )

      return {
        ...invitationData,

        registrationData: safeRegistrationData,

        documents,
      }
    })

    return res.status(200).json({
      success: true,
      count: formattedInvitations.length,
      invitations: formattedInvitations,
    })
  } catch (error) {
    console.error('Get All Invitations Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch vendor invitations',
    })
  }
}


const uploadDir = path.join(process.cwd(), 'uploads', 'vendors_doc')

// View / Open Vendor Document
export const viewVendorDocument = async (req, res) => {
  try {
    const { id, documentType } = req.params

    const allowedDocuments = [
      'gstCertificate',
      'panCard',
      'cancelledCheque',
    ]

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID',
      })
    }

    if (!allowedDocuments.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type',
      })
    }

    const invitation = await Invitation.findById(id).select('documents')

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      })
    }

    const filename = invitation.documents?.[documentType]

    if (!filename) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      })
    }

    // Prevent path traversal
    if (path.basename(filename) !== filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document filename',
      })
    }

    const filePath = path.join(uploadDir, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file does not exist on server',
      })
    }

    const extension = path.extname(filename).toLowerCase()

    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    }

    const contentType = mimeTypes[extension]

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported document format',
      })
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${filename}"`
    )
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'private, no-store')

    return res.sendFile(filePath)
  } catch (error) {
    console.error('View Document Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to view document',
    })
  }
}
