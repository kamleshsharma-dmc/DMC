
import { useState } from 'react'

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

// Auth
import Login from './components/features/auth/pages/Login'

// Dashboard Layout
import Dashboard from './components/admin/dashboard/pages/Dashboard'

// Dashboard Pages
import CustomerList from './components/admin/dashboard/components/customer/CustomerList'
import VendorRegistration from './components/admin/dashboard/components/vendor/VendorRegistration'
import ConnectorInventory from './components/admin/dashboard/components/ConnectorInventory'

import VendorInvitePage from './components/features/vendor/pages/VendorInvitePage'
import Signup from './components/features/auth/pages/Signup'
// Other Pages (Temporary placeholders)
function ConsentPage() {
  return <div className="module-placeholder"><h2>Consent</h2><p>Consent module will be integrated here.</p></div>
}

function CookieConsentPage() {
  return <div className="module-placeholder"><h2>Cookie Consent</h2><p>Cookie Consent module will be integrated here.</p></div>
}

function EmployeesOnboardingPage() {
  return <div className="module-placeholder"><h2>Employees Onboarding</h2><p>Employees Onboarding module will be integrated here.</p></div>
}

function AuditTrailPage() {
  return <div className="module-placeholder"><h2>Audit Trail</h2><p>Audit Trail module will be integrated here.</p></div>
}

function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <>
      <div id="prototype-notice">
        DMC · Sample-data prototype · Demo OTP: 123456 ·
        Changes reset on reload · Emails, uploads and connections are simulated
      </div>

      <Routes>

        {/* Home Redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={user ? '/dashboard' : '/login'}
              replace
            />
          }
        />
        <Route path="/signup" element={<Signup />} />
        {/* Login */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={handleLogin} />
          }
        />

        {/* PUBLIC VENDOR INVITATION ROUTE */}
        <Route
          path="/invite/:token"
          element={<VendorInvitePage />}
        />

        {/* Protected Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            user
              ? <Dashboard user={user} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        >

          {/* Dashboard Home */}
          <Route index element={null} />

          {/* Customers */}
          <Route
            path="customers"
            element={<CustomerList />}
          />

          {/* Consent */}
          <Route
            path="consent"
            element={<ConsentPage />}
          />

          {/* Cookie Consent */}
          <Route
            path="cookie-consent"
            element={<CookieConsentPage />}
          />

          {/* Employees Onboarding */}
          <Route
            path="employees-onboarding"
            element={<EmployeesOnboardingPage />}
          />

          {/* Vendor Registration */}
          <Route
            path="vendor-registration"
            element={<VendorRegistration />}
          />

          {/* Connectors */}
          <Route
            path="connectors"
            element={<ConnectorInventory />}
          />

          {/* Audit Trail */}
          <Route
            path="audit-trail"
            element={<AuditTrailPage />}
          />

        </Route>

        {/* Invalid URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  )
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
