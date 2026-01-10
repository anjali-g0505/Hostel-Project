import React from 'react';
import { Link } from 'react-router-dom';
import './WardenDashboard.css'; // We will create this CSS file next
import ViewAnnouncements from './ViewAnnouncements';

function WardenDashboard() {
  return (
    <div className="warden-dashboard">
      <div className="announcements-bar">
      <ViewAnnouncements/>
      </div>
      <div className="dashboard-grid">
        <Link to="/warden/view-applications" className="dashboard-card">
          <h4>Pending Approvals</h4>
          <p>Review and approve/reject night out requests.</p>
        </Link>
        
        <Link to="/warden/add-announcements" className="dashboard-card">
          <h4>Add Announcements</h4>
          <p>Post new announcements for students and staff.</p>
        </Link>
        
        <Link to="/warden/announcement-log" className="dashboard-card">
          <h4>Announcement Log</h4>
          <p>View, edit, or delete past announcements.</p>
        </Link>
        
        <Link to="/warden/request-order" className="dashboard-card">
          <h4>Order from Mess</h4>
          <p>Place food orders for events or personal use.</p>
        </Link>
      </div>

    </div>
  );
}

export default WardenDashboard;
