
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VendorRegistrationForm from './VendorRegistrationForm'
import './VendorInvitePage.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const formatDate = (date) => {
  if (!date) return ''

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export default function VendorInvitePage() {
  const { token } = useParams()

  const [invitation, setInvitation] = useState(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  // OTP verification states
  const [isVerified, setIsVerified] = useState(false)
  const [registrationToken, setRegistrationToken] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/invitations/${token}`
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || 'Invalid or expired invitation'
          )
        }

        const data = result.invitation || result.data || result

        setInvitation(data)

      } catch (err) {
        setError(err.message || 'Unable to load invitation')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    const registeredEmail = String(
      invitation?.email || invitation?.recipientEmail || ''
    ).trim().toLowerCase()

    const enteredEmail = email.trim().toLowerCase()

    if (!registeredEmail) {
      setError('Registered email is unavailable for this invitation.')
      return
    }

    if (enteredEmail !== registeredEmail) {
      setError('Please enter the registered email.')
      return
    }

    try {
      setSending(true)

      const response = await fetch(
        `${API_BASE_URL}/invitations/${token}/request-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: enteredEmail,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to send OTP'
        )
      }

      console.log('OTP API Response:', result)

      setOtp('')
      setOtpSent(true)
      setSuccess('OTP has been sent successfully to your email.')

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!otp.trim()) {
      setError('Please enter the OTP.')
      return
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.')
      return
    }

    try {
      setVerifying(true)

      const response = await fetch(
        `${API_BASE_URL}/invitations/${token}/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Invalid or expired OTP'
        )
      }

      console.log('OTP Verification Response:', result)

      // Get registration JWT token from backend
      const authToken =
        result.registrationToken ||
        result.accessToken ||
        result.token ||
        ''

      if (!authToken) {
        throw new Error(
          'OTP verified, but registration authorization token was not returned by the server.'
        )
      }

      // Open vendor registration form
      setRegistrationToken(authToken)
      setIsVerified(true)

      setSuccess('Email verified successfully.')

    } catch (err) {
      setError(err.message || 'Unable to verify OTP.')
    } finally {
      setVerifying(false)
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div className="invite-page">
        <div className="invite-loading" role="status">
          <span
            className="invite-loading-spinner"
            aria-hidden="true"
          />
          Loading invitation...
        </div>
      </div>
    )
  }

  // Invalid invitation
  if (error && !invitation) {
    return (
      <div className="invite-page">
        <div className="invite-card invite-error-card">
          <h2>Vendor Registration</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="invite-page">
      <main className="invite-main">
        <section className="invite-card">

          {/* Header */}
          <div className="invite-card-header">
            <div className="invite-brand">
              <img
                src="/dmc-logo-full.png"
                alt="DMC — Dynamic Mavens Consultancy"
              />
            </div>

            
          </div>

          {/* Heading */}
          <div className="invite-heading">
            <h1>Vendor registration</h1>

            <p className="invite-company-info">
              {invitation?.companyName || 'Vendor'} · valid until{' '}
              {formatDate(invitation?.expiresAt)}
            </p>
          </div>

          {/* Step 1 and 2: Email and OTP verification */}
          {!isVerified ? (
            !otpSent ? (

              // Email form
              <form
                className="invite-form"
                onSubmit={handleRequestOTP}
              >
                <div className="invite-form-group">
                  <label htmlFor="invite-email">
                    Enter the email ID this form was sent to.
                  </label>

                  <input
                    id="invite-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <div className="invite-message invite-message-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="invite-submit-btn"
                  disabled={sending}
                >
                  {sending ? 'Sending OTP...' : 'Request OTP'}
                </button>
              </form>

            ) : (

              // OTP verification form
              <form
                className="invite-form"
                onSubmit={handleVerifyOTP}
              >
                {success && (
                  <div className="invite-message invite-message-success">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="invite-message invite-message-error">
                    {error}
                  </div>
                )}

                <div className="invite-form-group">
                  <label htmlFor="invite-otp">
                    Enter the OTP
                  </label>

                  <input
                    id="invite-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ''))
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="invite-submit-btn"
                  disabled={verifying || otp.length !== 6}
                >
                  {verifying ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  className="invite-resend-btn"
                  onClick={() => {
                    setOtp('')
                    setError('')
                    setSuccess('')
                    setOtpSent(false)
                  }}
                >
                  Change email
                </button>
              </form>

            )
          ) : (

            // Step 3: Vendor registration form
            <VendorRegistrationForm
              token={token}
              email={email}
              registrationToken={registrationToken}
            />

          )}

          {/* Footer */}
          <div className="invite-footer">
            © 2026 DMC. Proprietary &amp; confidential – intellectual
            property of DMC.
          </div>

        </section>
      </main>
    </div>
  )
}
