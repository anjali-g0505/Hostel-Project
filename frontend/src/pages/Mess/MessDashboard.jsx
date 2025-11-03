import React from 'react'
import ViewAnnouncements from '../Warden/ViewAnnouncements';
import './MessDashboard.css';
import { Link } from 'react-router-dom';

function MessDashboard() {
  return (
    <div className="warden-dashboard">
      <div className="announcements-bar">
      <ViewAnnouncements/>
      </div>
      <div className="dashboard-grid">
        <Link to="/mess/view-pending-orders" className="dashboard-card">
          <h4>ऑर्डर घ्या</h4>
          <p>विद्यार्थ्यांकडून आणि वॉर्डन स्टाफकडून आलेल्या नवीन ऑर्डर्स येथे पहा व स्वीकारा.</p>
        </Link>
        
        <Link to="/mess/update-menu" className="dashboard-card">
          <h4>आजचा मेनू</h4>
          <p>येथे तुम्ही मेनूमध्ये नवीन पदार्थ जोडू किंवा डिलीट करू शकता. तसेच, विद्यार्थ्यांना दाखवण्यासाठी पदार्थ उपलब्ध किंवा लपवलेले सेट करा.</p>
        </Link>
        
        <Link to="/mess/mark-ready" className="dashboard-card">
          <h4>ऑर्डर तयार</h4>
          <p>येथे स्वीकारलेल्या ऑर्डर्स बघा आणि त्या तयार झाल्यावर तयार असे मार्क करा.</p>
        </Link>
        
        <Link to="/mess/order-log" className="dashboard-card">
          <h4>ऑर्डरच्या नोंदी</h4>
          <p>येथे सर्व स्वीकारलेल्या आणि तयार ऑर्डर्सचा लॉग पहा. या नोंदी २४ तासांनंतर आपोआप डिलीट केल्या जातील.</p>
        </Link>
      </div>

    </div>
  );
}

export default MessDashboard
