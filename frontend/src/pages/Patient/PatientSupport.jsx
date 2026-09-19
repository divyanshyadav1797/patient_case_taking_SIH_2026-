import React from 'react';
import { usePatient } from '../../context/PatientContext';

export default function PatientSupport() {
  const { showToast } = usePatient();

  return (
    <div className="page active-page" id="support">
      <div className="page-header">
        <h1>Help & Support</h1>
        <p>We're here to assist you with appointment bookings, scheme claims, and platform assistance.</p>
      </div>

      <div className="support-grid">
        <div className="support-card" onClick={() => showToast('Connecting to 24/7 Patient Care Desk: 1800-180-2200...')}>
          <i className="fa-solid fa-phone"></i>
          <h3>Call Support</h3>
          <p>Talk to our dedicated clinical support team.</p>
          <button type="button">Call Support</button>
        </div>

        <div className="support-card" onClick={() => showToast('Live chatbot agent initiated. How can we help you today?')}>
          <i className="fa-solid fa-comments"></i>
          <h3>Chat With Us</h3>
          <p>Instant answers and booking help through live chat.</p>
          <button type="button">Start Chat</button>
        </div>

        <div className="support-card" onClick={() => showToast('Opened MediCare Knowledge Base and Scheme FAQs.')}>
          <i className="fa-solid fa-circle-question"></i>
          <h3>FAQs</h3>
          <p>Find answers to common questions about appointments & schemes.</p>
          <button type="button">View FAQs</button>
        </div>
      </div>
    </div>
  );
}
