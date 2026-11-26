
import { LogOut } from 'lucide-react'
import './Header.css'

export default function Header({ user, onLogout, title, action }) {
  return (
    <header className="dashboard-header">

      <div className="header-title">
        <h1>{title || 'Dashboard'}</h1>
      </div>

      {action && <div className="header-action">{action}</div>}

      <div className="header-user">

        <div className="header-user-info">
          <strong>
            {user?.name || 'Arjun Rao'} · {user?.role || 'Admin'}
          </strong>

          <span>
            {user?.store || 'DMC Head Office'}
          </span>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
          title="Sign out"
        >
          <LogOut size={22} />
        </button>

      </div>

    </header>
  )
}
