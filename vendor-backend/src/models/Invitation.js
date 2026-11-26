import mongoose from 'mongoose'

const invitationSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'OTP Verified', 'Completed', 'Expired'],
      default: 'Pending',
    },

    otpHash: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    registrationData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

  documents: {
    gstCertificate: {
      type: String,
      default: '',
    },
    panCard: {
      type: String,
      default: '',
    },
    cancelledCheque: {
      type: String,
      default: '',
    },
  },

  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Invitation', invitationSchema)