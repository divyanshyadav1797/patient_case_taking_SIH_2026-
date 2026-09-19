import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

export default function PatientSidebar() {
  const { logout } = useAuth();
  const { isMobileMenuOpen, setIsMobileMenuOpen, showToast } = usePatient();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Patient Portal?')) {
      logout();
      navigate('/login');
    }
  };

  const closeSidebar = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} id="sidebar">
      {/* Brand Logo */}
      <div className="logo">
        <div className="logo-icon">
          <i className="fa-solid fa-heart-pulse"></i>
        </div>
        <div>
          <h2>MediCare</h2>
          <span>Better Health, Brighter Lives.</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="navigation">
        <NavLink
          to="/patient/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-house"></i>
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/patient/doctors"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-user-doctor"></i>
          <span>Find a Doctor</span>
        </NavLink>

        <NavLink
          to="/patient/appointments"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-regular fa-calendar-days"></i>
          <span>Appointments</span>
        </NavLink>

        <NavLink
          to="/patient/records"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-regular fa-file-lines"></i>
          <span>Health Records</span>
        </NavLink>

        <NavLink
          to="/patient/medicines"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-pills"></i>
          <span>Medicines</span>
        </NavLink>

        {/* Government Schemes */}
        <NavLink
          to="/patient/schemes"
          className={({ isActive }) => `nav-item scheme-nav ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-building-columns"></i>
          <span>Government Schemes</span>
        </NavLink>

        <NavLink
          to="/patient/my-scheme"
          className={({ isActive }) => `nav-item my-scheme-nav ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-id-card"></i>
          <span>My Government Scheme</span>
        </NavLink>

        <NavLink
          to="/patient/emergency"
          className={({ isActive }) => `nav-item emergency-nav ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-circle-plus"></i>
          <span>Emergency Help</span>
        </NavLink>

        <div className="nav-divider"></div>

        <NavLink
          to="/patient/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-user"></i>
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/patient/support"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={closeSidebar}
        >
          <i className="fa-solid fa-circle-question"></i>
          <span>Help & Support</span>
        </NavLink>

        <button type="button" className="nav-item" onClick={handleLogout} style={{ border: 'none', background: 'transparent', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
