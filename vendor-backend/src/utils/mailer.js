
import 'dotenv/config'
import nodemailer from 'nodemailer'

console.log('EMAIL_USER loaded:', Boolean(process.env.EMAIL_USER))
console.log('EMAIL_PASS loaded:', Boolean(process.env.EMAIL_PASS))
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length)

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verify SMTP Connection
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('Email SMTP Connected Successfully')
    return true
  } catch (error) {
    console.error('SMTP Connection Failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    })

    return false
  }
}

// Invitation Email
export const sendInvitationEmail = async ({
  email,
  companyName,
  invitationLink,
}) => {
  return transporter.sendMail({
    from: `"Dynamic Mavens" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vendor Registration Invitation - Dynamic Mavens',
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2>Vendor Registration Invitation</h2>
        <p>Hello,</p>
        <p>You have been invited by Dynamic Mavens
        to complete vendor registration.</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p>Please click the link below to start your registration.</p>
        <a href="${invitationLink}"
          style="display:inline-block;background:#00b3a4;color:white;
          padding:12px 25px;text-decoration:none;border-radius:6px;">
          Complete Registration
        </a>
        <p>This invitation link is valid for 7 days.</p>
        <p>Regards,<br/>Dynamic Mavens Team</p>
      </div>
    `,
  })
}

// OTP Email
export const sendOTPEmail = async ({ email, otp }) => {
  return transporter.sendMail({
    from: `"Dynamic Mavens" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vendor Registration OTP',
    html: `
      <div style="font-family: Arial;">
        <h2>Email Verification</h2>
        <p>Your vendor registration OTP is:</p>
        <h1 style="letter-spacing:8px">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
      </div>
    `,
  })
}
