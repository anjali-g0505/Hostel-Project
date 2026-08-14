import React, { useState } from 'react'; // Import useState
import { Link, useNavigate } from 'react-router-dom';
import coepLogo from '../../assets/COEP-LOGO.png'; // Adjusted path
import '../Navbar.css'; // Adjusted path
import { disconnectSocket } from '../../socket';

function StudentNavbar() {
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
                <Link to="/student/dashboard" className="navbar-logo">
                    <img className='coep-logo' src={coepLogo} alt="COEP Logo" /> COEP Girls Hostel
                </Link>

                
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
                        <Link to="/student/nightout-form" className="navbar-link" onClick={() => setMenuOpen(false)}>Night Out Form</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/student/view-applications" className="navbar-link" onClick={() => setMenuOpen(false)}>View Application</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/student/order-from-mess" className="navbar-link" onClick={() => setMenuOpen(false)}>Order from Mess</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/student/view-cart" className="navbar-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    </li>
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

export default StudentNavbar;
