import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
import './Contact.css';
import coepLogo from '../assets/COEP-LOGO.png';

const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </svg>
);

const CapIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </svg>
);

const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
);

function Contact() {
    return (
        <div className='landing-page'>
            <nav className="navbar-landing">
                <div className="navbar-container">
                    <Link to="/home" className="navbar-logo">
                        <img className='coep-logo' src={coepLogo} alt="COEP Logo" /> COEP Girls Hostel
                    </Link>
                    <ul className="navbar-menu">
                        <li className="navbar-item">
                            <a href="/home#amenities" className="navbar-link">About Us</a>
                        </li>
                        <li className="navbar-item">
                            <Link to="/contact" className="navbar-link">Contact</Link>
                        </li>
                    </ul>
                    <div className="navbar-buttons">
                        <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
                        <Link to="/signup" className="btn btn-primary btn-lg">Register</Link>
                    </div>
                </div>
            </nav>

            <section className="contact-hero">
                <div className="container">
                    <h1>Get in Touch</h1>
                    <p>Have a question about the hostel? Reach out to us through any of the channels below.</p>
                </div>
            </section>

            <section className="contact-section">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-card">
                            <div className="contact-icon"><MailIcon /></div>
                            <h3>General Hostel Email</h3>
                            <p><a href="mailto:hostel@coeptech.ac.in">hostel@coeptech.ac.in</a></p>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon"><CapIcon /></div>
                            <h3>Chief Rector Email</h3>
                            <p><a href="mailto:chiefrector@coeptech.ac.in">chiefrector@coeptech.ac.in</a></p>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon"><PhoneIcon /></div>
                            <h3>Hostel Office Phone</h3>
                            <p><a href="tel:+912025507660">020-25507660</a></p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer-landing">
                <div className="container">
                    <p>&copy; 2025 HostelHub. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Contact;
