import './Footer.css'
import CopyrightFooter from './CopyrightFooter'

export default function Footer() {
  return (
    <footer className="common-footer">
      <CopyrightFooter />

      <div className="footer-logo">
        <img src="/dmc-logo-mark.png" alt="DMC logo" />
      </div>
    </footer>
  )
}