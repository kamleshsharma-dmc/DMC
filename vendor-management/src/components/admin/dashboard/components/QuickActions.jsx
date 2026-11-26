
import { ArrowRight } from 'lucide-react'
import './QuickActions.css'

const actions = [
  'Connected connectors',
  'Search / create customer',
  'Cookie consent register',
  'Consent register & export',
]

export default function QuickActions({ onAction }) {

  const handleAction = (action) => {
    onAction?.(action)
  }

  return (
    <section className="quick-actions-card">

      <h2>Quick actions</h2>

      <div className="quick-actions-list">

        {actions.map((action) => (

          <button
            type="button"
            key={action}
            onClick={() => handleAction(action)}
            className="quick-action-button"
          >

            <span>{action}</span>

            <ArrowRight size={20} />

          </button>

        ))}

      </div>

    </section>
  )
}
