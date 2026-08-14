import React, { useState } from 'react'; // Import useState
import { Link, useNavigate } from 'react-router-dom';
import coepLogo from '../../assets/COEP-LOGO.png'; // Adjusted path
import '../Navbar.css'; // Adjusted path
import { disconnectSocket } from '../../socket';

function MessNavbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
        disconnectSocket();
        navigate('/login');
    };

    return (
        <nav className="navbar-landing">
            <div className="navbar-container">
                <Link to="/mess/dashboard" className="navbar-logo">
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

                {/* Menu items */}
                <ul className={menuOpen ? "navbar-menu active" : "navbar-menu"}>
                    <li className="navbar-item">
                        <Link to="/mess/view-pending-orders" className="navbar-link" onClick={() => setMenuOpen(false)}>ऑर्डर घ्या</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/mess/update-menu" className="navbar-link" onClick={() => setMenuOpen(false)}>आजचा मेनू</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/mess/mark-ready" className="navbar-link" onClick={() => setMenuOpen(false)}>ऑर्डर तयार</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/mess/order-log" className="navbar-link" onClick={() => setMenuOpen(false)}>ऑर्डरच्या नोंदी</Link>
                    </li>
                    <li className="navbar-item">
                        <button onClick={handleLogout} className="btn btn-primary btn-lg">
                            लॉग आउट
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default MessNavbar;
