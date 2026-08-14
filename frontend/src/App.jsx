
import { useEffect, useState } from 'react'
import './App.css'
import { connectSocket } from './socket'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LandingPage from './pages/LandingPage'
import { Navigate, Route, Routes, Outlet } from 'react-router-dom' // Import Outlet
import StudentDashboard from './pages/Student/StudentDashboard'
import MessDashboard from './pages/Mess/MessDashboard'
import WardenDashboard from './pages/Warden/WardenDashboard'
import AppNavbar from './pages/AppNavbar'
import AddAnnouncement from './pages/Warden/AddAnnouncements'
import AnnouncementLogs from './pages/Warden/AnnouncementLogs'
import NightOutForm from './pages/Student/NightOutForm'
import ViewApplications from './pages/Student/ViewApplications'
import ViewPendingApplications from './pages/Warden/ViewPendingApplications'
import ManageMenu from './pages/Mess/ManageMenu'
import TakeOrder from './pages/Mess/TakeOrder'
import OrderReady from './pages/Mess/OrderReady'
import OrderLogs from './pages/Mess/OrderLogs'
import Menu from './pages/Mess/Menu'
import ViewCart from './pages/Warden/viewCart'

function ProtectedLayout() {
  return (
    <>
      <AppNavbar />
      <main className="app-content">
        <Outlet /> {/* This will render the WardenDashboard etc */}
      </main>
    </>
  );
}

function PublicLayout() {
  return (
    <main className="app-content">
      <Outlet />
    </main>
  );
}

function App() {

  useEffect(() => {
    // Covers page refresh / direct navigation while an existing session's token is still in localStorage.
    connectSocket();
  }, []); //runs on the first render

  return (
    <>
      <div className="App">
        <Routes>
          {/* Routes without the AppNavbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/home" element={<LandingPage />} />
          </Route>

          {/* Routes with the AppNavbar */}
          <Route element={<ProtectedLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/warden/dashboard" element={<WardenDashboard />} />
            <Route path="/mess/dashboard" element={<MessDashboard />} />

            <Route path="/warden/add-announcements" element={<AddAnnouncement/>} />
            <Route path="/warden/announcement-log" element={<AnnouncementLogs />} />
            <Route path="/warden/view-applications" element={<ViewPendingApplications />} />
            <Route path="/warden/request-order" element={<Menu />} />
            <Route path="/warden/view-cart" element={<ViewCart />} />

            <Route path="/student/nightout-form" element={<NightOutForm />} />
            <Route path="/student/view-applications" element={<ViewApplications />} />
            <Route path="/student/order-from-mess" element={<Menu />} />
            <Route path="/student/view-cart" element={<ViewCart />} />

            <Route path="/mess/update-menu" element={<ManageMenu/>} />
            <Route path="/mess/view-pending-orders" element={<TakeOrder/>} />
            <Route path="/mess/mark-ready" element={<OrderReady/>} />
            <Route path="/mess/order-log" element={<OrderLogs/>} />


            {/* <Route path="/warden/add-announcement" element={<YourAddAnnouncementPage />} /> */}
            
            {/* <Route path="/warden/order-mess" element={<YourOrderMessPage />} /> */}
          </Route>

        </Routes>
      </div>
    </>
  )
}

export default App