
import { useState } from 'react'

import {
  Users,
  ShieldCheck,
  Cookie,
  CircleX,
  Plus,
} from 'lucide-react'

import {
  Outlet,
  useLocation,
} from 'react-router-dom'

// Common Components
import Header from '../../../common/Header'
import Footer from '../../../common/Footer'
import StatsCards from '../../../common/StatsCards'

// Dashboard Components
import Sidebar from '../../layout/Sidebar'
import ConsentSources from '../components/ConsentSources'
import QuickActions from '../components/QuickActions'

import './Dashboard.css'

// Dashboard Statistics
const dashboardCards = [
  {
    title: 'Customers',
    value: 25,
    icon: Users,
  },
  {
    title: 'Opted-in customers',
    value: 25,
    icon: ShieldCheck,
  },
  {
    title: 'Cookie consents (web)',
    value: 40,
    icon: Cookie,
  },
  {
    title: 'Consent withdrawals',
    value: 29,
    icon: CircleX,
  },
]

// Sidebar Route Mapping
const menuRoutes = {
  '/dashboard': 'Dashboard',
  '/dashboard/customers': 'Customers',
  '/dashboard/consent': 'Consent',
  '/dashboard/cookie-consent': 'Cookie Consent',
  '/dashboard/employees-onboarding': 'Employees Onboarding',
  '/dashboard/vendor-registration': 'Vendor Registration',
  '/dashboard/connectors': 'Connectors',
  '/dashboard/audit-trail': 'Audit Trail',
}

export default function Dashboard({ user, onLogout }) {
  const location = useLocation()

  const [actionMessage, setActionMessage] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const currentPath = location.pathname

  // Active Menu Based on Current URL
  const activeMenu = menuRoutes[currentPath] || 'Dashboard'

  // Handle Sidebar Menu Change
  const handleMenuChange = () => {
    setActionMessage('')
    setInviteOpen(false)
  }

  // Handle Quick Actions
  const handleQuickAction = (action) => {
    setActionMessage(`${action} selected`)
  }

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
      />

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <Header
          user={user}
          onLogout={onLogout}
          title={
            activeMenu === 'Connectors'
              ? 'Connected Connectors'
              : activeMenu
          }
          action={
            activeMenu === 'Vendor Registration' ? (
              <button
                type="button"
                className="header-action-button"
                onClick={() => setInviteOpen(true)}
              >
                <Plus size={16} />
                <span>New invite</span>
              </button>
            ) : null
          }
        />

        {/* Page Content */}
        <div className="dashboard-content">

          {currentPath === '/dashboard' ? (
            <>
              {/* SRS References */}
              <div className="srs-references">
                <span className="srs-label">
                  SRS v0.3 references:
                </span>

                <span className="srs-tag">
                  Obj. 2.1 Central consent
                </span>

                <span className="srs-tag">
                  Obj. 2.4 Traceability
                </span>

                <span className="srs-tag">
                  NFR Monitoring
                </span>
              </div>

              {/* Statistics Cards */}
              <StatsCards cards={dashboardCards} />

              {/* Dashboard Widgets */}
              <div className="dashboard-widgets">
                <ConsentSources />

                <QuickActions
                  onAction={handleQuickAction}
                />
              </div>

              {/* Quick Action Feedback */}
              {actionMessage && (
                <div className="dashboard-message">
                  {actionMessage}
                </div>
              )}
            </>
          ) : (
            <Outlet
              context={{
                inviteOpen,
                setInviteOpen,
              }}
            />
          )}

        </div>

        {/* Footer */}
        <Footer />

      </main>
    </div>
  )
}
