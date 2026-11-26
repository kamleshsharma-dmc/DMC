
import './StatsCards.css'

export default function StatsCards({ cards = [] }) {
  return (
    <div className="stats-grid">

      {cards.map((item) => {
        const Icon = item.icon

        return (
          <div className="stat-card" key={item.title}>

            <div className="stat-card-top">
              <span>{item.title}</span>

              {Icon && <Icon size={25} />}
            </div>

            <h2>{item.value}</h2>

          </div>
        )
      })}

    </div>
  )
}
