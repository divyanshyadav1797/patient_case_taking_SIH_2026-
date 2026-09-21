import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, showToast } = usePatient();

  const userName = user?.name || 'Rahul Sharma';
  const firstName = userName.split(' ')[0] || 'Rahul';

  const upcomingAppointment = appointments.find((a) => (a.status || '').toLowerCase() === 'upcoming') || null;

  const initials = upcomingAppointment?.doctorName
    ? upcomingAppointment.doctorName
        .replace('Dr. ', '')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
    : 'DR';

  const handleCallEmergency = () => {
    if (window.confirm('Do you want to dial emergency helpline 112?')) {
      window.location.href = 'tel:112';
    }
  };

  return (
    <div className="page active-page" id="home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1>Good morning, {firstName}! 👋</h1>
          <p>What would you like to do today?</p>
        </div>

        <div className="health-message">
          <div className="health-illustration">
            <i className="fa-solid fa-user-doctor"></i>
          </div>
          <div>
            <strong>Your health matters to us!</strong>
            <small>Simple. Safe. Always with you.</small>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions">
        {/* Find a Doctor */}
        <button
          type="button"
          className="action-card blue"
          onClick={() => navigate('/patient/doctors')}
        >
          <div className="action-icon">
            <i className="fa-solid fa-user-doctor"></i>
          </div>
          <div className="action-text">
            <h3>Find a Doctor</h3>
            <p>Search by specialty or location</p>
          </div>
          <div className="arrow">
            <i className="fa-solid fa-arrow-right"></i>
          </div>
        </button>

        {/* Book Appointment */}
        <button
          type="button"
          className="action-card green"
          onClick={() => navigate('/patient/doctors?mode=book')}
        >
          <div className="action-icon">
            <i className="fa-regular fa-calendar-days"></i>
          </div>
          <div className="action-text">
            <h3>Book Appointment</h3>
            <p>Choose a doctor and time</p>
          </div>
          <div className="arrow">
            <i className="fa-solid fa-arrow-right"></i>
          </div>
        </button>

        {/* Health Records */}
        <button
          type="button"
          className="action-card purple"
          onClick={() => navigate('/patient/records')}
        >
          <div className="action-icon">
            <i className="fa-regular fa-file-lines"></i>
          </div>
          <div className="action-text">
            <h3>My Health Records</h3>
            <p>View reports and prescriptions</p>
          </div>
          <div className="arrow">
            <i className="fa-solid fa-arrow-right"></i>
          </div>
        </button>

        {/* Medicines */}
        <button
          type="button"
          className="action-card yellow"
          onClick={() => navigate('/patient/medicines')}
        >
          <div className="action-icon">
            <i className="fa-solid fa-pills"></i>
          </div>
          <div className="action-text">
            <h3>My Medicines</h3>
            <p>Check medicines and reminders</p>
          </div>
          <div className="arrow">
            <i className="fa-solid fa-arrow-right"></i>
          </div>
        </button>

        {/* Government Schemes */}
        <button
          type="button"
          className="action-card scheme-card"
          onClick={() => navigate('/patient/schemes')}
        >
          <div className="action-icon">
            <i className="fa-solid fa-building-columns"></i>
          </div>
          <div className="action-text">
            <h3>Government Schemes</h3>
            <p>Find scheme hospitals, doctors and benefits</p>
          </div>
          <div className="arrow">
            <i className="fa-solid fa-arrow-right"></i>
          </div>
        </button>
      </div>

      {/* Upcoming Appointment */}
      <div className="section-card">
        <div className="section-header">
          <h2>Upcoming Appointment</h2>
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate('/patient/appointments')}
          >
            View All <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {upcomingAppointment ? (
          <div className="appointment">
            <div className="doctor-avatar">
              {initials}
            </div>

            <div className="doctor-info">
              <h3>{upcomingAppointment.doctorName}</h3>
              <p>{upcomingAppointment.specialty}</p>

              <div className="appointment-details">
                <span>
                  <i className="fa-regular fa-calendar"></i>
                  {upcomingAppointment.date}
                </span>
                <span>
                  <i className="fa-regular fa-clock"></i>
                  {upcomingAppointment.time}
                </span>
                <span>
                  <i className="fa-solid fa-location-dot"></i>
                  {upcomingAppointment.hospital}
                </span>
              </div>
            </div>

            <div className="appointment-right">
              <span className="status confirmed">
                {upcomingAppointment.status || 'Confirmed'}
              </span>
              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate('/patient/appointments')}
              >
                View Details
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
            <p style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>No upcoming appointments scheduled.</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/patient/doctors')}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
            >
              <i className="fa-solid fa-calendar-plus" style={{ marginRight: '6px' }}></i>
              Book Consultation with Doctor
            </button>
          </div>
        )}
      </div>

      {/* Emergency Help Card */}
      <div className="emergency-card">
        <div className="emergency-icon">
          <i className="fa-solid fa-phone"></i>
        </div>

        <div className="emergency-text">
          <h2>Emergency Help</h2>
          <p>Need immediate medical assistance?</p>
          <small>Call now or find the nearest hospital.</small>
        </div>

        <button
          type="button"
          className="emergency-btn"
          onClick={handleCallEmergency}
        >
          <i className="fa-solid fa-phone"></i>
          Call Emergency
        </button>
      </div>
    </div>
  );
}
