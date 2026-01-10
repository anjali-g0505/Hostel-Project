import React, { useState } from 'react'; // Import useState
import { Link, useNavigate } from 'react-router-dom';
import coepLogo from '../../assets/COEP-LOGO.png'; // Adjusted path (go up two levels)
import '../Navbar.css'; // Adjusted path (go up one level)

function WardenNavbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav className="navbar-landing">
            <div className="navbar-container">
                <Link to="/warden/dashboard" className="navbar-logo">
                    <img className='coep-logo' src={coepLogo} alt="COEP Logo" /> COEP Girls Hostel
                </Link>

                {/* Hamburger Menu Toggle Button */}
                <div 
                    className={menuOpen ? "navbar-toggle active" : "navbar-toggle"}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>

                {/* Menu items: add "active" class when menuOpen is true */}
                <ul className={menuOpen ? "navbar-menu active" : "navbar-menu"}>
                    <li className="navbar-item">
                        <Link to="/warden/view-applications" className="navbar-link" onClick={() => setMenuOpen(false)}>Leave Approval</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/warden/add-announcements" className="navbar-link" onClick={() => setMenuOpen(false)}>Add Announcements</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/warden/announcement-log" className="navbar-link" onClick={() => setMenuOpen(false)}>Announcement Log</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/warden/request-order" className="navbar-link" onClick={() => setMenuOpen(false)}>Order from Mess</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/warden/view-cart" className="navbar-link" onClick={() => setMenuOpen(false)}>View Cart</Link>
                    </li>
                    {/* The logout button is now inside the <ul> for mobile */}
                    <li className="navbar-item">
                        <button onClick={handleLogout} className="btn btn-primary btn-lg">
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default WardenNavbar;
