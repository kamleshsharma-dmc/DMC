
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react'
import Logo from '../../../common/Logo'
import CopyrightFooter from '../../../common/CopyrightFooter'
import './Signup.css'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

const initialFormData = {
  fullName: '',
  email: '',
  mobile: '',
  companyName: '',
  password: '',
  confirmPassword: '',
}

export default function Signup() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Field validation
  const validateField = (name, value) => {
    const val = value.trim()

    switch (name) {
      case 'fullName':
        if (!val) return 'Full name is required.'
        if (val.length < 3) return 'Name must be at least 3 characters.'
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
          return 'Please enter a valid name.'
        }
        return ''

      case 'email':
        if (!val) return 'Email address is required.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return 'Please enter a valid email address.'
        }
        return ''

      case 'mobile':
        if (!val) return 'Mobile number is required.'
        if (!/^[6-9]\d{9}$/.test(val)) {
          return 'Enter a valid 10-digit Indian mobile number.'
        }
        return ''

      case 'companyName':
        if (!val) return 'Company name is required.'
        if (val.length < 2) return 'Company name is too short.'
        return ''

      case 'password':
        if (!value) return 'Password is required.'
        if (value.length < 8) {
          return 'Password must be at least 8 characters.'
        }
        if (!/[A-Z]/.test(value)) {
          return 'Password must contain an uppercase letter.'
        }
        if (!/[a-z]/.test(value)) {
          return 'Password must contain a lowercase letter.'
        }
        if (!/[0-9]/.test(value)) {
          return 'Password must contain a number.'
        }
        return ''

      case 'confirmPassword':
        if (!value) return 'Please confirm your password.'
        if (value !== formData.password) {
          return 'Password and confirm password do not match.'
        }
        return ''

      default:
        return ''
    }
  }

  // Validate complete form
  const validateForm = () => {
    const newErrors = {}

    Object.entries(formData).forEach(([name, value]) => {
      const message = validateField(name, value)

      if (message) {
        newErrors[name] = message
      }
    })

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target

    const updatedValue =
      name === 'mobile'
        ? value.replace(/\D/g, '').slice(0, 10)
        : value

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }))

    setError('')
    setSuccess('')

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, updatedValue),
      }))
    }

    if (name === 'password' && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          updatedValue === formData.confirmPassword
            ? ''
            : 'Password and confirm password do not match.',
      }))
    }
  }

  // Validate on blur
  const handleBlur = (e) => {
    const { name, value } = e.target

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }))
  }

  // Signup API
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        companyName: formData.companyName.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.')
      }

      setSuccess(
        result.message || 'Account created successfully!'
      )

      setFormData(initialFormData)
      setErrors({})

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (err) {
      setError(
        err.message || 'Unable to create account. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="signup-page">
      <aside className="signup-brand-panel">
        <div className="signup-brand-logo">
          <Logo />
        </div>

        <div className="signup-brand-copy">
          <span className="signup-eyebrow">DMC BUSINESS PLATFORM</span>

          <h2>
            Everything your
            <br />
            team needs,
            <br />
            in one place.
          </h2>

          <p>
            Create your account to access the DMC platform and manage your
            profile securely.
          </p>

          <div className="signup-trust-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Secure account setup</span>
          </div>
        </div>

        <div className="signup-brand-footer">
          <span>© DMC · Proprietary platform</span>
          <span>Intellectual property of DMC</span>
        </div>

        <div className="signup-brand-orbit signup-brand-orbit-one" />
        <div className="signup-brand-orbit signup-brand-orbit-two" />

        <span className="signup-brand-watermark" aria-hidden="true">
          DMC
        </span>
      </aside>

      <section className="signup-main">
        <div className="signup-card">
          <div className="signup-mobile-logo">
            <Logo />
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="signup-back-button"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to Login
          </button>

          <div className="signup-heading">
            <div className="signup-heading-icon">
              <UserPlus size={21} aria-hidden="true" />
            </div>

            <div>
              <span className="signup-eyebrow">GET STARTED</span>
              <h1>Create your account</h1>
              <p>Enter your details to set up your DMC account.</p>
            </div>
          </div>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <label className="signup-field">
              <span>Full Name</span>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="name"
                className={errors.fullName ? 'input-error' : ''}
                required
              />

              {errors.fullName && (
                <small className="field-error">{errors.fullName}</small>
              )}
            </label>

            <label className="signup-field">
              <span>Email Address</span>

              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                className={errors.email ? 'input-error' : ''}
                required
              />

              {errors.email && (
                <small className="field-error">{errors.email}</small>
              )}
            </label>

            <label className="signup-field">
              <span>Mobile Number</span>

              <input
                type="tel"
                name="mobile"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="tel"
                inputMode="numeric"
                className={errors.mobile ? 'input-error' : ''}
                required
              />

              {errors.mobile && (
                <small className="field-error">{errors.mobile}</small>
              )}
            </label>

            <label className="signup-field">
              <span>Company Name</span>

              <input
                type="text"
                name="companyName"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="organization"
                className={errors.companyName ? 'input-error' : ''}
                required
              />

              {errors.companyName && (
                <small className="field-error">{errors.companyName}</small>
              )}
            </label>

            <label className="signup-field">
              <span>Password</span>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                className={errors.password ? 'input-error' : ''}
                required
              />

              <small>At least 8 characters, uppercase, lowercase and number.</small>

              {errors.password && (
                <small className="field-error">{errors.password}</small>
              )}
            </label>

            <label className="signup-field signup-field-wide">
              <span>Confirm Password</span>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                className={errors.confirmPassword ? 'input-error' : ''}
                required
              />

              {errors.confirmPassword && (
                <small className="field-error">
                  {errors.confirmPassword}
                </small>
              )}
            </label>

            {error && (
              <p className="signup-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="signup-success" role="status">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="signup-submit-button"
              disabled={loading}
            >
              <UserPlus size={17} aria-hidden="true" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="signup-login-prompt">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
          </p>

          <div className="signup-copyright">
            <CopyrightFooter />
          </div>
        </div>

        <p className="signup-security-note">
          <ShieldCheck size={15} aria-hidden="true" />
          Your information is protected and kept confidential.
        </p>
      </section>
    </main>
  )
}
