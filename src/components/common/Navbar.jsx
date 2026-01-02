import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav id="navbar" className="navbar">
            <div className="nav-container">
                <div className="logo">
                    <div className="logo-text">
                        <Link to="/">O^!</Link>
                    </div>
                </div>
                
                <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <li>
                        <Link to="/" className={isActive('/')} onClick={() => setIsMobileMenuOpen(false)}>
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/schedule" className={isActive('/schedule')} onClick={() => setIsMobileMenuOpen(false)}>
                            Schedule
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/resources" className={isActive('/resources')} onClick={() => setIsMobileMenuOpen(false)}>
                            Resources
                        </Link>
                    </li>
                </ul>
                
                <button 
                    className="mobile-menu-toggle" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    ☰
                </button>
            </div>
        </nav>
    );
}

export default Navbar;