
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Cookie,
  UserRoundPlus,
  Building2,
  Plug,
  ClipboardList,
  LockKeyhole,
  Menu,
  X,
} from 'lucide-react'

import Logo from '../../common/Logo'
import './Sidebar.css'

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    path: '/dashboard/customers',
    icon: Users,
  },
  {
    name: 'Consent',
    path: '/dashboard/consent',
    icon: ShieldCheck,
  },
  {
    name: 'Cookie Consent',
    path: '/dashboard/cookie-consent',
    icon: Cookie,
  },
  {
    name: 'Employees Onboarding',
    path: '/dashboard/employees-onboarding',
    icon: UserRoundPlus,
  },
  {
    name: 'Vendor Registration',
    path: '/dashboard/vendor-registration',
    icon: Building2,
  },
  {
    name: 'Connectors',
    path: '/dashboard/connectors',
    icon: Plug,
  },
  {
    name: 'Audit Trail',
    path: '/dashboard/audit-trail',
    icon: ClipboardList,
  },
]

export default function Sidebar({ activeMenu, onMenuChange }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleMenuClick = (item) => {
    navigate(item.path)

    if (onMenuChange) {
      onMenuChange(item.name)
    }

    setOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          open ? 'sidebar-open' : ''
        }`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <Logo size={40} light />
        </div>

        {/* Menu Heading */}
        <p className="sidebar-heading">
          ADMIN PANEL
        </p>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                type="button"
                key={item.path}
                className={`sidebar-link ${
                  activeMenu === item.name ? 'active' : ''
                }`}
                onClick={() => handleMenuClick(item)}
              >
                <Icon size={21} />

                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Security Section */}
        <div className="sidebar-security">
          <LockKeyhole size={22} />

          <div>
            <strong>Encrypted session</strong>
            <small>PII masked · All actions audited</small>
          </div>
        </div>
      </aside>
    </>
  )
}
