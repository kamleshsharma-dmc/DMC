
import { Activity } from 'lucide-react'
import './ConsentSources.css'

const sources = [
  { name: 'Store POS', value: 39 },
  { name: 'Website', value: 20 },
  { name: 'Navision ERP', value: 37 },
  { name: 'WonderSoft POS', value: 22 },
  { name: 'MoEngage', value: 38 },
  { name: 'Manual Form', value: 18 },
]

export default function ConsentSources() {
  return (
    <section className="consent-card">

      <div className="section-heading">

        <h2>Consent events by source</h2>

        <Activity size={22} />

      </div>

      <div className="source-list">

        {sources.map((source) => (

          <div className="source-row" key={source.name}>

            <span className="source-name">
              {source.name}
            </span>

            <div className="source-track">

              <div
                className="source-progress"
                style={{
                  width: `${(source.value / 40) * 100}%`,
                }}
              />

            </div>

            <strong className="source-value">
              {source.value}
            </strong>

          </div>

        ))}

      </div>

    </section>
  )
}
