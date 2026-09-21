import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import ThemeToggle from '../ThemeToggle';

export default function DoctorHeader() {
  const { doctor, globalSearch, setGlobalSearch, setIsMobileNavOpen } = useDoctor();

  return (
    <header className="top-header" role="banner">
      {/* Left: Doctor Greeting and Subtitle */}
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          id="mobileMenuBtn"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="greeting-group">
          <h1 className="doctor-greeting" id="doctorGreeting">
            {doctor.greeting}
          </h1>
          <p className="greeting-subtitle" id="doctorSubtitle">
            {doctor.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search Bar + Doctor Profile Details */}
      <div className="header-right">
        {/* Global Search Input */}
        <div className="search-box-container">
          <div className="search-icon-wrapper" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="search"
            id="patientSearchInput"
            className="search-input"
            placeholder="Search patients, appointments..."
            aria-label="Search patients and appointments"
            autoComplete="off"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button
              type="button"
              id="clearSearchBtn"
              className="clear-search-btn"
              aria-label="Clear search"
              title="Clear"
              onClick={() => setGlobalSearch('')}
            >
              &times;
            </button>
          )}
        </div>

        {/* Theme Mode Switcher */}
        <ThemeToggle />

        {/* Doctor Profile Summary */}
        <div className="doctor-profile" role="region" aria-label="Doctor Profile">
          <div className="doctor-avatar" aria-label="Doctor initials">
            <span id="doctorInitials">{doctor.initials}</span>
          </div>
          <div className="doctor-meta">
            <span className="doctor-name" id="doctorName">{doctor.name}</span>
            <span className="doctor-specialty" id="doctorSpecialty">{doctor.specialty}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
