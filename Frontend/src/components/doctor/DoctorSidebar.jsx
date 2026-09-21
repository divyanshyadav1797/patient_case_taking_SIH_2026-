import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDoctor } from '../../context/DoctorContext';

export default function DoctorSidebar() {
  const { isMobileNavOpen, setIsMobileNavOpen } = useDoctor();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const closeSidebar = () => {
    setIsMobileNavOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Doctor Portal?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileNavOpen ? 'show' : ''}`}
        id="sidebarBackdrop"
        aria-hidden="true"
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`} id="sidebar" aria-label="Main Navigation">
        {/* Brand / Logo Header */}
        <div className="brand-container">
          <div className="brand-logo-wrap">
            <div className="medical-cross-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div className="brand-text-group">
              <span className="brand-name">MediCare</span>
              <span className="brand-subtitle">Doctor Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="nav-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="/doctor/dashboard"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="12" width="7" height="9" rx="1.5" />
                    <rect x="3" y="16" width="7" height="5" rx="1.5" />
                  </svg>
                </span>
                <span className="nav-label">Dashboard</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/doctor/patients"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <span className="nav-label">Patients</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/doctor/appointments"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <span className="nav-label">Appointments</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/doctor/prescriptions"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
                  </svg>
                </span>
                <span className="nav-label">Prescriptions</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/doctor/records"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span className="nav-label">Medical Records</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/doctor/messages"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="nav-label">Messages</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/doctor/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                <span className="nav-label">Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Sidebar Bottom: Help & Logout */}
        <div className="sidebar-bottom">
          <NavLink
            to="/doctor/help"
            className={({ isActive }) => `nav-link help-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <span className="nav-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span className="nav-label">Help & Support</span>
          </NavLink>

          <button
            type="button"
            className="nav-link"
            onClick={handleLogout}
            style={{ border: 'none', background: 'transparent', width: '100%', cursor: 'pointer', marginTop: '0.25rem', color: '#DC2626' }}
          >
            <span className="nav-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
