import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

export default function HospitalHeader({ title = 'Good morning, Hospital Admin', subtitle = 'Here’s your hospital overview for today.' }) {
  const { user, logout } = useAuth();
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    globalSearch,
    setGlobalSearch,
    notifications,
    unreadCount,
    markAllRead,
    isNotifOpen,
    setIsNotifOpen,
    isAdminDropdownOpen,
    setIsAdminDropdownOpen
  } = useHospital();

  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Hospital Portal?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-toggle-btn"
          id="mobileToggleBtn"
          aria-label="Open Navigation Menu"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="greeting-container">
          <h1 className="header-title" id="pageTitle">{title}</h1>
          <p className="header-subtitle" id="pageSubtitle">{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Search Bar */}
        <div className="search-box-wrapper" role="search">
          <span className="search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            id="globalSearchInput"
            placeholder="Search patients, doctors, OT rooms..."
            autoComplete="off"
            aria-label="Global Search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button
              className="search-clear-btn"
              title="Clear search"
              onClick={() => setGlobalSearch('')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="icon-action-btn notification-btn"
            id="notificationBtn"
            aria-label="View Notifications"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsAdminDropdownOpen(false);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu notification-dropdown show" style={{ display: 'block' }}>
              <div className="dropdown-header">
                <div>
                  <h3 className="dropdown-title">Hospital Alerts</h3>
                  <span className="dropdown-subtitle">{unreadCount} unread alerts</span>
                </div>
                <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>
              </div>
              <div className="notification-list">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                    <div className={`notif-icon-circle ${notif.type === 'ot' ? 'emergency' : notif.type === 'doctor' ? 'success' : 'primary'}`}>
                      <i className="fa-solid fa-bell"></i>
                    </div>
                    <div className="notif-content">
                      <p className="notif-title">{notif.title}</p>
                      <p className="notif-desc">{notif.desc}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="profile-btn"
            id="adminProfileBtn"
            onClick={() => {
              setIsAdminDropdownOpen(!isAdminDropdownOpen);
              setIsNotifOpen(false);
            }}
          >
            <div className="admin-avatar">HA</div>
            <div className="admin-info-text">
              <span className="admin-name">{user?.name || 'SMS Hospital Jaipur'}</span>
              <span className="admin-role">Super Specialty Admin</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {isAdminDropdownOpen && (
            <div className="dropdown-menu profile-dropdown show" style={{ display: 'block' }}>
              <div className="profile-dropdown-header">
                <div className="admin-avatar-lg">HA</div>
                <div>
                  <h4 className="dropdown-admin-name">{user?.name || 'SMS Hospital Jaipur'}</h4>
                  <span className="dropdown-admin-email">{user?.email || 'admin@smshospital.org'}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <ul className="dropdown-menu-list">
                <li>
                  <button className="dropdown-option-btn" onClick={() => { navigate('/hospital/settings'); setIsAdminDropdownOpen(false); }}>
                    <i className="fa-solid fa-gear mr-2"></i> <span>Hospital Settings</span>
                  </button>
                </li>
                <li>
                  <button className="dropdown-option-btn" onClick={() => { navigate('/hospital/help'); setIsAdminDropdownOpen(false); }}>
                    <i className="fa-solid fa-circle-question mr-2"></i> <span>Help & Administration</span>
                  </button>
                </li>
              </ul>
              <div className="dropdown-divider"></div>
              <div className="dropdown-footer">
                <button className="logout-btn" onClick={handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i> <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
