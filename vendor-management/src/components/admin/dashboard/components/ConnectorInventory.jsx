import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  CircleCheck,
  Database,
  Info,
  Plug,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react'
import './ConnectorInventory.css'

const connectors = [
  {
    name: 'Navision ERP',
    account: 'DMC · Head Office',
    status: 'Connected',
    lastSync: '20 Oct 2026, 4:25 pm',
    records: '12,580',
    frequency: 'Every 15 minutes',
  },
  {
    name: 'WonderSoft POS',
    account: 'DMC · Retail stores',
    status: 'Connected',
    lastSync: '20 Oct 2026, 4:30 pm',
    records: '8,462',
    frequency: 'Every 5 minutes',
  },
  {
    name: 'MoEngage',
    account: 'DMC · Customer engagement',
    status: 'Needs attention',
    lastSync: '20 Oct 2026, 2:00 pm',
    records: '6,280',
    frequency: 'Event driven',
  },
  {
    name: 'Store POS',
    account: 'DMC · Retail stores',
    status: 'Connected',
    lastSync: '20 Oct 2026, 4:20 pm',
    records: '3,870',
    frequency: 'Every 5 minutes',
  },
  {
    name: 'Website',
    account: 'DMC · Web consent',
    status: 'Connected',
    lastSync: '20 Oct 2026, 4:30 pm',
    records: '400',
    frequency: 'Real time',
  },
]

const summaryCards = [
  { title: 'Configured connectors', value: '5', icon: Plug },
  { title: 'Connected', value: '4', icon: CircleCheck },
  { title: 'Needs attention', value: '1', icon: TriangleAlert },
  { title: 'Records synchronized', value: '31,592', icon: Database },
]

export default function ConnectorInventory() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [selectedConnector, setSelectedConnector] = useState(null)

  const filteredConnectors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return connectors.filter((connector) => {
      const matchesQuery =
        !normalizedQuery ||
        `${connector.name} ${connector.account}`.toLowerCase().includes(normalizedQuery)
      const matchesStatus =
        statusFilter === 'All statuses' || connector.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  return (
    <div className="connector-page">
      <section className="connector-summary" aria-label="Connector summary">
        {summaryCards.map(({ title, value, icon: Icon }) => (
          <article className="connector-summary-card" key={title}>
            <div className="connector-summary-label">
              <span>{title}</span>
              <Icon size={20} aria-hidden="true" />
            </div>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="connector-inventory">
        <div className="connector-inventory-heading">
          <h2>Connector inventory</h2>
          <div className="connector-filters">
            <label className="connector-search">
              <Search size={17} aria-hidden="true" />
              <span className="connector-visually-hidden">Search connectors</span>
              <input
                type="search"
                placeholder="Search connectors"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="connector-status-filter">
              <span className="connector-visually-hidden">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All statuses</option>
                <option>Connected</option>
                <option>Needs attention</option>
              </select>
            </label>
          </div>
        </div>

        <div className="connector-table-scroll">
          <table className="connector-table">
            <thead>
              <tr>
                <th scope="col">Connector / Account</th>
                <th scope="col">Status</th>
                <th scope="col">Last successful sync</th>
                <th scope="col">Records</th>
                <th scope="col">Frequency</th>
                <th scope="col"><span className="connector-visually-hidden">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredConnectors.map((connector) => (
                <tr key={connector.name}>
                  <td>
                    <div className="connector-name-cell">
                      <span className="connector-icon"><Plug size={18} /></span>
                      <span>
                        <strong>{connector.name}</strong>
                        <small>{connector.account}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`connector-status connector-status-${connector.status === 'Connected' ? 'connected' : 'attention'}`}
                    >
                      {connector.status === 'Connected'
                        ? <CheckCircle2 size={14} />
                        : <TriangleAlert size={14} />}
                      {connector.status}
                    </span>
                  </td>
                  <td>{connector.lastSync}</td>
                  <td className="connector-record-count">{connector.records}</td>
                  <td>{connector.frequency}</td>
                  <td>
                    <button
                      type="button"
                      className="connector-details-button"
                      onClick={() => setSelectedConnector(connector)}
                    >
                      <Info size={16} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredConnectors.length === 0 && (
                <tr>
                  <td className="connector-empty-state" colSpan={6}>
                    No connectors match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedConnector && (
        <div
          className="connector-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedConnector(null)
          }}
        >
          <section
            className="connector-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="connector-dialog-title"
          >
            <div className="connector-dialog-heading">
              <h2 id="connector-dialog-title">{selectedConnector.name}</h2>
              <button
                type="button"
                onClick={() => setSelectedConnector(null)}
                aria-label="Close connector details"
              >
                <X size={18} />
              </button>
            </div>
            <dl>
              <div><dt>Account</dt><dd>{selectedConnector.account}</dd></div>
              <div><dt>Status</dt><dd>{selectedConnector.status}</dd></div>
              <div><dt>Last successful sync</dt><dd>{selectedConnector.lastSync}</dd></div>
              <div><dt>Records</dt><dd>{selectedConnector.records}</dd></div>
              <div><dt>Frequency</dt><dd>{selectedConnector.frequency}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </div>
  )
}
