import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

export default function PatientTopbar() {
  const { user } = useAuth();
  const { isMobileMenuOpen, setIsMobileMenuOpen, showToast } = usePatient();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const userName = user?.name || 'Rahul Sharma';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'RS';

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      showToast(`Searching for "${searchTerm}"...`);
      navigate(`/patient/doctors?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        id="menuBtn"
        type="button"
        aria-label="Toggle navigation menu"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      <div className="mobile-logo">
        <i className="fa-solid fa-heart-pulse"></i>
        MediCare
      </div>

      <div className="search-box">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          id="searchInput"
          placeholder="Search doctors, hospitals, services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="header-actions">
        <button
          className="notification-btn"
          id="notificationBtn"
          type="button"
          onClick={() => showToast('You have 1 new health notification.')}
          aria-label="Notifications"
        >
          <i className="fa-regular fa-bell"></i>
          <span></span>
        </button>

        <div
          className="profile-menu"
          onClick={() => navigate('/patient/profile')}
          title="View Profile"
        >
          <div className="profile-avatar">{initials}</div>
          <strong>{userName}</strong>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </div>
    </header>
  );
}
