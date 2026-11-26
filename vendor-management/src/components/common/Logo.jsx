import './Logo.css'

export default function Logo({ size = 40, withText = true, light = false }) {
  return (
    <div className={`dmc-logo${light ? ' dmc-logo-light' : ''}`}>
      {withText ? (
        <div className="dmc-logo-content">
          <img
            src="/dmc-logo-full.png"
            alt="DMC — Dynamic Mavens Consultancy"
            style={{ height: size * 0.72 }}
            className="dmc-logo-image"
          />
          <div className="dmc-logo-tagline">
            Know Your Customer
          </div>
        </div>
      ) : (
        <img
          src="/dmc-logo-mark.png"
          alt="DMC logo"
          style={{ height: size }}
          className="dmc-logo-image"
        />
      )}
    </div>
  )
}
