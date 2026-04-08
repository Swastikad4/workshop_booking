import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const footerRef = useRef(null);

  /* Track mouse movement to drive the cinematic spotlight overlay */
  const handleMouseMove = (e) => {
    if (!footerRef.current) return;
    const { left, top } = footerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    footerRef.current.style.setProperty('--mouse-x', `${x}px`);
    footerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <footer className="fossee-footer" ref={footerRef} onMouseMove={handleMouseMove}>
      {/* Dynamic Cursor Spotlight Layer */}
      <div className="footer-glow-overlay"></div>

      <div className="fossee-footer-container">
        {/* Left Section - Branding */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 22h20L12 2z"></path>
            </svg>
            <span className="shimmer-text">FOSSEE</span>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()} FOSSEE, IIT Bombay.<br />
            All rights reserved.
          </p>
        </div>

        {/* Right Section - Links Grid */}
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>PLATFORM</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/workshops">Workshops</Link>
            <Link to="/propose">Propose</Link>
            <Link to="/statistics">Statistics</Link>
            <Link to="/verify">Verify Pass</Link>
          </div>
          
          <div className="footer-col">
            <h4>FEATURES</h4>
            <Link to="#">Live Events</Link>
            <Link to="#">Past Reports</Link>
            <Link to="#">Course Docs</Link>
            <Link to="#">Tracking</Link>
            <Link to="#">Certificates</Link>
          </div>

          <div className="footer-col">
            <h4>ORGANIZATION</h4>
            <a href="https://fossee.in/about" target="_blank" rel="noopener noreferrer">About FOSSEE</a>
            <a href="https://www.iitb.ac.in/" target="_blank" rel="noopener noreferrer">IIT Bombay</a>
            <a href="#">Pricing</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Wikipedia</a>
          </div>

          <div className="footer-col">
            <h4>RESOURCES</h4>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Vulnerability</a>
          </div>

          <div className="footer-col">
            <h4>CONNECT</h4>
            <a href="https://github.com/FOSSEE" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#">X (Twitter)</a>
            <a href="#">LinkedIn</a>
            <a href="#">YouTube</a>
            <a href="#">Forums</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
