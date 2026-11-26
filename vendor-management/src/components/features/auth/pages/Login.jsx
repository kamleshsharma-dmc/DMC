
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, ShieldCheck } from 'lucide-react'
import Logo from '../../../common/Logo'
import CopyrightFooter from '../../../common/CopyrightFooter'

const DEMO_USER = {
  name: 'Arjun Rao',
  email: 'arjun@dmc.in',
  role: 'Admin',
  store: 'DMC Head Office',
}

const DEMO_OTP = '123456'

const inputClass =
  'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary-deep disabled:opacity-50'

export default function Login({ onLogin }) {
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState(DEMO_USER.email)
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState('')

  // Step 1: Send OTP
  const sendOtp = (e) => {
    e.preventDefault()

    setOtp('')
    setStep(2)
  }

  // Step 2: Verify OTP
  const verify = (e) => {
    e.preventDefault()

    if (otp !== DEMO_OTP) {
      return
    }

    const user = {
      ...DEMO_USER,
      email: identifier,
    }

    // Update login state in App.jsx
    onLogin?.(user)

    // Navigate to Dashboard
    navigate('/dashboard', { replace: true })
  }

  // Change email/mobile
  const handleChange = () => {
    setOtp('')
    setStep(1)
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">

      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 md:flex">

        <div className="self-start rounded-xl bg-card/95 p-3">
          <Logo />
        </div>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight text-primary-foreground">
            Know every customer.
            <br />
            Respect every consent.
          </h2>

          <p className="mt-4 max-w-md text-primary-foreground/85">
            Consent management, customer profiling and cookie consent for DMC administrators — encrypted,
            masked and fully traceable.
          </p>
        </div>

        <p className="text-xs text-primary-foreground/75">
          © DMC · Proprietary platform · Intellectual property of DMC
        </p>

        <svg
          className="absolute -right-24 -bottom-24 opacity-15"
          width="420"
          height="420"
          viewBox="0 0 48 48"
        >
          <text
            x="0"
            y="36"
            fontSize="30"
            fontWeight="900"
            className="fill-primary-foreground"
          >
            DMC
          </text>
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">

          <div className="mb-8 md:hidden">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold">
            Admin sign in
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            OTP sent to your registered email or mobile.
          </p>

          {step === 1 ? (

            /* Email / Mobile Step */
            <form className="mt-8 space-y-4" onSubmit={sendOtp}>

              <label className="block text-sm font-medium">
                Email or mobile

                <input
                  type="text"
                  className={`${inputClass} mt-1`}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </label>

              <div className="text-sm font-semibold text-secondary-foreground">
                Access role: Admin
              </div>

              <button
                type="submit"
                className={`${primaryBtn} w-full`}
              >
                <Smartphone className="h-4 w-4" />
                Send OTP
              </button>

            </form>

          ) : (

            /* OTP Verification Step */
            <form className="mt-8 space-y-4" onSubmit={verify}>

              <p className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                OTP sent to {identifier}. Demo OTP: <b>{DEMO_OTP}</b>
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                placeholder="••••••"
                required
              />

              <button
                type="submit"
                className={`${primaryBtn} w-full`}
                disabled={otp !== DEMO_OTP}
              >
                <ShieldCheck className="h-4 w-4" />
                Verify &amp; sign in
              </button>

              <button
                type="button"
                className="change-btn inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-muted-foreground shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={handleChange}
              >
                Change
              </button>

            </form>
          )}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?
            </span>{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-semibold text-primary hover:underline"
            >
              Sign Up
            </button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Login time, IP address and device are recorded for audit.
          </p>

          <div className="mt-10">
            <CopyrightFooter />
          </div>

        </div>
      </div>
    </div>
  )
}
