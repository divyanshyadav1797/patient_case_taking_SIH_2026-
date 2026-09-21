import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

export default function HospitalSidebar() {
  const { isMobileNavOpen, setIsMobileNavOpen } = useHospital();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const closeSidebar = () => {
    setIsMobileNavOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Hospital Portal?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${isMobileNavOpen ? 'show' : ''}`}
        id="sidebarBackdrop"
        aria-hidden="true"
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`} id="sidebar" aria-label="Hospital Navigation">
        {/* Brand Header */}
        <div className="brand-container">
          <div className="brand-logo-wrap">
            <div className="medical-cross-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div className="brand-text-group">
              <span className="brand-name">MediCare</span>
              <span className="brand-subtitle">Hospital Portal</span>
            </div>
          </div>
          <button className="mobile-close-btn" id="mobileCloseBtn" aria-label="Close Navigation" onClick={closeSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="nav-menu" aria-label="Main Menu">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="/hospital/dashboard"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1.5"></rect>
                    <rect x="14" y="3" width="7" height="5" rx="1.5"></rect>
                    <rect x="14" y="12" width="7" height="9" rx="1.5"></rect>
                    <rect x="3" y="16" width="7" height="5" rx="1.5"></rect>
                  </svg>
                </span>
                <span className="nav-label">Dashboard</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/patients"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </span>
                <span className="nav-label">Patients</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/doctors"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" y1="8" x2="19" y2="14"></line>
                    <line x1="22" y1="11" x2="16" y2="11"></line>
                  </svg>
                </span>
                <span className="nav-label">Doctors</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/appointments"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <polyline points="9 16 11 18 15 14"></polyline>
                  </svg>
                </span>
                <span className="nav-label">Appointments</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/opd"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 3-2 4.5h19c0-1.5-.5-3.24-2-4.5"></path>
                    <path d="M12 2v10"></path>
                    <path d="M8 6h8"></path>
                    <circle cx="12" cy="8" r="6"></circle>
                  </svg>
                </span>
                <span className="nav-label">OPD</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/operations"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m14.5 9.5 5 5"></path>
                    <path d="m12 12-7 7a2.8 2.8 0 0 1-4-4l7-7"></path>
                    <path d="m18 8 2.5-2.5a2.12 2.12 0 0 0-3-3L15 5"></path>
                    <circle cx="18" cy="6" r="1"></circle>
                  </svg>
                </span>
                <span className="nav-label">Operations / OT</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/records"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                </span>
                <span className="nav-label">Medical Records</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/staff"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
                    <path d="M16 11l2 2 4-4"></path>
                  </svg>
                </span>
                <span className="nav-label">Staff</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/reports"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </span>
                <span className="nav-label">Reports</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/hospital/settings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </span>
                <span className="nav-label">Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Bottom Section: Help & Logout */}
        <div className="sidebar-bottom">
          <NavLink
            to="/hospital/help"
            className={({ isActive }) => `nav-link help-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <span className="nav-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
